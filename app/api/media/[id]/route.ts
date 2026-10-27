import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { deleteMedia, getMediaItem, updateMedia } from "@/lib/db";
import { cleanupTempFiles } from "@/lib/uploads";
import { detectMediaKind, normalizeMediaItem } from "@/lib/media";
import {
  finalizeMediaFiles,
  mediaUploadDir,
  removeMediaFiles,
} from "@/lib/media-files";
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
  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!detectMediaKind(body)) {
    return NextResponse.json(
      {
        error:
          "Add a photo, video or audio file / link (YouTube, SoundCloud or Spotify)",
      },
      { status: 400 },
    );
  }

  // Новые загрузки (new-media-*) → {id}.*; устаревшие файлы записи удаляются
  const files = await finalizeMediaFiles(id, {
    url: body.url?.trim() || undefined,
    image: body.image?.trim() || undefined,
  });

  const item = await updateMedia(
    id,
    normalizeMediaItem({ ...body, id, url: files.url, image: files.image }),
  );
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

  // Файлы записи (фото/видео/аудио/постер) и temp-мусор — с диска
  await removeMediaFiles(id);
  const cleaned = await cleanupTempFiles(mediaUploadDir());
  if (cleaned.length) {
    console.log("[DELETE /api/media/:id] Cleaned temp files:", cleaned);
  }

  const deleted = await deleteMedia(id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
