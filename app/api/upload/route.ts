import { writeFile, mkdir, unlink, stat } from "fs/promises";
import { existsSync } from "fs";
import { execFile } from "child_process";
import { promisify } from "util";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import ffmpegPath from "ffmpeg-static";
import { verifyToken } from "@/lib/auth";
import { UPLOAD_EXTENSIONS } from "@/lib/uploads";

const execFileAsync = promisify(execFile);

/**
 * Путь к ffmpeg-бинарю. `ffmpeg-static` резолвит через __dirname,
 * который Turbopack в dev подменяет на \ROOT — подставляем фолбэк
 * через process.cwd() (работает и в standalone-контейнере).
 */
function resolveFfmpeg(): string | null {
  const binary = process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
  const candidates = [
    ffmpegPath ?? "",
    join(process.cwd(), "node_modules", "ffmpeg-static", binary),
  ];
  for (const candidate of candidates) {
    if (candidate && existsSync(candidate)) return candidate;
  }
  return null;
}

const PHOTO_MAX_WIDTH = 1920;
const AVATAR_SIZE = 400;

/* ─── Video (hero columns 9:16) ─── */
const VIDEO_ALLOWED_TYPES = ["video/mp4", "video/webm"];
const VIDEO_EXTENSIONS = ["mp4", "webm"];
const VIDEO_MAX_BYTES = 100 * 1024 * 1024; // входной лимит 100MB
// Обрезка в 9:16 (колонка hero), H.264, без звука — фон всегда muted
const VIDEO_TARGET = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920";
// Медиа-архив: исходные пропорции (длинная сторона до 1920), звук сохраняем
const MEDIA_VIDEO_SCALE = "scale=w='if(gte(iw,ih),min(1920,iw),-2)':h='if(gte(iw,ih),-2,min(1920,ih))'";
const AUDIO_ALLOWED_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/m4a",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/aac",
  "audio/flac",
  "audio/x-flac",
];
const AUDIO_EXTENSIONS = ["mp3", "m4a", "ogg", "wav", "aac", "flac"];
const AUDIO_MAX_BYTES = 50 * 1024 * 1024; // входной лимит 50MB

export async function POST(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  if (!token || !(await verifyToken(token))) {
    console.error("[upload] Unauthorized — no valid token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const artistId = formData.get("artistId") as string | null;
  const projectId = formData.get("projectId") as string | null;
  const mediaId = formData.get("mediaId") as string | null;
  const venueKey = formData.get("venueKey") as string | null;
  const kind = formData.get("kind") as string | null; // "avatar" | "photo" | undefined

  console.log("[upload] Received:", {
    artistId,
    projectId,
    mediaId,
    venueKey,
    kind,
    fileName: file?.name,
    fileSize: file?.size,
    fileType: file?.type,
  });

  if (!file) {
    console.error("[upload] Missing file");
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  // Radio Stream Bar: venueKey (hero, logo, video-thumb, img-<ts>) → /uploads/venue
  // Media archive: mediaId → /uploads/media
  // Artists / projects — как раньше
  let subDir: string;
  let prefix: string;
  let isAvatar = false;

  if (venueKey) {
    if (!/^[a-zA-Z0-9-]{1,60}$/.test(venueKey)) {
      console.error("[upload] Invalid venueKey:", venueKey);
      return NextResponse.json({ error: "Invalid venueKey" }, { status: 400 });
    }
    subDir = "venue";
    prefix = `venue-${venueKey}`;
  } else if (mediaId) {
    if (!/^[a-zA-Z0-9-]{1,80}$/.test(mediaId)) {
      console.error("[upload] Invalid mediaId:", mediaId);
      return NextResponse.json({ error: "Invalid mediaId" }, { status: 400 });
    }
    subDir = "media";
    prefix = mediaId;
  } else if (artistId || projectId) {
    const entityId = (artistId || projectId)!;
    subDir = projectId ? "projects" : "artists";
    isAvatar = kind === "avatar" && !projectId;
    prefix = isAvatar ? `avatar-${entityId}` : entityId;
  } else {
    console.error("[upload] Missing entityId");
    return NextResponse.json(
      {
        error:
          "File and one of artistId, projectId, mediaId, venueKey are required",
      },
      { status: 400 },
    );
  }

  const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
  const isVideo = VIDEO_ALLOWED_TYPES.includes(file.type);
    const isAudio = AUDIO_ALLOWED_TYPES.includes(file.type);
    if (isVideo && !venueKey && !mediaId) {
      return NextResponse.json(
        { error: "Video uploads are supported for the venue hero and media archive only" },
        { status: 400 },
      );
    }
    if (isAudio && !mediaId) {
      return NextResponse.json(
        { error: "Audio uploads are supported for the media archive only" },
        { status: 400 },
      );
    }
    if (!isVideo && !isAudio && !allowedTypes.includes(file.type)) {
    console.error("[upload] Invalid file type:", file.type);
    return NextResponse.json(
      { error: "Only PNG, JPEG, WebP, GIF images, MP4/WebM videos or audio files are allowed" },
      { status: 400 },
    );
  }

  const maxBytes = isVideo ? VIDEO_MAX_BYTES : isAudio ? AUDIO_MAX_BYTES : 15 * 1024 * 1024;
  if (file.size > maxBytes) {
    console.error("[upload] File too large:", file.size);
    return NextResponse.json(
      {
        error: isVideo
          ? "Video size must be under 100MB"
          : isAudio
            ? "Audio size must be under 50MB"
            : "File size must be under 15MB",
      },
      { status: 400 },
    );
  }

  const uploadDir = join(process.cwd(), "public", "uploads", subDir);

  // Ensure directory exists
  await mkdir(uploadDir, { recursive: true });

  // Delete any existing file for this entity/kind (any extension)
  for (const e of [...UPLOAD_EXTENSIONS, ...VIDEO_EXTENSIONS, ...AUDIO_EXTENSIONS]) {
    const existingPath = join(uploadDir, `${prefix}.${e}`);
    try {
      await unlink(existingPath);
      console.log("[upload] Deleted old file:", existingPath);
    } catch {
      // File doesn't exist, that's fine
    }
  }
  // Старый постер видео (если был)
  try {
    await unlink(join(uploadDir, `${prefix}-poster.jpg`));
  } catch {
    // Постера нет — норма
  }

  /* ─── Видео: транскодирование через ffmpeg → mp4 (9:16, H.264, без звука) ─── */
  if (isVideo) {
    const isMediaVideo = !!mediaId;
    const ffmpeg = resolveFfmpeg();
    if (!ffmpeg) {
      console.error("[upload] ffmpeg binary not found");
      return NextResponse.json(
        { error: "Video processing unavailable" },
        { status: 500 },
      );
    }

    const inputPath = join(uploadDir, `${prefix}-src.tmp`);
    const fileName = `${prefix}.mp4`;
    const filePath = join(uploadDir, fileName);
    const posterName = `${prefix}-poster.jpg`;
    const posterPath = join(uploadDir, posterName);

    // Сохраняем оригинал во временный файл (ffmpeg работает с файлом)
    const inputBuffer = Buffer.from(await file.arrayBuffer());
    await writeFile(inputPath, inputBuffer);

    try {
      const started = Date.now();
      await execFileAsync(
        ffmpeg,
        [
          "-y",
          "-i",
          inputPath,
          "-vf",
          isMediaVideo ? MEDIA_VIDEO_SCALE : VIDEO_TARGET,
          "-c:v",
          "libx264",
          "-preset",
          "veryfast",
          "-crf",
          "28",
          "-pix_fmt", "yuv420p",
          "-r",
          "30",
          ...(isMediaVideo ? ["-c:a", "aac", "-b:a", "128k"] : ["-an"]),
          "-movflags",
          "+faststart",
          filePath,
        ],
        { maxBuffer: 32 * 1024 * 1024 },
      );

      // Постер — первый кадр обработанного видео
      await execFileAsync(
        ffmpeg,
        ["-y", "-i", filePath, "-frames:v", "1", "-q:v", "4", posterPath],
        { maxBuffer: 32 * 1024 * 1024 },
      );

      const outSize = (await stat(filePath)).size;
      const saved = inputBuffer.length > 0
        ? ((1 - outSize / inputBuffer.length) * 100).toFixed(0)
        : 0;
      console.log(
        `[upload] Video saved: ${filePath} | original: ${inputBuffer.length} → ${outSize} (${saved}% saved) in ${Date.now() - started}ms`,
      );

      return NextResponse.json({
        url: `/uploads/${subDir}/${fileName}`,
        poster: `/uploads/${subDir}/${posterName}`,
      });
    } catch (err) {
      console.error("[upload] Video processing failed:", err);
      for (const p of [filePath, posterPath]) {
        try {
          await unlink(p);
        } catch {
          // Могло не создаться
        }
      }
      return NextResponse.json(
        { error: "Video processing failed" },
        { status: 500 },
      );
    } finally {
      try {
        await unlink(inputPath);
      } catch {
        // tmp
      }
    }
  }

  /* ─── Аудио (медиа-архив): конвертация в mp3 ─── */
  if (isAudio) {
    const ffmpeg = resolveFfmpeg();
    if (!ffmpeg) {
      console.error("[upload] ffmpeg binary not found");
      return NextResponse.json(
        { error: "Audio processing unavailable" },
        { status: 500 },
      );
    }

    const inputPath = join(uploadDir, `${prefix}-src.tmp`);
    const fileName = `${prefix}.mp3`;
    const filePath = join(uploadDir, fileName);
    const inputBuffer = Buffer.from(await file.arrayBuffer());
    await writeFile(inputPath, inputBuffer);

    try {
      const started = Date.now();
      await execFileAsync(
        ffmpeg,
        ["-y", "-i", inputPath, "-vn", "-codec:a", "libmp3lame", "-b:a", "192k", filePath],
        { maxBuffer: 32 * 1024 * 1024 },
      );
      const outSize = (await stat(filePath)).size;
      console.log(
        `[upload] Audio saved: ${filePath} | original: ${inputBuffer.length} → ${outSize} in ${Date.now() - started}ms`,
      );
      return NextResponse.json({ url: `/uploads/${subDir}/${fileName}` });
    } catch (err) {
      console.error("[upload] Audio processing failed:", err);
      try {
        await unlink(filePath);
      } catch {
        // Могло не создаться
      }
      return NextResponse.json(
        { error: "Audio processing failed" },
        { status: 500 },
      );
    } finally {
      try {
        await unlink(inputPath);
      } catch {
        // tmp
      }
    }
  }

  // Dynamically import sharp to avoid conflict with next/og (both use libvips)
  const sharp = (await import("sharp")).default;

  // Process image with sharp: always output JPEG for size control
  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${prefix}.jpg`;
  const filePath = join(uploadDir, fileName);

  const SIZE_LIMIT = 1_000_000;

  // Build pipeline: apply EXIF orientation + resize + JPEG encoding
  let pipeline = sharp(inputBuffer).rotate().jpeg({ quality: 85, mozjpeg: true });

  if (isAvatar) {
    pipeline = pipeline.resize(AVATAR_SIZE, AVATAR_SIZE, { fit: "cover" });
  } else {
    pipeline = pipeline.resize(PHOTO_MAX_WIDTH, undefined, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  let outputBuffer = await pipeline.toBuffer();

  // Adaptive quality reduction: try lower quality if > SIZE_LIMIT
  if (outputBuffer.length > SIZE_LIMIT) {
    for (const q of [80, 75, 70, 65]) {
      pipeline = sharp(inputBuffer).rotate().jpeg({ quality: q, mozjpeg: true });
      if (isAvatar) {
        pipeline = pipeline.resize(AVATAR_SIZE, AVATAR_SIZE, { fit: "cover" });
      } else {
        pipeline = pipeline.resize(PHOTO_MAX_WIDTH, undefined, {
          fit: "inside",
          withoutEnlargement: true,
        });
      }
      outputBuffer = await pipeline.toBuffer();
      if (outputBuffer.length <= SIZE_LIMIT) break;
    }
  }

  // Last resort: reduce dimensions
  if (outputBuffer.length > SIZE_LIMIT) {
    const fallbackW = isAvatar ? 300 : 1600;
    pipeline = sharp(inputBuffer).rotate().jpeg({ quality: 70, mozjpeg: true });
    if (isAvatar) {
      pipeline = pipeline.resize(fallbackW, fallbackW, { fit: "cover" });
    } else {
      pipeline = pipeline.resize(fallbackW, undefined, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }
    outputBuffer = await pipeline.toBuffer();
  }

  await writeFile(filePath, outputBuffer);

  const compression = inputBuffer.length > 0
    ? ((1 - outputBuffer.length / inputBuffer.length) * 100).toFixed(0)
    : 0;
  console.log("[upload] Saved:", filePath, "| original:", inputBuffer.length, "→ compressed:", outputBuffer.length, `(${compression}% saved)`, outputBuffer.length > SIZE_LIMIT ? "⚠ OVER LIMIT" : "✓");

  const url = `/uploads/${subDir}/${fileName}`;
  console.log("[upload] Returning URL:", url);
  return NextResponse.json({ url });
}
