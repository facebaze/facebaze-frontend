// generate-icons.mjs — Run with: node generate-icons.mjs
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, 'public', 'icons');
const svgBuffer = readFileSync(join(iconsDir, 'icon.svg'));

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generate() {
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(join(iconsDir, `icon-${size}x${size}.png`));
    console.log(`Generated icon-${size}x${size}.png`);
  }

  // Maskable icon — has extra padding (safe zone)
  // Maskable safe zone = 80% of icon, so add 10% padding on each side
  const maskableSize = 512;
  const innerSize = Math.round(maskableSize * 0.8);
  const padding = Math.round((maskableSize - innerSize) / 2);

  await sharp(svgBuffer)
    .resize(innerSize, innerSize)
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 185, g: 28, b: 28, alpha: 1 },
    })
    .png()
    .toFile(join(iconsDir, `maskable-icon-${maskableSize}x${maskableSize}.png`));
  console.log(`Generated maskable-icon-${maskableSize}x${maskableSize}.png`);

  console.log('All icons generated!');
}

generate().catch(console.error);
