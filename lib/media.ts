import { extractVideoId } from "@/lib/youtube";
import { getYouTubeEmbed } from "@/lib/utils";
import type {
  ArchiveMediaKind,
  ArchiveMediaProvider,
  MediaItem,
} from "@/types/content";

/** Локальный загруженный файл (не внешний сервис). */
export function isLocalUpload(url?: string): boolean {
  return !!url && url.startsWith("/uploads/");
}

/** Определяет сервис и тип контента по внешней ссылке. */
export function detectProviderFromUrl(
  url: string,
): { kind: "video" | "audio"; provider: ArchiveMediaProvider } | undefined {
  const value = url.trim();
  if (/youtube\.com|youtu\.be/.test(value))
    return { kind: "video", provider: "youtube" };
  if (/soundcloud\.com/.test(value))
    return { kind: "audio", provider: "soundcloud" };
  if (/open\.spotify\.com/.test(value))
    return { kind: "audio", provider: "spotify" };
  return undefined;
}

/** Определяет тип контента по расширению загруженного файла. */
export function detectKindFromFileUrl(
  url: string,
): ArchiveMediaKind | undefined {
  const clean = url.split("?")[0].toLowerCase();
  if (/\.(jpe?g|png|webp|gif)$/.test(clean)) return "photo";
  if (/\.(mp4|webm|mov|m4v)$/.test(clean)) return "video";
  if (/\.(mp3|m4a|ogg|wav|flac|aac)$/.test(clean)) return "audio";
  return undefined;
}

/** Итоговый тип и провайдер записи по её содержимому (ссылка или файл). */
export function detectMediaKind(item: {
  url?: string;
  image?: string;
}): { kind: ArchiveMediaKind; provider?: ArchiveMediaProvider } | undefined {
  if (item.url && isLocalUpload(item.url)) {
    const kind = detectKindFromFileUrl(item.url);
    return kind ? { kind } : undefined;
  }
  if (item.url) {
    const detected = detectProviderFromUrl(item.url);
    return detected
      ? { kind: detected.kind, provider: detected.provider }
      : undefined;
  }
  if (item.image) return { kind: "photo" };
  return undefined;
}

/** Нормализация записи: тип/провайдер выводятся из содержимого автоматически. */
export function normalizeMediaItem(item: MediaItem): MediaItem {
  const detected = detectMediaKind(item);
  return {
    id: item.id,
    title: (item.title ?? "").trim(),
    date: item.date?.trim() || new Date().toISOString().slice(0, 10),
    kind: detected?.kind ?? "photo",
    provider: detected?.provider,
    url: item.url?.trim() || undefined,
    image: item.image?.trim() || undefined,
  };
}

/** Формат даты для карточек: "14 Jun 2026". */
export function formatMediaDate(date: string): string {
  const parsed = new Date(date + "T00:00:00");
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Слаг для авто-id записи медиа. */
export function slugifyMediaId(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Embed-URL для модалки медиа-архива (внешние сервисы).
 * video + youtube → YouTube embed; audio → SoundCloud / Spotify player.
 * Локальные файлы воспроизводятся напрямую — embed не нужен.
 */
export function getMediaEmbedUrl(item: MediaItem): string | undefined {
  if (!item.url || isLocalUpload(item.url)) return undefined;

  if (item.kind === "video" && item.provider === "youtube") {
    return getYouTubeEmbed(item.url);
  }

  if (item.kind === "audio" && item.provider === "soundcloud") {
    return (
      "https://w.soundcloud.com/player/?url=" +
      encodeURIComponent(item.url) +
      "&color=%23E82919&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false"
    );
  }

  if (item.kind === "audio" && item.provider === "spotify") {
    const match = item.url.match(
      /open\.spotify\.com\/(?:intl-[a-z]{2}\/)?([a-z]+)\/([A-Za-z0-9]+)/,
    );
    if (match) {
      return "https://open.spotify.com/embed/" + match[1] + "/" + match[2];
    }
  }

  return undefined;
}

/** Обложка карточки: загруженное изображение, постер или YouTube-превью. */
export function getMediaCover(item: MediaItem): string | undefined {
  if (item.image) return item.image;

  if (item.kind === "video" && item.provider === "youtube" && item.url) {
    const id = extractVideoId(item.url);
    if (id) return "https://img.youtube.com/vi/" + id + "/hqdefault.jpg";
  }

  return undefined;
}
