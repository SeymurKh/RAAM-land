import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getYouTubeEmbed(url?: string) {
  if (!url) {
    return undefined;
  }

  const id = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{8,})/)?.[1];
  return id ? `https://www.youtube.com/embed/${id}` : undefined;
}
