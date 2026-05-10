import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import type { Artist } from "@/types/content";
import type { StreamConfig } from "@/data/stream";

const DB_PATH = join(process.cwd(), "data", "db.json");

interface DbData {
  artists: Artist[];
  stream: StreamConfig;
}

async function readDb(): Promise<DbData> {
  try {
    const raw = await readFile(DB_PATH, "utf-8");
    return JSON.parse(raw) as DbData;
  } catch {
    const { seedArtists } = await import("@/data/seed");
    const { streamConfig } = await import("@/data/stream");
    const initial: DbData = { artists: seedArtists, stream: streamConfig };
    await writeFile(DB_PATH, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
}

async function writeDb(data: DbData): Promise<void> {
  await writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function getArtists(): Promise<Artist[]> {
  const db = await readDb();
  return db.artists;
}

export async function getArtist(id: string): Promise<Artist | undefined> {
  const artists = await getArtists();
  return artists.find((a) => a.id === id);
}

export async function createArtist(artist: Artist): Promise<Artist> {
  const db = await readDb();
  db.artists.push(artist);
  await writeDb(db);
  return artist;
}

export async function updateArtist(
  id: string,
  data: Partial<Artist>,
): Promise<Artist | null> {
  const db = await readDb();
  const index = db.artists.findIndex((a) => a.id === id);
  if (index === -1) {
    return null;
  }
  db.artists[index] = { ...db.artists[index], ...data, id };
  await writeDb(db);
  return db.artists[index];
}

export async function deleteArtist(id: string): Promise<boolean> {
  const db = await readDb();
  const index = db.artists.findIndex((a) => a.id === id);
  if (index === -1) {
    return false;
  }
  db.artists.splice(index, 1);
  await writeDb(db);
  return true;
}

export async function getStreamConfig(): Promise<StreamConfig> {
  const db = await readDb();
  return db.stream;
}

export async function updateStreamConfig(
  data: Partial<StreamConfig>,
): Promise<StreamConfig> {
  const db = await readDb();
  db.stream = { ...db.stream, ...data };
  await writeDb(db);
  return db.stream;
}
