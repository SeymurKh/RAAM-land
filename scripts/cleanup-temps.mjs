#!/usr/bin/env node

/**
 * Разовая очистка осиротевших temp-файлов из public/uploads/.
 *
 * Файлы, которые никогда не удаляются:
 *   - new-<timestamp>.ext          (фото нового артиста)
 *   - avatar-new-<timestamp>.ext   (аватар нового артиста)
 *   - new-project-<timestamp>.ext  (изображение нового проекта)
 *
 * Использование:
 *   node scripts/cleanup-temps.mjs              — dry-run (только показать)
 *   node scripts/cleanup-temps.mjs --delete     — удалить найденные файлы
 */

import { readdir, unlink, stat } from "fs/promises";
import { join, resolve } from "path";

const TEMP_PATTERNS = [
  /^(avatar-)?new-\d+\.(png|jpg|jpeg|webp|gif)$/i,
  /^new-project-\d+\.(png|jpg|jpeg|webp|gif)$/i,
];

const DIRS = [
  "public/uploads/artists",
  "public/uploads/projects",
];

const doDelete = process.argv.includes("--delete");
const root = resolve(import.meta.dirname, "..");

let totalFound = 0;
let totalDeleted = 0;

for (const relDir of DIRS) {
  const dir = join(root, relDir);

  let entries;
  try {
    entries = await readdir(dir);
  } catch {
    console.log(`⏭  ${relDir}/ — директория не найдена, пропускаем`);
    continue;
  }

  const temps = [];

  for (const name of entries) {
    if (TEMP_PATTERNS.some((re) => re.test(name))) {
      const filePath = join(dir, name);
      const info = await stat(filePath);
      temps.push({ name, size: info.size });
    }
  }

  if (temps.length === 0) {
    console.log(`✅ ${relDir}/ — мусора нет`);
    continue;
  }

  totalFound += temps.length;

  console.log(`\n📂 ${relDir}/ — найдено ${temps.length} temp-файлов:`);
  for (const { name, size } of temps) {
    const kb = (size / 1024).toFixed(1);
    console.log(`   ${name}  (${kb} KB)`);
  }

  if (doDelete) {
    for (const { name } of temps) {
      try {
        await unlink(join(dir, name));
        totalDeleted++;
      } catch (err) {
        console.error(`   ❌ Не удалось удалить ${name}:`, err.message);
      }
    }
  }
}

console.log("\n" + "─".repeat(50));
if (totalFound === 0) {
  console.log("🎉 Мусорных temp-файлов не найдено.");
} else if (doDelete) {
  console.log(`🗑  Удалено: ${totalDeleted} из ${totalFound}`);
} else {
  console.log(`🔍 Найдено: ${totalFound}. Запусти с --delete чтобы удалить.`);
}