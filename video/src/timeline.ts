import * as THREE from "three";
import { SHARDS, GLASS } from "../../sgomez/src/lib/lost/shards";
import { mulberry32, cells } from "./geometry";

/**
 * Línea de tiempo pura: (fragmento, frame) -> transformación. Sin estado ni
 * azar sin semilla. Frame 119 = pose final EXACTA de `shards.ts`.
 *
 *   0 a 40   el cristal entra, gira y se agrieta (las grietas son aristas de celdas)
 *  40 a 70   fractura: cada fragmento vuela hasta un punto de rebase
 *  70 a 119  los fragmentos se asientan en `pose`
 */

export const F_CRACK_END = 40;
export const F_FLY_END = 70;
export const F_LAST = 119;

/** Centro del cristal: el baricentro de la constelación, para que el estallido se abra hacia donde aterriza. */
export const GLASS_CENTER = new THREE.Vector3(2.15, 0.1, 0);

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
export const easeOutQuart = (t: number) => 1 - Math.pow(1 - clamp01(t), 4);
export const smooth = (t: number) => {
  const x = clamp01(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
};
const easeOutBack = (t: number) => {
  const c1 = 1.5;
  const c3 = c1 + 1;
  const x = clamp01(t);
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

export { cells };

/** Pose del cristal entero (antes de romperse). */
export function slabState(f: number) {
  const fe = Math.min(f, F_CRACK_END);
  const enter = easeOutBack(fe / 26);
  const settle = easeOutCubic(fe / 36);
  const scale = 0.55 + 0.45 * enter;
  const pos = GLASS_CENTER.clone().add(new THREE.Vector3(-1.5 * (1 - easeOutCubic(fe / 30)), -0.7 * (1 - easeOutCubic(fe / 30)), -3.2 * (1 - easeOutCubic(fe / 28))));
  const yaw = -0.95 + 1.25 * settle + Math.sin(fe * 0.09) * 0.04;
  const pitch = 0.5 - 0.62 * settle;
  const roll = -0.35 + 0.5 * settle;
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, roll, "YXZ"));
  // las grietas empujan: la separación entre celdas se abre justo antes de la fractura
  const gap = 1 + 0.035 * smooth((fe - 30) / 10);
  return { pos, q, scale, gap };
}

export type ShardState = { pos: THREE.Vector3; q: THREE.Quaternion; scale: number };

const finalCache = new Map<number, ShardState>();

/** Pose final de un fragmento: la de `shards.ts` con Euler XYZ y radio `scale * GLASS.radiusPerScale`. */
export function finalPose(i: number): ShardState {
  const hit = finalCache.get(i);
  if (hit) return hit;
  const s = SHARDS[i]!;
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(s.pose.rx, s.pose.ry, s.pose.rz, GLASS.euler));
  const out = { pos: new THREE.Vector3(s.pose.x, s.pose.y, s.pose.z), q, scale: s.scale * GLASS.radiusPerScale };
  finalCache.set(i, out);
  return out;
}

const dirs = SHARDS.map((_, i) => {
  const r = mulberry32(9000 + i);
  const axis = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize();
  return { axis, turns: 0.45 + r() * 0.7, depth: 0.5 + r() * 0.9, over: 0.28 + r() * 0.2 };
});

export function shardState(i: number, f: number): ShardState {
  const cell = cells[i]!;
  const slab = slabState(Math.min(f, F_CRACK_END));
  const local = new THREE.Vector3(cell.cx * slab.gap, cell.cy * slab.gap, 0).multiplyScalar(slab.scale).applyQuaternion(slab.q);
  const assembled = { pos: slab.pos.clone().add(local), q: slab.q.clone(), scale: cell.radius * slab.scale };

  if (f <= F_CRACK_END) return assembled;

  const fin = finalPose(i);
  const d = dirs[i]!;
  const radial = Math.hypot(cell.cx, cell.cy) / 1.5;
  const delay = radial * 3; // los centrales ceden primero
  const centre = GLASS_CENTER;

  // punto de rebase: más allá de la pose, alejándose del centro, algo hacia cámara
  const out = fin.pos.clone().sub(centre);
  const over = fin.pos.clone().add(out.multiplyScalar(d.over)).add(new THREE.Vector3(0, 0.12, d.depth));

  const tFly = clamp01((f - F_CRACK_END - delay) / (F_FLY_END - F_CRACK_END - delay));
  const eFly = easeOutQuart(tFly);
  const pFly = assembled.pos.clone().lerp(over, eFly);
  const tSet = clamp01((f - F_FLY_END) / (F_LAST - F_FLY_END));
  const pos = f < F_FLY_END ? pFly : over.clone().lerp(fin.pos, smooth(tSet));

  // el escalado sigue la fractura: los fragmentos se separan sin encogerse de golpe
  const scale = assembled.scale + (fin.scale - assembled.scale) * easeOutCubic((f - F_CRACK_END) / 45);

  // giro: vuelta(s) de tumbo que se amortiguan a 0 justo en el último frame
  const r = easeOutCubic((f - F_CRACK_END - delay) / (F_LAST - F_CRACK_END - delay));
  const base = assembled.q.clone().slerp(fin.q, r);
  const spin = new THREE.Quaternion().setFromAxisAngle(d.axis, Math.PI * 2 * d.turns * (1 - r));
  const q = spin.multiply(base);

  if (f >= F_LAST) return { pos: fin.pos.clone(), q: fin.q.clone(), scale: fin.scale };
  return { pos, q, scale };
}

/** Intensidad de las grietas: crecen hasta 40, destello en la fractura y se apagan solas. */
export function crackGlow(f: number) {
  if (f <= F_CRACK_END) return 0.55 + 0.45 * clamp01((f - 4) / 36);
  return Math.max(0, 1.6 * Math.exp(-(f - F_CRACK_END) / 9) - 0.02);
}

/** Frente de la grieta en radios del cristal. */
export function crackFront(f: number) {
  return easeOutCubic((f - 8) / 32) * 1.4;
}

export type Chip = { p0: THREE.Vector3; v: THREE.Vector3; axis: THREE.Vector3; spin: number; size: number; delay: number };

export function buildChips(n = 28): Chip[] {
  const r = mulberry32(777);
  const slab = slabState(F_CRACK_END);
  const out: Chip[] = [];
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2;
    const rad = Math.sqrt(r()) * 1.35;
    const local = new THREE.Vector3(Math.cos(a) * rad, Math.sin(a) * rad, 0).multiplyScalar(slab.scale).applyQuaternion(slab.q);
    const dir = new THREE.Vector3(Math.cos(a), Math.sin(a) * 0.8, (r() - 0.35) * 1.2).normalize();
    out.push({
      p0: slab.pos.clone().add(local),
      v: dir.multiplyScalar(1.6 + r() * 3.4),
      axis: new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize(),
      spin: 4 + r() * 9,
      size: 0.05 + r() * 0.1,
      delay: Math.floor(r() * 4),
    });
  }
  return out;
}

export function chipState(c: Chip, f: number) {
  const s = (f - F_CRACK_END - c.delay) / 60;
  if (s <= 0 || f > 92) return null;
  const k = 2.4;
  const drag = (1 - Math.exp(-k * s)) / k;
  const pos = c.p0.clone().add(c.v.clone().multiplyScalar(drag)).add(new THREE.Vector3(0, -0.5 * s * s, 0));
  const life = clamp01((f - 62) / 30);
  const scale = c.size * easeOutCubic(s * 20) * (1 - smooth(life));
  return { pos, q: new THREE.Quaternion().setFromAxisAngle(c.axis, c.spin * s), scale };
}
