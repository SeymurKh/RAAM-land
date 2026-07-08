import type { LucideIcon } from "lucide-react";

export type MediaKind = "image" | "video" | "audio";

export type SocialKind =
  | "instagram"
  | "soundcloud"
  | "spotify"
  | "youtube"
  | "linktree"
  | "apple-music"
  | "telegram"
  | "email"
  | "phone";

export interface ArtistMedia {
  id: string;
  title: string;
  kind: MediaKind;
  provider?: "youtube" | "soundcloud" | "spotify";
  url?: string;
  embedUrl?: string;
  thumbnail?: string;
}

export interface ArtistSocial {
  kind: SocialKind;
  label: string;
  url: string;
}

export interface Artist {
  id: string;
  name: string;
  origin: string;
  role: string;
  genres: string[];
  bio: string[];
  highlights: string[];
  portfolio: ArtistMedia[];
  socials: ArtistSocial[];
  photo?: string;
  imagePosition?: string;
  avatar?: string;
  avatarPosition?: string;
  visual: {
    initials: string;
    position: "high" | "middle" | "low";
    tone: string;
  };
}

export interface ProjectVideo {
  id: string;
  title: string;
  url: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  status: "Active" | "Developing" | "Archive" | "Seasonal";
  description: string[];
  accent: string;
  order: number;
  youtubeUrl?: string;
  videos?: ProjectVideo[];
  image?: string;
  imagePosition?: string;
  brightness?: number; // 0-100, default 25
}

export interface Capability {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface ContactLink {
  id: string;
  label: string;
  value: string;
  href: string;
  kind: SocialKind;
}