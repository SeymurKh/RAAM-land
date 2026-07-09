import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import type { Artist, Project } from "@/types/content";
import type { StreamConfig } from "@/data/stream";

const DB_PATH = join(process.cwd(), "data", "db.json");

/* ─── Simple mutex for serializing write operations ─── */
let dbLock: Promise<void> = Promise.resolve();

async function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const prev = dbLock;
  let resolve: () => void;
  dbLock = new Promise<void>((r) => {
    resolve = r;
  });
  await prev;
  try {
    return await fn();
  } finally {
    resolve!();
  }
}

interface DbData {
  artists: Artist[];
  projects: Project[];
  stream: StreamConfig;
}

async function readDb(): Promise<DbData> {
  try {
    const raw = await readFile(DB_PATH, "utf-8");
    return await ensureDbShape(JSON.parse(raw) as DbData);
  } catch {
    const { seedArtists } = await import("@/data/seed");
    const { seedProjects } = await import("@/data/projects");
    const { streamConfig } = await import("@/data/stream");
    const initial: DbData = {
      artists: seedArtists,
      projects: seedProjects,
      stream: streamConfig,
    };
    await writeFile(DB_PATH, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
}

async function ensureDbShape(data: DbData): Promise<DbData> {
  if (!Array.isArray(data.artists)) {
    data.artists = [];
  }
  if (!Array.isArray(data.projects)) {
    data.projects = [];
  }
  if (!data.stream || typeof data.stream !== "object") {
    const { streamConfig } = await import("@/data/stream");
    data.stream = streamConfig;
  }

  return data;
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
  return withLock(async () => {
    const db = await readDb();
    db.artists.push(artist);
    await writeDb(db);
    return artist;
  });
}

export async function updateArtist(
  id: string,
  data: Partial<Artist>,
): Promise<Artist | null> {
  return withLock(async () => {
    const db = await readDb();
    const index = db.artists.findIndex((a) => a.id === id);
    if (index === -1) {
      return null;
    }
    db.artists[index] = { ...db.artists[index], ...data, id };
    await writeDb(db);
    return db.artists[index];
  });
}

export async function deleteArtist(id: string): Promise<boolean> {
  return withLock(async () => {
    const db = await readDb();
    const index = db.artists.findIndex((a) => a.id === id);
    if (index === -1) {
      return false;
    }
    db.artists.splice(index, 1);
    await writeDb(db);
    return true;
  });
}

export async function getStreamConfig(): Promise<StreamConfig> {
  const db = await readDb();
  return db.stream;
}

export async function updateStreamConfig(
  data: Partial<StreamConfig>,
): Promise<StreamConfig> {
  return withLock(async () => {
    const db = await readDb();
    db.stream = { ...db.stream, ...data };
    await writeDb(db);
    return db.stream;
  });
}

export async function getProjects(): Promise<Project[]> {
  const db = await readDb();
  return [...db.projects].sort((a, b) => a.order - b.order);
}

export async function getProject(id: string): Promise<Project | undefined> {
  const projects = await getProjects();
  return projects.find((project) => project.id === id);
}

export async function createProject(project: Project): Promise<Project> {
  return withLock(async () => {
    const db = await readDb();
    db.projects.push(project);
    await writeDb(db);
    return project;
  });
}

export async function updateProject(
  id: string,
  data: Partial<Project>,
): Promise<Project | null> {
  return withLock(async () => {
    const db = await readDb();
    const index = db.projects.findIndex((project) => project.id === id);
    if (index === -1) {
      return null;
    }

    db.projects[index] = { ...db.projects[index], ...data, id };
    await writeDb(db);
    return db.projects[index];
  });
}

export async function deleteProject(id: string): Promise<boolean> {
  return withLock(async () => {
    const db = await readDb();
    const index = db.projects.findIndex((project) => project.id === id);
    if (index === -1) {
      return false;
    }

    db.projects.splice(index, 1);
    await writeDb(db);
    return true;
  });
}
