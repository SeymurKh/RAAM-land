import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const artistId = formData.get("artistId") as string | null;

  if (!file || !artistId) {
    return NextResponse.json(
      { error: "File and artistId are required" },
      { status: 400 },
    );
  }

  const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Only PNG, JPEG, WebP, and GIF images are allowed" },
      { status: 400 },
    );
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File size must be under 5MB" },
      { status: 400 },
    );
  }

  const ext = file.name.split(".").pop() ?? "png";
  const uploadDir = join(process.cwd(), "public", "uploads", "artists");

  // Ensure directory exists
  await mkdir(uploadDir, { recursive: true });

  // Delete any existing banner for this artist (any extension)
  const possibleExts = ["png", "jpg", "jpeg", "webp", "gif"];
  for (const e of possibleExts) {
    const existingPath = join(uploadDir, `${artistId}.${e}`);
    try {
      await unlink(existingPath);
    } catch {
      // File doesn't exist, that's fine
    }
  }

  const fileName = `${artistId}.${ext}`;
  const filePath = join(uploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const url = `/uploads/artists/${fileName}`;
  return NextResponse.json({ url });
}
