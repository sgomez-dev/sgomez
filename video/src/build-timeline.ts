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

/** Cada losa tarda FLY fotogramas en llegar y sale STAGGER después de la anterior. Todas quietas desde STAGGER*5+FLY (el 60 % del scroll del capítulo, y el resto es la composición quieta). */
const STAGGER = 6;
const FLY = 30;

/** Vista despiezada: seis placas horizontales (silueta del póster en el plano XZ), alineadas y bien separadas en y. */
export const STACK = {
  /** Giro de las placas sobre el eje vertical: casi nada, para que cada capa se lea. */
  yaw: 0.22,
  gap: 1.25,
  scale: 0.85,
  pos: [0, 0, 0] as const,
};

/** Cámara elevada unos 32 grados mirando al centro de la pila. */
export const VIEW = { elevation: (32 * Math.PI) / 180, distance: 14.5 };

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const easeOutQuart = (t: number) => 1 - Math.pow(1 - clamp01(t), 4);
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

// La silueta está en XY; -90 grados sobre X la tumba al plano XZ con la cara superior mirando a +y.
const flat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
const restQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), STACK.yaw).multiply(flat);

export type SlabState = { pos: THREE.Vector3; q: THREE.Quaternion; scale: number };

/** Sitio final de la losa i: la primera de la lista arriba, la última abajo. */
export function restPose(i: number): { pos: THREE.Vector3; q: THREE.Quaternion } {
  const y = ((LAYERS - 1) / 2 - i) * STACK.gap;
  return { pos: new THREE.Vector3(STACK.pos[0], STACK.pos[1] + y, STACK.pos[2]), q: restQ.clone() };
}

const starts = Array.from({ length: LAYERS }, (_, i) => {
  const r = mulberry32(4200 + i);
  const side = i % 2 === 0 ? -1 : 1;
  return {
    // llega de lejos por el rayo de la cámara (así sigue dentro del encuadre y no entra por arriba) y algo de lado
    off: new THREE.Vector3(side * (1.2 + r() * 1.2), 0, 0).add(new THREE.Vector3(0, -Math.sin(VIEW.elevation), -Math.cos(VIEW.elevation)).multiplyScalar(14 + i * 1.5)),
    tilt: new THREE.Vector3(0.5 + r() * 0.4, side * (0.6 + r() * 0.6), side * 0.3),
  };
});

export function slabState(i: number, f: number): SlabState {
  const rest = restPose(i);
  const s = starts[i]!;
  const t = clamp01((f - i * STAGGER) / FLY);
  if (t >= 1) return { pos: rest.pos.clone(), q: rest.q.clone(), scale: STACK.scale };
  const e = easeOutQuart(t);
  const pos = rest.pos.clone().add(s.off.clone().multiplyScalar(1 - e));
  const k = 1 - easeOutCubic(t);
  const wob = new THREE.Quaternion().setFromEuler(new THREE.Euler(s.tilt.x * k, s.tilt.y * k, s.tilt.z * k));
  return { pos, q: wob.multiply(rest.q), scale: STACK.scale };
}
