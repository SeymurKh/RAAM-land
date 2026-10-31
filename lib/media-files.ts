import { readdir, rename, stat, unlink } from "fs/promises";
import { join } from "path";
import { cleanUploadUrl, UPLOAD_EXTENSIONS } from "@/lib/uploads";
import type { MediaItem } from "@/types/content";

const MEDIA_FILE_EXTENSIONS = [
  ...UPLOAD_EXTENSIONS,
  "mp4",
  "webm",
  "mp3",
  "m4a",
  "ogg",
  "wav",
];

/** Директория загрузок медиа-архива. */
export function mediaUploadDir(): string {
  return join(process.cwd(), "public", "uploads", "media");
}

/** Все возможные имена файлов записи медиа (фото, видео, аудио, постер). */
export function mediaFileNames(id: string): string[] {
  const names = MEDIA_FILE_EXTENSIONS.map((ext) => id + "." + ext);
  names.push(id + "-poster.jpg");
  return names;
}

/** Удаляет файлы записи с диска, кроме перечисленных в keep. */
export async function removeMediaFiles(
  id: string,
  keep: Array<string | undefined> = [],
): Promise<void> {
  const dir = mediaUploadDir();
  const keepSet = new Set(
    keep.filter(Boolean).map((url) => cleanUploadUrl(url as string)),
  );
  for (const name of mediaFileNames(id)) {
    if (keepSet.has("/uploads/media/" + name)) continue;
    try {
      await unlink(join(dir, name));
    } catch {
      /* файла может не быть — это норма */
    }
  }
}

/**
 * Доводит загруженные файлы до постоянных имён {id}.*:
 * временные new-media-<ts>[-poster].ext переименовываются,
 * устаревшие файлы записи удаляются. Cache-buster ?v= сохраняется.
 */
export async function finalizeMediaFiles(
  id: string,
  fields: { url?: string; image?: string },
): Promise<{ url?: string; image?: string }> {
  const dir = mediaUploadDir();
  const out: { url?: string; image?: string } = { ...fields };
  const renames: Array<{
    key: "url" | "image";
    oldName: string;
    newName: string;
  }> = [];

  for (const key of ["url", "image"] as const) {
    const clean = cleanUploadUrl(fields[key]);
    if (!clean || !clean.startsWith("/uploads/media/new-media")) continue;
    const oldName = clean.split("/").pop()!;
    const newName = oldName.replace(/^new-media-\d+/, id);
    renames.push({ key, oldName, newName });
    const qs = (fields[key] ?? "").split("?")[1];
    out[key] = "/uploads/media/" + newName + (qs ? "?" + qs : "");
  }

  // Устаревшие файлы записи (всё, кроме целевых) удаляем с диска
  await removeMediaFiles(id, [out.url, out.image]);

  for (const r of renames) {
    try {
      await rename(join(dir, r.oldName), join(dir, r.newName));
    } catch {
      /* файл мог быть уже переименован */
    }
  }
  return out;
}

/** Очищенные (?v= отброшен) файловые ссылки всех записей медиа. */
export function collectMediaFileRefs(items: MediaItem[]): Set<string> {
  const refs = new Set<string>();
  for (const item of items) {
    for (const url of [item.url, item.image]) {
      const clean = cleanUploadUrl(url);
      if (clean) refs.add(clean);
    }
  }
  return refs;
}

/** Удаляет загрузки uploads/media, не упомянутые ни в одной записи (в т.ч. отменённые). */
export async function removeUnreferencedMediaFiles(keep: Set<string>): Promise<void> {
  const dir = mediaUploadDir();
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    const url = "/uploads/media/" + name;
    if (keep.has(url)) continue;
    const filePath = join(dir, name);
    try {
      const info = await stat(filePath);
      // Свежие загрузки (возможно, ещё не сохранённые) не трогаем
      if (Date.now() - info.mtimeMs < 5 * 60 * 1000) continue;
      await unlink(filePath);
      console.log("[media] Removed unreferenced upload:", filePath);
    } catch {
      // уже удалён
    }
  }
}
