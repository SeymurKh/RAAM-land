import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { join, normalize } from "path";
import { verifyToken } from "@/lib/auth";
import { getVenue, updateVenue } from "@/lib/db";
import { cleanUploadUrl } from "@/lib/uploads";
import type {
  HeroMedia,
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

const UPLOADS_ROOT = join(process.cwd(), "public");

/** Все файловые ссылки контента venue (очищенные от ?v=). */
function collectVenueFiles(venue: VenuePageContent): Set<string> {
  const files = new Set<string>();
  const add = (url?: string) => {
    const clean = cleanUploadUrl(url);
    if (clean && clean.startsWith("/uploads/")) files.add(clean);
  };
  add(venue.logo);
  add(venue.heroImage);
  for (const media of venue.heroColumns ?? []) {
    add(media.src);
    add(media.poster);
  }
  for (const image of venue.events?.gallery ?? []) add(image.src);
  for (const image of venue.bar?.images ?? []) add(image.src);
  return files;
}

/** Удаляет файлы, пропавшие из контента после сохранения (Remove ✕ / замена). */
async function removeOrphanedFiles(
  before: Set<string>,
  after: Set<string>,
): Promise<void> {
  for (const url of before) {
    if (after.has(url)) continue;
    // Файл только внутри public/uploads — защита от path traversal
    const rel = normalize(url).replace(/^([/\\])+/, "");
    const filePath = join(UPLOADS_ROOT, rel);
    if (!filePath.startsWith(UPLOADS_ROOT)) continue;
    try {
      await unlink(filePath);
      console.log("[PUT /api/venue] Removed orphaned file:", filePath);
    } catch {
      // Уже нет на диске (например, заменён через upload-роут) — норма
    }
  }
}

export async function PUT(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<VenuePageContent>;
  const current = await getVenue();
  const before = collectVenueFiles(current);
  const venue = await updateVenue(normalizeVenue(body, current));
  await removeOrphanedFiles(before, collectVenueFiles(venue));
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

/** Медиа-слоты фона hero: максимум 3, только image|video. */
function normalizeHeroColumns(value: unknown): HeroMedia[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, 3)
    .map((entry, index) => {
      const media = (entry ?? {}) as Partial<HeroMedia>;
      return {
        id: str(media.id) || `hero-${index + 1}`,
        kind: media.kind === "video" ? ("video" as const) : ("image" as const),
        src: str(media.src),
        poster: opt(media.poster),
        alt: opt(media.alt),
      };
    })
    .filter((media) => media.src);
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
        banner: Boolean(category.banner),
        items,
      };
    })
    .filter((category) => category.title);
}

function normalizeVenue(
  body: Partial<VenuePageContent>,
  current: VenuePageContent,
): Partial<VenuePageContent> {
  const result: Partial<VenuePageContent> = {};

  if ("name" in body) result.name = str(body.name);
  if ("headline" in body) result.headline = str(body.headline);
  if ("tags" in body) result.tags = strList(body.tags);
  if ("logo" in body) result.logo = opt(body.logo);
  if ("heroImage" in body) result.heroImage = opt(body.heroImage);
  if ("heroColumns" in body) result.heroColumns = normalizeHeroColumns(body.heroColumns);

  // Секции обновляются пополево: непереданные поля сохраняются из current.
  // Иначе частичный PUT (например, только gallery) затирает тексты секции.
  if ("live" in body && body.live) {
    const live = { ...current.live };
    if ("eyebrow" in body.live) live.eyebrow = str(body.live.eyebrow);
    if ("title" in body.live) live.title = str(body.live.title);
    if ("description" in body.live)
      live.description = strList(body.live.description);
    if ("platforms" in body.live)
      live.platforms = normalizePlatforms(body.live.platforms);
    result.live = live;
  }

  if ("events" in body && body.events) {
    const events = { ...current.events };
    if ("eyebrow" in body.events) events.eyebrow = str(body.events.eyebrow);
    if ("title" in body.events) events.title = str(body.events.title);
    if ("description" in body.events)
      events.description = strList(body.events.description);
    if ("manifesto" in body.events)
      events.manifesto = strList(body.events.manifesto);
    if ("cta" in body.events) events.cta = normalizeCta(body.events.cta);
    if ("gallery" in body.events)
      events.gallery = normalizeImages(body.events.gallery);
    result.events = events;
  }

  if ("bar" in body && body.bar) {
    const bar = { ...current.bar };
    if ("eyebrow" in body.bar) bar.eyebrow = str(body.bar.eyebrow);
    if ("title" in body.bar) bar.title = str(body.bar.title);
    if ("description" in body.bar)
      bar.description = strList(body.bar.description);
    if ("images" in body.bar) bar.images = normalizeImages(body.bar.images);
    if ("menu" in body.bar) bar.menu = normalizeMenu(body.bar.menu);
    result.bar = bar;
  }

  if ("contacts" in body && body.contacts) {
    const contacts = { ...current.contacts };
    if ("address" in body.contacts)
      contacts.address = str(body.contacts.address);
    if ("hours" in body.contacts) contacts.hours = str(body.contacts.hours);
    result.contacts = contacts;
  }

  return result;
}