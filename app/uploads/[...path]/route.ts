import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { extname, join, normalize } from "path";
import { Readable } from "stream";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOADS_ROOT = join(process.cwd(), "public", "uploads");

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

/*
 * Next.js в продакшне отдаёт из public/ только файлы, существовавшие
 * на момент сборки. Этот хендлер отдаёт файлы, загруженные в рантайме
 * (админка → /api/upload → public/uploads).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;

  // Защита от path traversal
  const rel = normalize(path.join("/")).replace(/^([/\\])+/, "");
  const filePath = join(UPLOADS_ROOT, rel);
  if (rel.startsWith("..") || !filePath.startsWith(UPLOADS_ROOT)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const st = await stat(filePath);
    if (!st.isFile()) throw new Error("not a file");

    const contentType =
      MIME[extname(filePath).toLowerCase()] ?? "application/octet-stream";

    // HTTP Range — нужен для перемотки/стартового буфера видео (iOS Safari)
    const range = request.headers.get("range");
    if (range) {
      const match = range.match(/^bytes=(\d*)-(\d*)$/);
      let start: number | undefined;
      let end: number | undefined;
      if (match) {
        if (match[1] !== "") start = parseInt(match[1], 10);
        if (match[2] !== "") end = parseInt(match[2], 10);
      }
      // суффикс-форма: bytes=-500 (последние 500 байт)
      if (match && match[1] === "" && match[2] !== "") {
        const suffix = parseInt(match[2], 10);
        start = Math.max(0, st.size - suffix);
        end = st.size - 1;
      }

      if (
        start !== undefined &&
        !Number.isNaN(start) &&
        start < st.size &&
        (end === undefined || end < st.size)
      ) {
        const chunkEnd = end ?? st.size - 1;
        const stream = Readable.toWeb(
          createReadStream(filePath, { start, end: chunkEnd }),
        ) as ReadableStream;
        return new NextResponse(stream, {
          status: 206,
          headers: {
            "Content-Type": contentType,
            "Content-Length": String(chunkEnd - start + 1),
            "Content-Range": `bytes ${start}-${chunkEnd}/${st.size}`,
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }

      // Невалидный Range — по спецификации отвечаем 416
      return new NextResponse(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${st.size}` },
      });
    }

    const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;
    return new NextResponse(stream, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(st.size),
        "Accept-Ranges": "bytes",
        // Файлы immutable: клиент добавляет ?v=<ts> для сброса кэша
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
