// Comprueba que cada fragmento de poster-end.webp cae donde `project(pose, 16/9)` dice:
// el centroide de su alfa debe estar a menos del 1% de la caja (en ancho y en alto).
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const shardsPath = resolve(here, "..", "..", "sgomez", "src", "lib", "lost", "shards.ts");
const posterPath = resolve(here, "..", "..", "sgomez", "public", "media", "404", "poster-end.webp");
const { SHARDS, project, STAGE_ASPECT_DESKTOP } = await import(pathToFileURL(shardsPath).href);

const { data, info } = await sharp(posterPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const solid = (i) => data[i * 4 + 3] > 128;

// componentes conexos del alfa
const label = new Int32Array(W * H);
const comps = [];
const stack = [];
for (let s = 0; s < W * H; s++) {
  if (label[s] || !solid(s)) continue;
  const id = comps.length + 1;
  let n = 0, sx = 0, sy = 0;
  stack.push(s);
  label[s] = id;
  while (stack.length) {
    const p = stack.pop();
    const x = p % W, y = (p / W) | 0;
    n++; sx += x; sy += y;
    for (const q of [p - 1, p + 1, p - W, p + W]) {
      if (q < 0 || q >= W * H || label[q] || !solid(q)) continue;
      if ((q === p - 1 && x === 0) || (q === p + 1 && x === W - 1)) continue;
      label[q] = id;
      stack.push(q);
    }
  }
  if (n > 200) comps.push({ n, cx: sx / n, cy: sy / n });
}

console.log(`poster-end.webp ${W}x${H}, ${comps.length} regiones opacas, ${SHARDS.length} fragmentos`);
let worst = 0;
let ok = true;
for (const s of SHARDS) {
  const t = project(s.pose, STAGE_ASPECT_DESKTOP);
  let best = null;
  for (const c of comps) {
    const dx = ((c.cx / W) * 100 - t.left);
    const dy = ((c.cy / H) * 100 - t.top);
    const d = Math.hypot(dx, dy);
    if (!best || d < best.d) best = { d, dx, dy };
  }
  const pass = Math.abs(best.dx) <= 1 && Math.abs(best.dy) <= 1;
  ok &&= pass;
  worst = Math.max(worst, Math.abs(best.dx), Math.abs(best.dy));
  console.log(`${s.id.padEnd(4)} esperado (${t.left.toFixed(2)}%, ${t.top.toFixed(2)}%)  error (${best.dx.toFixed(2)}%, ${best.dy.toFixed(2)}%)  ${pass ? "OK" : "FALLA"}`);
}
console.log(`peor error ${worst.toFixed(2)}% (tope 1%)`);
if (!ok || comps.length < SHARDS.length) {
  console.error("verify FALLA");
  process.exit(1);
}
console.log("verify OK");
