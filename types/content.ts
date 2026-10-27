import type { LucideIcon } from "lucide-react";

export type MediaKind = "image" | "video" | "audio";

export type SocialKind =
  | "instagram"
  | "soundcloud"
  | "spotify"
  | "youtube"
  | "twitch"
  | "mixcloud"
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

/* ─── Radio Stream Bar (venue page) ─── */

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: string;
  order: number;
}

export interface MenuCategory {
  id: string;
  title: string;
  order: number;
  items: MenuItem[];
}

export interface VenueImage {
  id: string;
  src: string;
  alt?: string;
}

export interface VenuePlatform {
  kind: SocialKind;
  label: string;
  url: string;
}

export interface VenueCTA {
  label: string;
  href: string;
}

export interface VenuePageContent {
  name: string;
  headline: string;
  tags: string[];
  logo?: string;
  heroImage?: string;
  live: {
    eyebrow: string;
    title: string;
    description: string[];
    platforms: VenuePlatform[];
  };
  events: {
    eyebrow: string;
    title: string;
    description: string[];
    manifesto: string[];
    cta: VenueCTA;
    gallery: VenueImage[];
  };
  bar: {
    eyebrow: string;
    title: string;
    description: string[];
    images: VenueImage[];
    menu: MenuCategory[];
  };
  contacts: {
    address: string;
    hours: string;
  };
}

/* ─── Media archive (grows over time) ─── */

export type ArchiveMediaKind = "photo" | "video" | "audio";
export type ArchiveMediaProvider = "youtube" | "soundcloud" | "spotify";

export interface MediaItem {
  id: string;
  title: string;
  date: string; // ISO date "YYYY-MM-DD"
  kind: ArchiveMediaKind;
  provider?: ArchiveMediaProvider;
  url?: string;
  image?: string;
  order: number;
}