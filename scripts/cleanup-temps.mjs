#!/usr/bin/env node

/**
 * Очистка осиротевших файлов из public/uploads/.
 *
 * Удаляются:
 *   - temp-файлы: new-<ts>.ext, avatar-new-<ts>.ext, new-project-<ts>.ext,
 *     new-media-<ts>.ext, venue-*-src.tmp (остатки транскодирования видео)
 *   - файлы-сироты: img-*, venue-* без ссылок в data/db.json (--orphans)
 *
 * Использование:
 *   node scripts/cleanup-temps.mjs                — dry-run (только показать)
 *   node scripts/cleanup-temps.mjs --delete       — удалить temp-файлы
 *   node scripts/cleanup-temps.mjs --orphans      — dry-run сирот
 *   node scripts/cleanup-temps.mjs --orphans --delete — удалить сирот
 */

import { readdir, unlink, stat, readFile } from "fs/promises";
import { join, resolve } from "path";

const TEMP_PATTERNS = [
  /^(avatar-)?new-\d+\.(png|jpg|jpeg|webp|gif)$/i,
  /^new-project-\d+\.(png|jpg|jpeg|webp|gif)$/i,
  /^new-media-\d+\.(png|jpg|jpeg|webp|gif)$/i,
  /^venue-.*-src\.tmp$/i,
];

const DIRS = [
  "public/uploads/artists",
  "public/uploads/projects",
  "public/uploads/media",
  "public/uploads/venue",
];

const doDelete = process.argv.includes("--delete");
const doOrphans = process.argv.includes("--orphans");
const root = resolve(import.meta.dirname, "..");

/**
 * Имена файлов (в формате "subdir/name.ext"), на которые есть ссылки в db.json.
 * null — если db.json недоступен (тогда сирот не ищем).
 */
async function collectReferenced() {
  try {
    const raw = await readFile(join(root, "data", "db.json"), "utf-8");
    const referenced = new Set();
    const walk = (value) => {
      if (typeof value === "string") {
        const match = value.match(/\/uploads\/([^?#"']+)/);
        if (match) referenced.add(match[1]);
      } else if (Array.isArray(value)) {
        value.forEach(walk);
      } else if (value && typeof value === "object") {
        Object.values(value).forEach(walk);
      }
    };
    walk(JSON.parse(raw));
    return referenced;
  } catch {
    return null;
  }
}

let totalFound = 0;
let totalDeleted = 0;

const referenced = doOrphans ? await collectReferenced() : null;

for (const relDir of DIRS) {
  const dir = join(root, relDir);
  const sub = relDir.replace("public/uploads/", "");

  let entries;
  try {
    entries = await readdir(dir);
  } catch {
    console.log(`⏭  ${relDir}/ — директория не найдена, пропускаем`);
    continue;
  }

  const temps = [];
  const orphans = [];

  for (const name of entries) {
    const filePath = join(dir, name);
    const info = await stat(filePath);
    if (TEMP_PATTERNS.some((re) => re.test(name))) {
      temps.push({ name, size: info.size });
    } else if (referenced && !referenced.has(`${sub}/${name}`)) {
      orphans.push({ name, size: info.size });
    }
  }

  const report = (list, label) => {
    if (list.length === 0) return;
    totalFound += list.length;
    console.log(`\n📂 ${relDir}/ — найдено ${list.length} ${label}:`);
    for (const { name, size } of list) {
      const kb = (size / 1024).toFixed(1);
      console.log(`   ${name}  (${kb} KB)`);
    }
    if (doDelete) {
      for (const { name } of list) {
        unlink(join(dir, name))
          .then(() => totalDeleted++)
          .catch((err) =>
            console.error(`   ❌ Не удалось удалить ${name}:`, err.message),
          );
      }
    }
  };

  if (temps.length === 0 && orphans.length === 0) {
    console.log(`✅ ${relDir}/ — мусора нет`);
    continue;
  }

  report(temps, "temp-файлов");
  if (doOrphans) report(orphans, "файлов-сирот (нет ссылок в db.json)");
}

// Даём завершиться параллельным unlink
await new Promise((resolvePromise) => setTimeout(resolvePromise, 300));

console.log("\n" + "─".repeat(50));
if (totalFound === 0) {
  console.log("🎉 Мусорных файлов не найдено.");
} else if (doDelete) {
  console.log(`🗑  Удалено: ${totalDeleted} из ${totalFound}`);
} else {
  console.log(`🔍 Найдено: ${totalFound}. Запусти с --delete чтобы удалить.`);
}