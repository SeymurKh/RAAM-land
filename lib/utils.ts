import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getYouTubeEmbed(url?: string) {
  if (!url) {
    return undefined;
  }

  const videoId = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{8,})/)?.[1];
  const listId = url.match(/[?&]list=([A-Za-z0-9_-]+)/)?.[1];

  if (!videoId && !listId) {
    return undefined;
  }

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
