import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

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
  const entityId = artistId || projectId;
  const subDir = projectId ? "projects" : "artists";

  console.log("[upload] Received:", {
    artistId,
    projectId,
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

  if (file.size > 5 * 1024 * 1024) {
    console.error("[upload] File too large:", file.size);
    return NextResponse.json(
      { error: "File size must be under 5MB" },
      { status: 400 },
    );
  }

  const ext = file.name.split(".").pop() ?? "png";
  const uploadDir = join(process.cwd(), "public", "uploads", subDir);

  // Ensure directory exists
  await mkdir(uploadDir, { recursive: true });

  // Delete any existing photo for this entity (any extension)
  const possibleExts = ["png", "jpg", "jpeg", "webp", "gif"];
  for (const e of possibleExts) {
    const existingPath = join(uploadDir, `${entityId}.${e}`);
    try {
      await unlink(existingPath);
      console.log("[upload] Deleted old file:", existingPath);
    } catch {
      // File doesn't exist, that's fine
    }
  }

  const fileName = `${entityId}.${ext}`;
  const filePath = join(uploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  console.log("[upload] Saved file:", filePath, "size:", buffer.length);

  const url = `/uploads/${subDir}/${fileName}`;
  console.log("[upload] Returning URL:", url);
  return NextResponse.json({ url });
}