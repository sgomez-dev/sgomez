import * as THREE from "three";
import { SHARDS, mulberry32 } from "../../sgomez/src/lib/lost/shards";
import { cells } from "./geometry";

/**
 * Línea de tiempo pura del capítulo 07 (SkyQuetzMonogram): 2,5 s a 60 fps, 850x506 (el doble del logotipo de la página).
 * Los doce fragmentos del cristal del 404 llegan de lejos, girando, y se juntan en una placa de cristal entera. El logotipo
 * se enfoca ENCIMA de la placa, que aún está entera, y solo cuando ya se lee el cristal se funde a transparente. Así nunca
 * hay un cristal a medio opacar sobre un logotipo a medio formar (un velo gris que oscurecía los dos): el logotipo ya está
 * casi entero cuando el cristal empieza a irse, y el cristal se va rápido. Los últimos fotogramas son SOLO el logotipo,
 * igual que la `<img>` del capítulo: el relevo a la imagen del DOM no salta.
 *
 *    0 a  84   los fragmentos vuelan y se asientan (cada uno con su retraso)
 *   84 a  92   la placa entera brilla
 *   92 a 118   el logotipo se enfoca sobre la placa
 *  110 a 122   la placa se deshace en manchas hasta quedar transparente (el logotipo ya está casi entero)
 *  126 a 149   solo el logotipo
 */
export const MONO_FPS = 60;
export const MONO_FRAMES = 150;
export const MONO_LAST = MONO_FRAMES - 1;
/** El logotipo mide 425x253: el vídeo es su doble exacto. */
export const MONO_W = 850;
export const MONO_H = 506;

export const F_FLY_END = 84;
/** El logotipo empieza a enfocarse (sobre la placa entera) y acaba de hacerlo. */
export const F_LOGO_START = 92;
export const F_LOGO_END = 118;
/**
 * La placa se va cuando el logotipo ya se lee. No baja de opacidad (un cristal a medio opacar sobre negro es un velo gris):
 * se disuelve con un umbral de ruido (ver SkyQuetzMonogram), así cada punto es cristal vivo o es transparente, y solo hay
 * un borde fino entre ambos.
 */
export const F_GLASS_START = 108;
export const F_GLASS_END = 126;

/** Cómo se despliega la placa en el encuadre: más ancha que alta, como el logotipo. */
/** `sx` estira la placa entera en horizontal (posiciones Y formas de cada fragmento), así las celdas siguen encajando. */
export type Layout = { sx: number; scale: number; shard: number };
export const LAYOUT: Layout = { sx: 1.7, scale: 1.45, shard: 0.99 };

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smooth = (t: number) => {
  const x = clamp01(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
};
const easeOutQuart = (t: number) => 1 - Math.pow(1 - clamp01(t), 4);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

/** Cabeceo leve de la placa entera: que no sea un plano frontal sin vida. */
const TILT = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.07, 0.16, 0.02, "YXZ"));

export type MonoShard = { pos: THREE.Vector3; q: THREE.Quaternion; scale: number };

const FLY = 68;
const starts = SHARDS.map((_, i) => {
  const r = mulberry32(5100 + i);
  const a = r() * Math.PI * 2;
  const R = 4 + r() * 3.5;
  return {
    off: new THREE.Vector3(Math.cos(a) * R * 1.35, Math.sin(a) * R * 0.75, -(2.5 + r() * 5)),
    axis: new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize(),
    turns: 0.5 + r() * 0.7,
    delay: Math.floor(r() * 16),
  };
});

/** Sitio de reposo de la celda i en la placa entera (ya con el cabeceo). */
export function restShard(i: number, layout: Layout = LAYOUT): MonoShard {
  const c = cells[i]!;
  const local = new THREE.Vector3(c.cx * layout.sx * layout.scale, c.cy * layout.scale, (i % 4) * 0.014).applyQuaternion(TILT);
  return { pos: local, q: TILT.clone(), scale: c.radius * layout.scale * layout.shard };
}

export function monoShardState(i: number, f: number, layout: Layout = LAYOUT): MonoShard {
  const rest = restShard(i, layout);
  const s = starts[i]!;
  const t = clamp01((f - s.delay) / FLY);
  if (t >= 1) return rest;
  const e = easeOutQuart(t);
  // Un encuadre más apaisado que el de SkyQuetz (sx mayor) abre la salida en horizontal, para que nada empiece ya dentro.
  const off = s.off.clone();
  off.x *= layout.sx / LAYOUT.sx;
  const pos = rest.pos.clone().add(off.multiplyScalar(1 - e));
  const k = 1 - easeOutCubic(t);
  const spin = new THREE.Quaternion().setFromAxisAngle(s.axis, Math.PI * 2 * s.turns * k);
  return { pos, q: spin.multiply(rest.q), scale: rest.scale * (0.4 + 0.6 * easeOutCubic(t * 1.15)) };
}

/** Cuánto queda de la placa (1 a 0): entera hasta F_GLASS_START y nada en F_GLASS_END. */
export const glassOpacity = (f: number) => 1 - smooth((f - F_GLASS_START) / (F_GLASS_END - F_GLASS_START));
/** Cuánto se ha formado el logotipo (0 a 1): llega antes de que el cristal empiece a irse. */
export const logoReveal = (f: number) => smooth((f - F_LOGO_START) / (F_LOGO_END - F_LOGO_START));
/** Destello menta justo cuando la placa se completa. */
export const flash = (f: number) => (f < F_FLY_END - 4 ? 0 : Math.exp(-(f - (F_FLY_END - 4)) / 6));
