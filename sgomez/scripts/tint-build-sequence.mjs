// Tiñe la secuencia del capítulo 03 (fotogramas y póster) a la paleta de la v4: la misma matriz que el filtro CSS
// hue-rotate(-38deg) saturate(0.72) brightness(1.02) del cristal. Se pasa UNA vez después de renderizarla con
// Remotion (`npm run render -- --only=build` en `video/`); el lienzo no lleva filtro porque frenaba el pintado sin GPU.
//   node scripts/tint-build-sequence.mjs [calidad=78]
import sharp from "sharp";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const a = (-38 * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
const HUE = [
  [0.213 + c * 0.787 - s * 0.213, 0.715 - c * 0.715 - s * 0.715, 0.072 - c * 0.072 + s * 0.928],
  [0.213 - c * 0.213 + s * 0.143, 0.715 + c * 0.285 + s * 0.14, 0.072 - c * 0.072 - s * 0.283],
  [0.213 - c * 0.213 - s * 0.787, 0.715 - c * 0.715 + s * 0.715, 0.072 + c * 0.928 + s * 0.072],
];
const k = 0.72;
const SAT = [
  [0.213 + 0.787 * k, 0.715 - 0.715 * k, 0.072 - 0.072 * k],
  [0.213 - 0.213 * k, 0.715 + 0.285 * k, 0.072 - 0.072 * k],
  [0.213 - 0.213 * k, 0.715 - 0.715 * k, 0.072 + 0.928 * k],
];
const mul = (X, Y) => X.map((r) => [0, 1, 2].map((j) => r.reduce((t, v, i) => t + v * Y[i][j], 0)));
const MATRIX = mul(SAT, HUE).map((r) => r.map((v) => v * 1.02));

const quality = Number(process.argv[2] ?? 78);
const files = [
  "public/media/build/poster.webp",
  ...["desktop", "mobile"].flatMap((d) => readdirSync(`public/media/build/${d}`).map((f) => `public/media/build/${d}/${f}`)),
];
for (const f of files) {
  const input = readFileSync(f);
  writeFileSync(f, await sharp(input).recomb(MATRIX).webp({ quality, alphaQuality: 90, effort: 6 }).toBuffer());
}
console.log(`${files.length} ficheros teñidos`);
