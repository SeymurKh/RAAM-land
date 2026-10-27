import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { createMedia, getMedia, getMediaItem } from "@/lib/db";
import {
  detectMediaKind,
  normalizeMediaItem,
  slugifyMediaId,
} from "@/lib/media";
import { finalizeMediaFiles } from "@/lib/media-files";
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

export async function POST(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  // Авто-id: слаг из названия; при коллизии — короткий суффикс
  let id = body.id?.trim() || slugifyMediaId(body.title) || "media-" + Date.now();
  if (await getMediaItem(id)) {
    id = id + "-" + Date.now().toString(36);
  }

  // Загруженные файлы (new-media-*) доводятся до постоянных имён {id}.*
  const files = await finalizeMediaFiles(id, {
    url: body.url?.trim() || undefined,
    image: body.image?.trim() || undefined,
  });

  const item = await createMedia(
    normalizeMediaItem({ ...body, id, url: files.url, image: files.image }),
  );
  return NextResponse.json(item, { status: 201 });
}
