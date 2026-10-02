import * as THREE from "three";
import { unproject } from "../../sgomez/src/lib/lost/shards";

/**
 * Línea de tiempo pura del bucle del hero (HeroLoop): 6 s a 30 fps, 720x720. Es la escena en vivo del hero
 * (`GlassScene.ts`: misma cámara, mismo sitio y escala de `PLACEMENTS.hero`, mismo cristal y mismo fondo de refracción)
 * con el movimiento hecho periódico: flotar y girar poco con senos de un solo periodo. El fotograma 0 es el t=0 de la escena
 * en vivo (sin giro extra, escala 1), que es lo que coincide con el póster SVG, y el 180 sería otra vez el 0: bucle perfecto.
 */
export const HERO_FPS = 30;
export const HERO_FRAMES = 180;
export const HERO_SIZE = 720;

/** Copia de `PLACEMENTS.hero` (sgomez/src/three/protocol.ts): ese fichero arrastra el alias `@/` y no se puede importar desde aquí. `sgomez/tests/hero-media.test.ts` comprueba que no se separan. */
export const P = { left: 63.6, top: 42.1, z: 0, scale: 0.985, rest: { rx: -0.1, ry: 0.12, rz: 0 } };
export const HERO_BASE = unproject(P.left, P.top, P.z, 1);
export const HERO_SCALE = P.scale;
const restQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(P.rest.rx, P.rest.ry, P.rest.rz, "XYZ"));

export type HeroPose = { pos: THREE.Vector3; q: THREE.Quaternion; scale: number };

export function heroPose(f: number): HeroPose {
  const w = (Math.PI * 2 * f) / HERO_FRAMES;
  const s = Math.sin(w);
  const pos = new THREE.Vector3(HERO_BASE.x + 0.06 * Math.sin(w + 1.1) - 0.06 * Math.sin(1.1), HERO_BASE.y + 0.07 * s, P.z);
  const wob = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.06 * s, 0.17 * Math.sin(w + 0.6) - 0.17 * Math.sin(0.6), 0.035 * (Math.cos(w) - 1), "XYZ"));
  return { pos, q: restQ.clone().multiply(wob), scale: HERO_SCALE };
}
