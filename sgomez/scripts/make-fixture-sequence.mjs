// Genera la secuencia de PRUEBA de ScrollSequence: 24 fotogramas WebP pequeños en public/media/__fixture/.
// La carpeta no se commitea (.gitignore) y solo la usa e2e/scroll-sequence.spec.ts, vía la ruta /e2e-sequence.
import sharp from "sharp";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

export const FRAMES = 24;
const OUT = join(process.cwd(), "public", "media", "__fixture");
const SIZES = { desktop: [320, 180], mobile: [160, 90] };

const svg = (i, w, h) => {
  const t = i / (FRAMES - 1);
  const hue = Math.round(220 + 120 * t);
  const bar = Math.round(t * (w - w / 6));
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="hsl(${hue} 55% 22%)"/><rect x="${bar}" y="${h / 3}" width="${w / 6}" height="${h / 3}" rx="${h / 12}" fill="hsl(${hue + 40} 80% 65%)"/></svg>`,
  );
};

rmSync(OUT, { recursive: true, force: true });
for (const [key, [w, h]] of Object.entries(SIZES)) {
  mkdirSync(join(OUT, key), { recursive: true });
  for (let i = 0; i < FRAMES; i++) await sharp(svg(i, w, h)).webp({ quality: 60 }).toFile(join(OUT, key, `${String(i + 1).padStart(4, "0")}.webp`));
}
await sharp(svg(FRAMES - 1, ...SIZES.desktop)).webp({ quality: 60 }).toFile(join(OUT, "poster.webp"));
console.log(`fixture: ${FRAMES} fotogramas en ${OUT}`);
