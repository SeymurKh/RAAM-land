import { extractVideoId } from "@/lib/youtube";
import { getYouTubeEmbed } from "@/lib/utils";
import type { MediaItem } from "@/types/content";

/**
 * Embed-URL для модалки медиа-архива.
 * video + youtube → YouTube embed; audio → SoundCloud / Spotify player.
 */
export function getMediaEmbedUrl(item: MediaItem): string | undefined {
  if (!item.url) return undefined;

  if (item.kind === "video" && item.provider === "youtube") {
    return getYouTubeEmbed(item.url);
  }

  if (item.kind === "audio" && item.provider === "soundcloud") {
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(
      item.url,
    )}&color=%23e23b3b&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
  }

  if (item.kind === "audio" && item.provider === "spotify") {
    const match = item.url.match(
      /open\.spotify\.com\/(?:intl-[a-z]{2}\/)?([a-z]+)\/([A-Za-z0-9]+)/,
    );
    if (match) {
      return `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
    }
  }

  return undefined;
}

/**
 * Обложка карточки: загруженное изображение или YouTube-превью.
 */
export function getMediaCover(item: MediaItem): string | undefined {
  if (item.image) return item.image;

  if (item.kind === "video" && item.provider === "youtube" && item.url) {
    const id = extractVideoId(item.url);
    if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }

  return undefined;
}