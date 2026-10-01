import * as THREE from "three";
import { SHARDS, GLASS, mulberry32 } from "../../sgomez/src/lib/lost/shards";

/**
 * Geometría del estallido. La forma de cada fragmento (`outline`) y su sitio en el
 * cristal entero (`cell`) NO se calculan aquí: salen de `shards.ts`, donde los
 * escribe `scripts/bake-geometry.mjs`. Nada de `Math.random`.
 */

export { mulberry32 };

export const SLAB_RADIUS = GLASS.slabRadius;

/** Radio del contorno del cristal entero en el ángulo t. */
function slabR(t: number) {
  let k = 1;
  for (const [freq, amp, phase] of GLASS.slabOutline.waves) k += amp * Math.sin(freq * t + phase);
  return GLASS.slabRadius * k;
}

export type CrackEdge = { ax: number; ay: number; bx: number; by: number; da: number; db: number };

export type Cell = {
  cx: number;
  cy: number;
  radius: number;
  poly: { x: number; y: number }[];
  /** Aristas de grieta: las del contorno que NO están sobre el borde del cristal entero. */
  edges: CrackEdge[];
};

function toCell(i: number): Cell {
  const s = SHARDS[i]!;
  const { cx, cy, r } = s.cell;
  const poly = s.outline.map(([x, y]) => ({ x, y }));
  const onBoundary = (x: number, y: number) => {
    const sx = cx + x * r;
    const sy = cy + y * r;
    return Math.hypot(sx, sy) >= slabR(Math.atan2(sy, sx)) * 0.99;
  };
  const edges: CrackEdge[] = [];
  for (let k = 0; k < poly.length; k++) {
    const a = poly[(k + poly.length - 1) % poly.length]!;
    const b = poly[k]!;
    if (onBoundary(a.x, a.y) && onBoundary(b.x, b.y)) continue;
    edges.push({
      ax: a.x,
      ay: a.y,
      bx: b.x,
      by: b.y,
      da: Math.hypot(cx + a.x * r, cy + a.y * r) / SLAB_RADIUS,
      db: Math.hypot(cx + b.x * r, cy + b.y * r) / SLAB_RADIUS,
    });
  }
  return { cx, cy, radius: r, poly, edges };
}

/** Una celda por fragmento, en el mismo orden que `SHARDS`. */
export const cells: Cell[] = SHARDS.map((_, i) => toCell(i));

export const SHARD_DEPTH = GLASS.depth;
const B = GLASS.bevel;

/** Prisma biselado del contorno normalizado, centrado en z. */
export function shardGeometry(cell: Cell): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape(cell.poly.map((p) => new THREE.Vector2(p.x, p.y)));
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: GLASS.depth,
    bevelEnabled: true,
    bevelThickness: B.thickness,
    bevelSize: B.size,
    bevelOffset: B.offset,
    bevelSegments: B.segments,
    curveSegments: 1,
  });
  g.translate(0, 0, -GLASS.depth / 2);
  return g;
}

/** Cara frontal en z local (donde se dibujan las grietas). */
export const FRONT_Z = GLASS.depth / 2 + B.thickness + 0.004;

/** Tiras de luz a lo largo de las aristas de grieta. `front` es el frente de la grieta (0 a ~1.3 en radio del cristal). */
export function crackGeometry(cell: Cell, front: number, width: number): THREE.BufferGeometry {
  const pos: number[] = [];
  const idx: number[] = [];
  for (const e of cell.edges) {
    const near = e.da <= e.db;
    const d0 = near ? e.da : e.db;
    const d1 = near ? e.db : e.da;
    const t = Math.min(1, Math.max(0, (front - d0) / Math.max(0.05, d1 - d0)));
    if (t <= 0) continue;
    const p0 = near ? { x: e.ax, y: e.ay } : { x: e.bx, y: e.by };
    const p1 = near ? { x: e.bx, y: e.by } : { x: e.ax, y: e.ay };
    const x1 = p0.x + (p1.x - p0.x) * t;
    const y1 = p0.y + (p1.y - p0.y) * t;
    const dx = x1 - p0.x;
    const dy = y1 - p0.y;
    const len = Math.hypot(dx, dy);
    if (len < 1e-5) continue;
    const nx = (-dy / len) * width;
    const ny = (dx / len) * width;
    const base = pos.length / 3;
    pos.push(p0.x + nx, p0.y + ny, FRONT_Z, p0.x - nx, p0.y - ny, FRONT_Z, x1 - nx, y1 - ny, FRONT_Z, x1 + nx, y1 + ny, FRONT_Z);
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
}

/** Astilla de escombro: triángulo irregular extruido, geometría unitaria (solo vídeo). */
export function chipGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape([new THREE.Vector2(-0.5, -0.35), new THREE.Vector2(0.55, -0.1), new THREE.Vector2(-0.1, 0.6)]);
  const g = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: false });
  g.translate(0, 0, -0.06);
  return g;
}
