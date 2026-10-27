import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getVenue, updateVenue } from "@/lib/db";
import type {
  MenuCategory,
  MenuItem,
  VenueCTA,
  VenueImage,
  VenuePageContent,
  VenuePlatform,
} from "@/types/content";

export async function GET() {
  const venue = await getVenue();
  return NextResponse.json(venue);
}

export async function PUT(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<VenuePageContent>;
  const venue = await updateVenue(normalizeVenue(body));
  return NextResponse.json(venue);
}

/* ─── Normalization helpers ─── */

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function opt(value: unknown): string | undefined {
  return str(value) || undefined;
}

function strList(value: unknown): string[] {
  return Array.isArray(value) ? value.map(str).filter(Boolean) : [];
}

function normalizeCta(value: unknown): VenueCTA {
  const cta = (value ?? {}) as Partial<VenueCTA>;
  return { label: str(cta.label), href: str(cta.href) };
}

function normalizeImages(value: unknown): VenueImage[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry, index) => {
      const img = (entry ?? {}) as Partial<VenueImage>;
      return {
        id: str(img.id) || `img-${index + 1}`,
        src: str(img.src),
        alt: opt(img.alt),
      };
    })
    .filter((img) => img.src);
}

function normalizePlatforms(value: unknown): VenuePlatform[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      const platform = (entry ?? {}) as Partial<VenuePlatform>;
      return {
        kind: platform.kind ?? "youtube",
        label: str(platform.label),
        url: str(platform.url),
      };
    })
    .filter((platform) => platform.label && platform.url);
}

function normalizeMenu(value: unknown): MenuCategory[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry, categoryIndex) => {
      const category = (entry ?? {}) as Partial<MenuCategory> & {
        items?: unknown;
      };
      const items: MenuItem[] = Array.isArray(category.items)
        ? category.items
            .map((itemEntry, itemIndex) => {
              const item = (itemEntry ?? {}) as Partial<MenuItem>;
              return {
                id: str(item.id) || `item-${itemIndex + 1}`,
                name: str(item.name),
                description: opt(item.description),
                price: str(item.price),
                order: Number(item.order) || itemIndex + 1,
              };
            })
            .filter((item) => item.name && item.price)
        : [];
      return {
        id: str(category.id) || `category-${categoryIndex + 1}`,
        title: str(category.title),
        order: Number(category.order) || categoryIndex + 1,
        items,
      };
    })
    .filter((category) => category.title);
}

function normalizeVenue(
  body: Partial<VenuePageContent>,
): Partial<VenuePageContent> {
  const result: Partial<VenuePageContent> = {};

  if ("name" in body) result.name = str(body.name);
  if ("byLabel" in body) result.byLabel = str(body.byLabel);
  if ("headline" in body) result.headline = str(body.headline);
  if ("tags" in body) result.tags = strList(body.tags);
  if ("slogan" in body) result.slogan = str(body.slogan);
  if ("logo" in body) result.logo = opt(body.logo);
  if ("heroImage" in body) result.heroImage = opt(body.heroImage);

  if ("live" in body && body.live) {
    result.live = {
      eyebrow: str(body.live.eyebrow),
      title: str(body.live.title),
      description: strList(body.live.description),
      platforms: normalizePlatforms(body.live.platforms),
      note: str(body.live.note),
      cta: normalizeCta(body.live.cta),
      videoThumb: opt(body.live.videoThumb),
      videoUrl: opt(body.live.videoUrl),
      liveBadge: Boolean(body.live.liveBadge),
    };
  }

  if ("events" in body && body.events) {
    result.events = {
      eyebrow: str(body.events.eyebrow),
      title: str(body.events.title),
      description: strList(body.events.description),
      manifesto: strList(body.events.manifesto),
      cta: normalizeCta(body.events.cta),
      gallery: normalizeImages(body.events.gallery),
    };
  }

  if ("bar" in body && body.bar) {
    result.bar = {
      eyebrow: str(body.bar.eyebrow),
      title: str(body.bar.title),
      description: strList(body.bar.description),
      images: normalizeImages(body.bar.images),
      menu: normalizeMenu(body.bar.menu),
    };
  }

  if ("contacts" in body && body.contacts) {
    result.contacts = {
      address: str(body.contacts.address),
      phone: str(body.contacts.phone),
      phoneHref: str(body.contacts.phoneHref),
      hours: str(body.contacts.hours),
    };
  }

  return result;
}