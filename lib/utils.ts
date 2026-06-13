import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { extractPlaylistId, extractVideoId } from "@/lib/youtube";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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