import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { extractPlaylistId, extractVideoId } from "@/lib/youtube";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parse image position string "X% Y% Z" into { x, y, zoom }.
 * Falls back to "50% 50%" with no zoom.
 */
export function parseImagePosition(
  value?: string,
): { position: string; zoom: number } {
  if (!value) return { position: "50% 50%", zoom: 1 };
  const parts = value.split(" ");
  return {
    position: `${parts[0] || "50%"} ${parts[1] || "50%"}`,
    zoom: parseFloat(parts[2]) || 1,
  };
}

export function getYouTubeEmbed(url?: string) {
  if (!url) return undefined;

  const videoId = extractVideoId(url);
  const listId = extractPlaylistId(url);

  if (!videoId && !listId) return undefined;

  const params: string[] = ["autoplay=0"];
  let embedUrl = "https://www.youtube.com/embed/";

  if (videoId) {
    embedUrl += videoId;
  } else if (listId) {
    embedUrl += "videoseries";
  }

  if (listId) {
    params.push(`list=${listId}`);
  }

  return `${embedUrl}?${params.join("&")}`;
}