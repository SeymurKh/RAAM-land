import type { LucideIcon } from "lucide-react";

export type MediaKind = "image" | "video" | "audio";

export type SocialKind =
  | "instagram"
  | "soundcloud"
  | "spotify"
  | "youtube"
  | "linktree"
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
  visual: {
    initials: string;
    position: "high" | "middle" | "low";
    tone: string;
  };
}

export interface Project {
  id: string;
  title: string;
  category: string;
  status: "Active" | "Developing" | "Archive" | "Seasonal";
  description: string[];
  accent: string;
  column: 1 | 2 | 3 | 4 | 5;
  media?: {
    label: string;
    url?: string;
  };
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
