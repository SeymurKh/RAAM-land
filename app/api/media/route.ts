import { rename, unlink } from "fs/promises";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { createMedia, getMedia } from "@/lib/db";
import { cleanUploadUrl, UPLOAD_EXTENSIONS } from "@/lib/uploads";
import type { MediaItem } from "@/types/content";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const kind = searchParams.get("kind");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 12));

  const all = await getMedia();
  const filtered =
    kind && kind !== "all" ? all.filter((item) => item.kind === kind) : all;
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);

  return NextResponse.json({
    items,
    total: filtered.length,
    page,
    hasMore: start + items.length < filtered.length,
  });
}

function normalizeMedia(item: MediaItem): MediaItem {
  return {
    ...item,
    title: item.title.trim(),
    date: item.date?.trim() || new Date().toISOString().slice(0, 10),
    kind: item.kind === "photo" || item.kind === "audio" ? item.kind : "video",
    provider: (item.provider?.trim() || undefined) as
      | MediaItem["provider"]
      | undefined,
    url: item.url?.trim() || undefined,
    image: item.image?.trim() || undefined,
    order: Number(item.order) || 0,
  };
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as MediaItem;
  if (!body.id || !body.title) {
    return NextResponse.json(
      { error: "id and title are required" },
      { status: 400 },
    );
  }

  // Сохраняем оригинальный URL (с ?v=...) для записи в базу
  const imageForDb = body.image;
  // Чистый путь нужен только для fs-операций
  body.image = cleanUploadUrl(body.image);

  // Если изображение было загружено с временным именем (new-media-xxx), переименовываем
  if (body.image && body.image.includes("/uploads/media/new-media")) {
    const uploadDir = join(process.cwd(), "public", "uploads", "media");
    const oldFileName = body.image.split("/").pop()!;
    const ext = oldFileName.split(".").pop()!;
    const newFileName = `${body.id}.${ext}`;
    const oldPath = join(uploadDir, oldFileName);
    const newPath = join(uploadDir, newFileName);

    try {
      for (const e of UPLOAD_EXTENSIONS) {
        if (e === ext) continue;
        const existingPath = join(uploadDir, `${body.id}.${e}`);
        try { await unlink(existingPath); } catch { /* ok */ }
      }
      await rename(oldPath, newPath);
      body.image = `/uploads/media/${newFileName}`;
    } catch {
      // Продолжаем — файл может не существовать
    }
  }

  // Восстанавливаем оригинальный URL (с ?v=...) для записи в базу
  if (imageForDb && body.image) {
    const qs = imageForDb.split("?")[1];
    body.image = qs ? `${body.image}?${qs}` : body.image;
  } else if (imageForDb) {
    body.image = imageForDb;
  }

  const item = await createMedia(normalizeMedia(body));
  return NextResponse.json(item, { status: 201 });
}
