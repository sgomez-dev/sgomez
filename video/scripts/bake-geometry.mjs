// Genera el diagrama de Voronoi del cristal y ESCRIBE los literales `outline` y `cell`
// de cada fragmento en sgomez/src/lib/lost/shards.ts, que es la única fuente de verdad
// (el vídeo y la escena 3D en vivo leen de ahí).
//
//   node scripts/bake-geometry.mjs          reescribe los literales
//   node scripts/bake-geometry.mjs --check  falla si los literales no coinciden con el generador
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const shardsPath = resolve(here, "..", "..", "sgomez", "src", "lib", "lost", "shards.ts");
const { SHARDS, GLASS } = await import(pathToFileURL(shardsPath).href);

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function slabOutline() {
  const out = [];
  const { n, waves } = GLASS.slabOutline;
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    let k = 1;
    for (const [freq, amp, phase] of waves) k += amp * Math.sin(freq * t + phase);
    const r = GLASS.slabRadius * k;
    out.push({ x: Math.cos(t) * r, y: Math.sin(t) * r, internal: false });
  }
  return out;
}

// Sutherland-Hodgman contra n·p <= c; `internal` marca las aristas nuevas (grietas).
function clip(poly, nx, ny, c) {
  const out = [];
  const side = (p) => nx * p.x + ny * p.y - c;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[(i + poly.length - 1) % poly.length];
    const b = poly[i];
    const sa = side(a);
    const sb = side(b);
    const inA = sa <= 0;
    const inB = sb <= 0;
    if (inA && inB) out.push(b);
    else if (inA && !inB) {
      const t = sa / (sa - sb);
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, internal: b.internal });
    } else if (!inA && inB) {
      const t = sa / (sa - sb);
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, internal: true });
      out.push(b);
    }
  }
  return out;
}

function seeds() {
  const rnd = mulberry32(404);
  const rings = [
    { n: 2, r: 0.32, off: 0.5 },
    { n: 4, r: 0.86, off: 0.2 },
    { n: 6, r: 1.32, off: 0.0 },
  ];
  const pts = [];
  for (const ring of rings) {
    for (let i = 0; i < ring.n; i++) {
      const step = (Math.PI * 2) / ring.n;
      const a = (i + ring.off) * step + (rnd() - 0.5) * step * 0.55;
      const r = ring.r * (1 + (rnd() - 0.5) * 0.18);
      pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
    }
  }
  return pts;
}

function cells() {
  const pts = seeds();
  return pts.map((s, i) => {
    let poly = slabOutline();
    pts.forEach((o, j) => {
      if (i === j) return;
      const nx = o.x - s.x;
      const ny = o.y - s.y;
      const len = Math.hypot(nx, ny);
      poly = clip(poly, nx / len, ny / len, (nx / len) * ((s.x + o.x) / 2) + (ny / len) * ((s.y + o.y) / 2));
    });
    let a2 = 0, cx = 0, cy = 0;
    for (let k = 0; k < poly.length; k++) {
      const p = poly[k];
      const q = poly[(k + 1) % poly.length];
      const cr = p.x * q.y - q.x * p.y;
      a2 += cr;
      cx += (p.x + q.x) * cr;
      cy += (p.y + q.y) * cr;
    }
    cx /= 3 * a2;
    cy /= 3 * a2;
    const r = Math.max(...poly.map((p) => Math.hypot(p.x - cx, p.y - cy)));
    return { cx, cy, r, outline: poly.map((p) => [(p.x - cx) / r, (p.y - cy) / r]) };
  });
}

const q = (v) => Math.round(v * 1e4) / 1e4;

/** Celdas casadas con fragmentos por orden de pose.x (vuelos sin cruces). */
export function bake() {
  const byX = cells().sort((a, b) => a.cx - b.cx);
  const order = SHARDS.map((s, i) => ({ i, x: s.pose.x })).sort((a, b) => a.x - b.x);
  const result = {};
  order.forEach((o, k) => {
    const c = byX[k];
    result[SHARDS[o.i].id] = {
      outline: `[${c.outline.map(([x, y]) => `[${q(x)}, ${q(y)}]`).join(", ")}]`,
      cell: `{ cx: ${q(c.cx)}, cy: ${q(c.cy)}, r: ${q(c.r)} }`,
    };
  });
  return result;
}

const src = readFileSync(shardsPath, "utf8");
const baked = bake();
let next = src;
for (const [id, v] of Object.entries(baked)) {
  next = next.replace(new RegExp(`/\\*b:${id}\\*/[\\s\\S]*?/\\*e\\*/`), `/*b:${id}*/${v.outline}/*e*/`);
  next = next.replace(new RegExp(`/\\*c:${id}\\*/[\\s\\S]*?/\\*e\\*/`), `/*c:${id}*/${v.cell}/*e*/`);
}

if (process.argv.includes("--check")) {
  if (next !== src) {
    console.error("bake:check FALLA: los literales de shards.ts no coinciden con el generador. Ejecuta `npm run bake`.");
    process.exit(1);
  }
  console.log(`bake:check OK (${Object.keys(baked).length} fragmentos)`);
} else {
  writeFileSync(shardsPath, next);
  console.log(`bake OK: ${Object.keys(baked).length} fragmentos escritos en shards.ts`);
}
