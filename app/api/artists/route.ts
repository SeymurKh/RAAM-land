import { rename, unlink } from "fs/promises";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getArtists, createArtist } from "@/lib/db";
import type { Artist } from "@/types/content";

export async function GET() {
  const artists = await getArtists();
  return NextResponse.json(artists);
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Artist;
  if (!body.id || !body.name) {
    return NextResponse.json({ error: "id and name are required" }, { status: 400 });
  }

  // Если фото было загружено с временным именем (new-xxx), переименовываем файл
  if (body.photo && body.photo.includes("/uploads/artists/new-")) {
    const uploadDir = join(process.cwd(), "public", "uploads", "artists");
    const oldFileName = body.photo.split("/").pop()!;
    const ext = oldFileName.split(".").pop()!;
    const newFileName = `${body.id}.${ext}`;
    const oldPath = join(uploadDir, oldFileName);
    const newPath = join(uploadDir, newFileName);

    try {
      // Удаляем старый файл артиста если есть (другое расширение)
      const possibleExts = ["png", "jpg", "jpeg", "webp", "gif"];
      for (const e of possibleExts) {
        if (e === ext) continue; // Не удалять файл который сейчас переименуем
        const existingPath = join(uploadDir, `${body.id}.${e}`);
        try { await unlink(existingPath); } catch { /* ok */ }
      }
      await rename(oldPath, newPath);
      body.photo = `/uploads/artists/${newFileName}`;
      console.log("[POST /api/artists] Renamed photo:", oldFileName, "→", newFileName);
    } catch (err) {
      console.error("[POST /api/artists] Failed to rename photo:", err);
      // Продолжаем — фото может не существовать если загрузка не удалась
    }
  }

  // photo: null → undefined (не сохранять поле в db.json)
  if (body.photo === null) {
    body.photo = undefined;
  }

  console.log("[POST /api/artists] Creating artist:", body.id, "photo:", body.photo);
  const artist = await createArtist(body);
  return NextResponse.json(artist, { status: 201 });
}
