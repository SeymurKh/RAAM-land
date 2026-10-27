import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { UPLOAD_EXTENSIONS } from "@/lib/uploads";

const PHOTO_MAX_WIDTH = 1920;
const AVATAR_SIZE = 400;

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
  if (!allowedTypes.includes(file.type)) {
    console.error("[upload] Invalid file type:", file.type);
    return NextResponse.json(
      { error: "Only PNG, JPEG, WebP, and GIF images are allowed" },
      { status: 400 },
    );
  }

  if (file.size > 5 * 1024 * 1024) {
    console.error("[upload] File too large:", file.size);
    return NextResponse.json(
      { error: "File size must be under 5MB" },
      { status: 400 },
    );
  }

  const uploadDir = join(process.cwd(), "public", "uploads", subDir);

  // Ensure directory exists
  await mkdir(uploadDir, { recursive: true });

  // Delete any existing file for this entity/kind (any extension)
  for (const e of UPLOAD_EXTENSIONS) {
    const existingPath = join(uploadDir, `${prefix}.${e}`);
    try {
      await unlink(existingPath);
      console.log("[upload] Deleted old file:", existingPath);
    } catch {
      // File doesn't exist, that's fine
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
