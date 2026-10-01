import * as THREE from "three";
import { SHARDS } from "../../sgomez/src/lib/lost/shards";

/**
 * Geometría determinista del estallido. Nada de `Math.random`: todo sale de
 * `mulberry32` con semilla fija, así que dos renders dan los mismos píxeles.
 *
 * El cristal entero es un blob en el plano XY local. Sus grietas son las aristas
 * de un diagrama de Voronoi de 12 semillas, y cada celda ES uno de los 12
 * fragmentos: lo que se rompe es exactamente lo que aterriza en `SHARDS`.
 */

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type V = { x: number; y: number; internal: boolean }; // `internal`: la arista que LLEGA a este vértice es grieta

export const SLAB_RADIUS = 1.55;
const OUTLINE_N = 72;

function slabOutline(): V[] {
  const out: V[] = [];
  for (let i = 0; i < OUTLINE_N; i++) {
    const t = (i / OUTLINE_N) * Math.PI * 2;
    const r = SLAB_RADIUS * (1 + 0.07 * Math.sin(3 * t + 1) + 0.04 * Math.sin(5 * t + 2));
    out.push({ x: Math.cos(t) * r, y: Math.sin(t) * r, internal: false });
  }
  return out;
}

/** Sutherland-Hodgman contra el semiplano `n·p <= c`, propagando la marca de grieta. */
function clip(poly: V[], nx: number, ny: number, c: number): V[] {
  const out: V[] = [];
  const side = (p: V) => nx * p.x + ny * p.y - c;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[(i + poly.length - 1) % poly.length]!;
    const b = poly[i]!;
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

export type CrackEdge = { ax: number; ay: number; bx: number; by: number; da: number; db: number };

export type Cell = {
  /** Centro de la celda en el plano del cristal. */
  cx: number;
  cy: number;
  /** Radio máximo respecto al centro: escala la geometría normalizada. */
  radius: number;
  /** Contorno normalizado (radio máx. 1) alrededor del centro. */
  poly: { x: number; y: number }[];
  /** Aristas de grieta, en coordenadas normalizadas y con la distancia radial al origen del cristal (0 a 1). */
  edges: CrackEdge[];
};

function seeds(): { x: number; y: number }[] {
  const rnd = mulberry32(404);
  const rings = [
    { n: 2, r: 0.32, off: 0.5 },
    { n: 4, r: 0.86, off: 0.2 },
    { n: 6, r: 1.32, off: 0.0 },
  ];
  const pts: { x: number; y: number }[] = [];
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

export function buildCells(): Cell[] {
  const pts = seeds();
  return pts.map((s, i) => {
    let poly = slabOutline();
    pts.forEach((o, j) => {
      if (i === j) return;
      const nx = o.x - s.x;
      const ny = o.y - s.y;
      const len = Math.hypot(nx, ny);
      // |p - s| <= |p - o|  =>  n·p <= n·(s+o)/2
      poly = clip(poly, nx / len, ny / len, (nx / len) * ((s.x + o.x) / 2) + (ny / len) * ((s.y + o.y) / 2));
    });
    // centroide por área
    let a2 = 0;
    let cx = 0;
    let cy = 0;
    for (let k = 0; k < poly.length; k++) {
      const p = poly[k]!;
      const q = poly[(k + 1) % poly.length]!;
      const cr = p.x * q.y - q.x * p.y;
      a2 += cr;
      cx += (p.x + q.x) * cr;
      cy += (p.y + q.y) * cr;
    }
    cx /= 3 * a2;
    cy /= 3 * a2;
    const radius = Math.max(...poly.map((p) => Math.hypot(p.x - cx, p.y - cy)));
    const norm = (p: { x: number; y: number }) => ({ x: (p.x - cx) / radius, y: (p.y - cy) / radius });
    const edges: CrackEdge[] = [];
    for (let k = 0; k < poly.length; k++) {
      const a = poly[(k + poly.length - 1) % poly.length]!;
      const b = poly[k]!;
      if (!b.internal) continue;
      const na = norm(a);
      const nb = norm(b);
      edges.push({
        ax: na.x,
        ay: na.y,
        bx: nb.x,
        by: nb.y,
        da: Math.hypot(a.x, a.y) / SLAB_RADIUS,
        db: Math.hypot(b.x, b.y) / SLAB_RADIUS,
      });
    }
    return { cx, cy, radius, poly: poly.map(norm), edges };
  });
}

/** Celdas ordenadas de izquierda a derecha, para casarlas con los fragmentos por pose.x (vuelos sin cruces). */
export function assignCells(): Cell[] {
  const cells = buildCells();
  const order = SHARDS.map((s, i) => ({ i, x: s.pose.x })).sort((p, q) => p.x - q.x);
  const byX = [...cells].sort((p, q) => p.cx - q.cx);
  const result: Cell[] = new Array(SHARDS.length);
  order.forEach((o, k) => {
    result[o.i] = byX[k]!;
  });
  return result;
}

const DEPTH = 0.2;
export const SHARD_DEPTH = DEPTH;

/** Prisma biselado del contorno normalizado, centrado en z. */
export function shardGeometry(cell: Cell): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape(cell.poly.map((p) => new THREE.Vector2(p.x, p.y)));
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: DEPTH,
    bevelEnabled: true,
    bevelThickness: 0.035,
    bevelSize: 0.03,
    bevelOffset: -0.03,
    bevelSegments: 3,
    curveSegments: 1,
  });
  g.translate(0, 0, -DEPTH / 2);
  return g;
}

/** Cara frontal en z local (donde se dibujan las grietas). */
export const FRONT_Z = DEPTH / 2 + 0.035 + 0.004;

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

/** Astilla de escombro: triángulo irregular extruido, geometría unitaria. */
export function chipGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape([new THREE.Vector2(-0.5, -0.35), new THREE.Vector2(0.55, -0.1), new THREE.Vector2(-0.1, 0.6)]);
  const g = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: false });
  g.translate(0, 0, -0.06);
  return g;
}
