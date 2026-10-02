import * as THREE from "three";
import { mulberry32 } from "../../sgomez/src/lib/lost/shards";

/**
 * Línea de tiempo pura del capítulo 03: (losa, fotograma) -> transformación. Sin estado ni azar sin semilla.
 * Seis losas llegan de lejos y se apilan en el orden de la lista (la primera, arriba). El último fotograma
 * es el póster: las seis quietas en su sitio.
 */

export const LAYERS = 6;
export const BUILD_FRAMES = 90;
export const BUILD_FPS = 30;
export const BUILD_LAST = BUILD_FRAMES - 1;

/** Cada losa tarda FLY fotogramas en llegar y sale STAGGER después de la anterior. Todas quietas desde STAGGER*5+FLY (el 54 % del scroll de la caja: la pila se completa con la caja aún a la vista). */
const STAGGER = 4;
const FLY = 28;

/** Montón: inclinación y giro del conjunto, separación entre losas en su eje y escala de cada una. */
export const STACK = {
  pitch: -1.12,
  yaw: 0.42,
  roll: 0.08,
  gap: 0.7,
  scale: 1.0,
  /** Desplazamiento del montón en el encuadre. */
  pos: [0, 0.05, 0] as const,
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const easeOutQuart = (t: number) => 1 - Math.pow(1 - clamp01(t), 4);
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

const stackQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(STACK.pitch, STACK.yaw, STACK.roll, "XYZ"));

export type SlabState = { pos: THREE.Vector3; q: THREE.Quaternion; scale: number };

/** Sitio final de la losa i en el montón. */
export function restPose(i: number): { pos: THREE.Vector3; q: THREE.Quaternion } {
  const z = ((LAYERS - 1) / 2 - i) * STACK.gap * STACK.scale;
  const pos = new THREE.Vector3(0, 0, z).applyQuaternion(stackQ).add(new THREE.Vector3(...STACK.pos));
  return { pos, q: stackQ.clone() };
}

const starts = Array.from({ length: LAYERS }, (_, i) => {
  const r = mulberry32(4200 + i);
  const side = i % 2 === 0 ? -1 : 1;
  return {
    off: new THREE.Vector3(side * (4.2 + r() * 2.2), (r() - 0.35) * 3.4, -(14 + i * 2.2 + r() * 3)),
    axis: new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize(),
    turn: 1.6 + r() * 1.2,
  };
});

export function slabState(i: number, f: number): SlabState {
  const rest = restPose(i);
  const s = starts[i]!;
  const t = clamp01((f - i * STAGGER) / FLY);
  const e = easeOutQuart(t);
  if (t >= 1) return { pos: rest.pos.clone(), q: rest.q.clone(), scale: STACK.scale };
  const pos = rest.pos.clone().add(s.off.clone().multiplyScalar(1 - e));
  const spin = new THREE.Quaternion().setFromAxisAngle(s.axis, s.turn * (1 - easeOutCubic(t)));
  const q = spin.multiply(rest.q);
  return { pos, q, scale: STACK.scale };
}
