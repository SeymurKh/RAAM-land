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
};

/*
 * Next.js в продакшне отдаёт из public/ только файлы, существовавшие
 * на момент сборки. Этот хендлер отдаёт файлы, загруженные в рантайме
 * (админка → /api/upload → public/uploads).
 */
export async function GET(
  _request: NextRequest,
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

    const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;
    return new NextResponse(stream, {
      headers: {
        "Content-Type":
          MIME[extname(filePath).toLowerCase()] ?? "application/octet-stream",
        "Content-Length": String(st.size),
        // Файлы immutable: клиент добавляет ?v=<ts> для сброса кэша
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
