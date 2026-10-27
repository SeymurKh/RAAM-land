import { rename, unlink } from "fs/promises";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { deleteMedia, getMediaItem, updateMedia } from "@/lib/db";
import { cleanUploadUrl, cleanupTempFiles, UPLOAD_EXTENSIONS } from "@/lib/uploads";
import type { MediaItem } from "@/types/content";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const item = await getMediaItem(id);
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(item);
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
  const body = (await request.json()) as MediaItem;

  // Сохраняем оригинальный URL (с ?v=...) для записи в базу
  const imageForDb = body.image;
  // Чистый путь нужен только для fs-операций
  body.image = cleanUploadUrl(body.image);

  // Переименовываем временный файл, если изображение загружалось до сохранения
  if (body.image && body.image.includes("/uploads/media/new-media")) {
    const uploadDir = join(process.cwd(), "public", "uploads", "media");
    const oldFileName = body.image.split("/").pop()!;
    const ext = oldFileName.split(".").pop()!;
    const newFileName = `${id}.${ext}`;

    try {
      // Удаляем старый файл если есть (другое расширение)
      for (const e of UPLOAD_EXTENSIONS) {
        if (e === ext) continue;
        const existingPath = join(uploadDir, `${id}.${e}`);
        try { await unlink(existingPath); } catch { /* ok */ }
      }
      await rename(join(uploadDir, oldFileName), join(uploadDir, newFileName));
      body.image = `/uploads/media/${newFileName}`;
    } catch {
      // Продолжаем — файл может не существовать
    }
  }

  // Восстанавливаем оригинальный URL (с ?v=...) для записи в базу
  if (imageForDb && body.image) {
    const qs = imageForDb.split("?")[1];
    body.image = qs ? `${body.image}?${qs}` : body.image;
  }

  const item = await updateMedia(id, normalizeMedia(body));
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(item);
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

  // Delete image file from disk
  const item = await getMediaItem(id);
  const uploadDir = join(process.cwd(), "public", "uploads", "media");

  if (item?.image) {
    for (const ext of UPLOAD_EXTENSIONS) {
      const filePath = join(uploadDir, `${id}.${ext}`);
      try { await unlink(filePath); } catch { /* ok */ }
    }
  }

  // Чистим осиротевшие temp-файлы (new-media-*)
  const cleaned = await cleanupTempFiles(uploadDir);
  if (cleaned.length) {
    console.log("[DELETE /api/media/:id] Cleaned temp files:", cleaned);
  }

  const deleted = await deleteMedia(id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
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