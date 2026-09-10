import { rename, unlink } from "fs/promises";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getArtists, createArtist } from "@/lib/db";
import { cleanUploadUrl, UPLOAD_EXTENSIONS } from "@/lib/uploads";
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

  // Сохраняем оригинальные URL (с ?v=...) для записи в базу
  const photoForDb = body.photo;
  const avatarForDb = body.avatar;
  // Чистые пути нужны только для fs-операций
  body.photo = cleanUploadUrl(body.photo);
  body.avatar = cleanUploadUrl(body.avatar);

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
      for (const e of UPLOAD_EXTENSIONS) {
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

  // Если аватар был загружен с временным именем (avatar-new-xxx), переименовываем файл
  if (body.avatar && body.avatar.includes("/uploads/artists/avatar-new-")) {
    const avatarUploadDir = join(process.cwd(), "public", "uploads", "artists");
    const avatarOldFileName = body.avatar.split("/").pop()!;
    const avatarExt = avatarOldFileName.split(".").pop()!;
    const avatarNewFileName = `avatar-${body.id}.${avatarExt}`;
    const avatarOldPath = join(avatarUploadDir, avatarOldFileName);
    const avatarNewPath = join(avatarUploadDir, avatarNewFileName);

    try {
      // Удаляем старый аватар если есть (другое расширение)
      for (const e of UPLOAD_EXTENSIONS) {
        if (e === avatarExt) continue;
        const existingPath = join(avatarUploadDir, `avatar-${body.id}.${e}`);
        try { await unlink(existingPath); } catch { /* ok */ }
      }
      await rename(avatarOldPath, avatarNewPath);
      body.avatar = `/uploads/artists/${avatarNewFileName}`;
      console.log("[POST /api/artists] Renamed avatar:", avatarOldFileName, "→", avatarNewFileName);
    } catch (err) {
      console.error("[POST /api/artists] Failed to rename avatar:", err);
    }
  }

  // Восстанавливаем оригинальные URL (с ?v=...) для записи в базу.
  // Если фото было переименовано — берём новый путь + оригинальный ?v=.
  if (photoForDb && body.photo && body.photo !== cleanUploadUrl(photoForDb)) {
    // Фото было переименовано (new-xxx → id.ext) — добавляем ?v= к новому пути
    const qs = photoForDb.split("?")[1];
    body.photo = qs ? `${body.photo}?${qs}` : body.photo;
  } else if (photoForDb) {
    body.photo = photoForDb;
  }

  if (avatarForDb && body.avatar && body.avatar !== cleanUploadUrl(avatarForDb)) {
    const qs = avatarForDb.split("?")[1];
    body.avatar = qs ? `${body.avatar}?${qs}` : body.avatar;
  } else if (avatarForDb) {
    body.avatar = avatarForDb;
  }

  console.log("[POST /api/artists] Creating artist:", body.id, "photo:", body.photo);
  const artist = await createArtist(body);
  return NextResponse.json(artist, { status: 201 });
}