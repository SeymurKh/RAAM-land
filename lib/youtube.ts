const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

interface LiveStreamResult {
  isLive: boolean;
  videoId: string | null;
  title: string;
}

interface PlaylistInfo {
  title: string;
  thumbnail: string;
  count: number;
}

/**
 * Check if the channel has an active live broadcast.
 */
export async function getLiveStream(
  apiKey: string,
  channelId: string,
): Promise<LiveStreamResult> {
  const url = new URL(`${YOUTUBE_API_BASE}/search`);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("channelId", channelId);
  url.searchParams.set("eventType", "live");
  url.searchParams.set("type", "video");
  url.searchParams.set("order", "date");
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());

  if (!res.ok) {
    console.error("[youtube] getLiveStream failed:", res.status, await res.text());
    return { isLive: false, videoId: null, title: "" };
  }

  const data = await res.json();
  const items = data.items ?? [];

  if (items.length > 0) {
    return {
      isLive: true,
      videoId: items[0].id.videoId as string,
      title: items[0].snippet.title as string,
    };
  }

  return { isLive: false, videoId: null, title: "" };
}

/**
 * Get playlist metadata: title, thumbnail, video count.
 */
export async function getPlaylistInfo(
  apiKey: string,
  playlistId: string,
): Promise<PlaylistInfo | null> {
  const url = new URL(`${YOUTUBE_API_BASE}/playlists`);
  url.searchParams.set("part", "snippet,contentDetails");
  url.searchParams.set("id", playlistId);
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());

  if (!res.ok) {
    console.error("[youtube] getPlaylistInfo failed:", res.status, await res.text());
    return null;
  }

  const data = await res.json();
  const item = data.items?.[0];

  if (!item) return null;

  return {
    title: item.snippet.title as string,
    thumbnail: (item.snippet.thumbnails?.medium?.url ?? item.snippet.thumbnails?.default?.url ?? "") as string,
    count: item.contentDetails.itemCount as number,
  };
}

/**
 * Get the first video ID from a playlist.
 */
export async function getFirstPlaylistVideo(
  apiKey: string,
  playlistId: string,
): Promise<string | null> {
  const url = new URL(`${YOUTUBE_API_BASE}/playlistItems`);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("playlistId", playlistId);
  url.searchParams.set("maxResults", "1");
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());

  if (!res.ok) {
    console.error("[youtube] getFirstPlaylistVideo failed:", res.status);
    return null;
  }

  const data = await res.json();
  const item = data.items?.[0];
  return item?.snippet?.resourceId?.videoId ?? null;
}

/**
 * Extract playlist ID from a YouTube URL.
 * Supports: /playlist?list=, /watch?v=...&list=, /embed/videoseries?list=
 */
export function extractPlaylistId(url: string): string | null {
  const match = url.match(/[?&]list=([A-Za-z0-9_-]+)/);
  return match?.[1] ?? null;
}

/**
 * Extract video ID from a YouTube URL.
 * Supports: /watch?v=, youtu.be/, /embed/
 */
export function extractVideoId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{8,})/);
  return match?.[1] ?? null;
}