import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

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
  const kind = formData.get("kind") as string | null; // "avatar" | "photo" | undefined
  const entityId = artistId || projectId;
  const subDir = projectId ? "projects" : "artists";

  console.log("[upload] Received:", {
    artistId,
    projectId,
    kind,
    fileName: file?.name,
    fileSize: file?.size,
    fileType: file?.type,
  });

  if (!file || !entityId) {
    console.error("[upload] Missing file or entityId");
    return NextResponse.json(
      { error: "File and artistId or projectId are required" },
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

  if (file.size > 8 * 1024 * 1024) {
    console.error("[upload] File too large:", file.size);
    return NextResponse.json(
      { error: "File size must be under 8MB" },
      { status: 400 },
    );
  }

  const uploadDir = join(process.cwd(), "public", "uploads", subDir);

  // Ensure directory exists
  await mkdir(uploadDir, { recursive: true });

  // Determine file name prefix
  const isAvatar = kind === "avatar" && !projectId;
  const prefix = isAvatar ? `avatar-${entityId}` : entityId;

  // Delete any existing file for this entity/kind (any extension)
  const possibleExts = ["png", "jpg", "jpeg", "webp", "gif"];
  for (const e of possibleExts) {
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
