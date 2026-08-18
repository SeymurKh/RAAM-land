/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require("sharp");
const { join } = require("path");

const ROOT = join(__dirname, "..");
const LOGO = join(ROOT, "public", "assets", "images", "logo.png");

async function compositeCenter({
  width,
  height,
  background,
  logoWidth,
  outPath,
}) {
  const logo = await sharp(LOGO)
    .resize(logoWidth, null, { fit: "inside" })
    .toBuffer();
  const logoMeta = await sharp(logo).metadata();
  const left = Math.round((width - logoMeta.width) / 2);
  const top = Math.round((height - logoMeta.height) / 2);

  await sharp({
    create: { width, height, channels: 3, background },
  })
    .composite([{ input: logo, left, top }])
    .png()
    .toFile(outPath);
}

(async () => {
  // OG / Twitter share previews
  await compositeCenter({
    width: 1200,
    height: 630,
    background: "#080706",
    logoWidth: 920,
    outPath: join(ROOT, "app", "opengraph-image.png"),
  });
  await compositeCenter({
    width: 1200,
    height: 630,
    background: "#080706",
    logoWidth: 920,
    outPath: join(ROOT, "app", "twitter-image.png"),
  });

  // Browser tab / app icons (black background)
  await compositeCenter({
    width: 512,
    height: 512,
    background: "#000000",
    logoWidth: 460,
    outPath: join(ROOT, "app", "icon.png"),
  });
  await compositeCenter({
    width: 180,
    height: 180,
    background: "#000000",
    logoWidth: 160,
    outPath: join(ROOT, "app", "apple-icon.png"),
  });

  console.log("Generated og/twitter/icon/apple-icon images");
})();