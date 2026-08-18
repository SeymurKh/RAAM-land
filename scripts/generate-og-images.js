/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require("sharp");
const { join } = require("path");

const ROOT = join(__dirname, "..");
const BG = "#080706";
const LOGO = join(ROOT, "public", "assets", "images", "logo.png");

async function generate(fileName, width, height, logoWidth) {
  const outPath = join(ROOT, "app", fileName);

  const logo = await sharp(LOGO).resize(logoWidth, null, { fit: "inside" }).toBuffer();
  const logoMeta = await sharp(logo).metadata();
  const left = Math.round((width - logoMeta.width) / 2);
  const top = Math.round((height - logoMeta.height) / 2);

  const canvas = sharp({
    create: { width, height, channels: 3, background: BG },
  });

  await canvas
    .composite([{ input: logo, left, top }])
    .png()
    .toFile(outPath);

  console.log(`Generated ${fileName} (${width}x${height})`);
}

(async () => {
  await generate("opengraph-image.png", 1200, 630, 920);
  await generate("twitter-image.png", 1200, 630, 920);
})();