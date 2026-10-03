/**
 * Línea de tiempo pura del reel de un proyecto (capítulo 05): 8 s a 30 fps, dos capturas (la primera pantalla y otra a media
 * página) con una cámara lenta sobre cada una y un fundido entre ambas. Sin texto. El último fotograma enlaza con el
 * primero (la primera captura vuelve en reposo), así que el bucle no da salto, y el fotograma 0 es el póster.
 */
export const REEL_FPS = 30;
export const REEL_FRAMES = 240;
export const REEL_W = 960;
export const REEL_H = 540;
/** Las capturas son de 1440x900: a 960 de ancho miden 960x600. */
export const SHOT = { w: 960, h: 600 };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export type Cam = { scale: number; ty: number };

/** Origen de la escala (px dentro de la captura): el zoom se abre hacia la zona alta izquierda, donde está el titular. */
export const ORIGIN = { x: 0.3 * SHOT.w, y: 0.3 * SHOT.h };

/** Primera pantalla: se acerca y baja un poco. En reposo hasta el 0 y otra vez en reposo desde el 210 (para enlazar el bucle). */
export function camTop(f: number): Cam {
  if (f >= 210) return { scale: 1, ty: 0 };
  const e = easeInOut(clamp01(f / 150));
  return { scale: 1 + 0.1 * e, ty: -34 * e };
}

/** Media página: entra algo acercada y se aleja subiendo. */
export function camMid(f: number): Cam {
  const e = easeInOut(clamp01((f - 100) / 130));
  return { scale: 1.1 - 0.1 * e, ty: -44 * (1 - e) };
}

/** Peso de la captura de media página: sube entre el 100 y el 130 y baja entre el 210 y el 239. */
export function midWeight(f: number): number {
  if (f < 210) return easeInOut(clamp01((f - 100) / 30));
  return 1 - easeInOut(clamp01((f - 210) / 29));
}
