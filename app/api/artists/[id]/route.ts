import { unlink } from "fs/promises";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getArtist, updateArtist, deleteArtist } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const artist = await getArtist(id);
  if (!artist) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(artist);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = request.cookies.get("admin_token")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  console.log("[PUT /api/artists/:id] id:", id, "photo in body:", body.photo);

  // Если фото удалили (null), удалить файл с диска
  if (body.photo === null || body.photo === undefined) {
    const existing = await getArtist(id);
    if (existing?.photo) {
      console.log("[PUT /api/artists/:id] Deleting photo file for:", id);
      const possibleExts = ["png", "jpg", "jpeg", "webp", "gif"];
      const uploadDir = join(process.cwd(), "public", "uploads", "artists");
      for (const ext of possibleExts) {
        const filePath = join(uploadDir, `${id}.${ext}`);
        try {
          await unlink(filePath);
          console.log("[PUT /api/artists/:id] Deleted:", filePath);
        } catch {
          // Файл не существует — это нормально
        }
      }
    }
    // Преобразуем null → undefined чтобы поле не сохранялось в db.json
    body.photo = undefined;
  }

  // Если аватар удалили (null), удалить файл с диска
  if (body.avatar === null || body.avatar === undefined) {
    const existing = await getArtist(id);
    if (existing?.avatar) {
      console.log("[PUT /api/artists/:id] Deleting avatar file for:", id);
      const possibleExts = ["png", "jpg", "jpeg", "webp", "gif"];
      const uploadDir = join(process.cwd(), "public", "uploads", "artists");
      for (const ext of possibleExts) {
        const filePath = join(uploadDir, `avatar-${id}.${ext}`);
        try {
          await unlink(filePath);
          console.log("[PUT /api/artists/:id] Deleted avatar:", filePath);
        } catch {
          // Файл не существует — это нормально
        }
      }
    }
    body.avatar = undefined;
  }

  const artist = await updateArtist(id, body);
  if (!artist) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  console.log("[PUT /api/artists/:id] Saved artist:", id, "photo:", artist.photo, "avatar:", artist.avatar);
  return NextResponse.json(artist);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = request.cookies.get("admin_token")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Удаляем фото с диска
  const artist = await getArtist(id);
  if (artist?.photo) {
    console.log("[DELETE /api/artists/:id] Deleting photo for:", id);
    const possibleExts = ["png", "jpg", "jpeg", "webp", "gif"];
    const uploadDir = join(process.cwd(), "public", "uploads", "artists");
    for (const ext of possibleExts) {
      const filePath = join(uploadDir, `${id}.${ext}`);
      try {
        await unlink(filePath);
      } catch {
        // Файл не существует — это нормально
      }
    }
  }

  // Удаляем аватар с диска
  if (artist?.avatar) {
    console.log("[DELETE /api/artists/:id] Deleting avatar for:", id);
    const possibleExts = ["png", "jpg", "jpeg", "webp", "gif"];
    const uploadDir = join(process.cwd(), "public", "uploads", "artists");
    for (const ext of possibleExts) {
      const filePath = join(uploadDir, `avatar-${id}.${ext}`);
      try {
        await unlink(filePath);
      } catch {
        // Файл не существует — это нормально
      }
    }
  }

  // Clean up any orphaned temp upload files (avatar-new-*) for this artist
  // These are created by ArtistForm before the artist is saved and may be left over
  const tempExts = ["png", "jpg", "jpeg", "webp", "gif"];
  const uploadDir = join(process.cwd(), "public", "uploads", "artists");
  for (const ext of tempExts) {
    const tempPath = join(uploadDir, `avatar-new-*.${ext}`);
    try { await unlink(tempPath); } catch { /* ok */ }
  }

  const deleted = await deleteArtist(id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}