import { readdir, unlink } from "fs/promises";

/**
 * Убирает query-string (?v=...) и hash из URL загруженного файла.
 * Клиент добавляет ?v=<timestamp> для сброса кэша в <img>,
 * но для файловых операций (rename/unlink) и хранения в БД нужен чистый путь.
 */
export function cleanUploadUrl<T extends string | null | undefined>(url: T): T {
  if (!url) return url;
  return url.split("?")[0].split("#")[0] as T;
}

/** Допустимые расширения загружаемых изображений. */
export const UPLOAD_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "gif"] as const;

/**
 * Regex-паттерны для временных (orphaned) файлов, которые создаются
 * при загрузке фото/аватара до сохранения сущности (artist / project).
 *
 * - `new-<timestamp>.ext`          — фото нового артиста
 * - `avatar-new-<timestamp>.ext`   — аватар нового артиста
 * - `new-project-<timestamp>.ext`  — изображение нового проекта
 */
const TEMP_FILE_PATTERNS = [
  /^(avatar-)?new-\d+\.(png|jpg|jpeg|webp|gif)$/i,
  /^new-project-\d+\.(png|jpg|jpeg|webp|gif)$/i,
];

/**
 * Удаляет осиротевшие temp-файлы из указанной директории.
 * Возвращает список имён удалённых файлов (для логов).
 */
export async function cleanupTempFiles(dir: string): Promise<string[]> {
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return [];
  }

  const deleted: string[] = [];

  for (const name of entries) {
    if (!TEMP_FILE_PATTERNS.some((re) => re.test(name))) continue;
    try {
      await unlink(`${dir}/${name}`);
      deleted.push(name);
    } catch {
      /* файл мог быть уже удалён — это нормально */
    }
  }

  return deleted;
}
