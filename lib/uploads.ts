/**
 * Убирает query-string (?v=...) и hash из URL загруженного файла.
 * Клиент добавляет ?v=<timestamp> для сброса кэша в <img>,
 * но для файловых операций (rename/unlink) и хранения в БД нужен чистый путь.
 */
export function cleanUploadUrl<T extends string | null | undefined>(url: T): T {
  if (!url) return url;
  return url.split("?")[0].split("#")[0] as T;
}
