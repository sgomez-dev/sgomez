/**
 * El logotipo de SkyQuetz que se forma a partir de fragmentos de cristal (`SkyQuetzMonogram` en video/). El último
 * fotograma es la imagen de la página (`skyquetz.logo`, 425x253): el vídeo mide el doble exacto, 850x506.
 */
export const MONOGRAM_SRC = {
  webm: "/media/skyquetz/monogram.webm",
  mp4: "/media/skyquetz/monogram.mp4",
} as const;

/** Proporción del SVG de Forgia (su viewBox, 4945x728). */
const FORGIA_RATIO = 728 / 4945;
const FORGIA_LOGO_W = 816;
const FORGIA_LOGO_H = FORGIA_LOGO_W * FORGIA_RATIO;
const FORGIA_VIDEO_W = 912;
const FORGIA_VIDEO_H = 264;

/**
 * El logotipo de Forgia que se forma con el mismo cristal (`ForgiaReveal` en video/). Fuente única de la geometría: la
 * composición de Remotion la importa y el reproductor coloca el vídeo con ella.
 *
 * El logotipo es muy apaisado (6,8 a 1) y bajo (32 a 40 px en la página), así que el vídeo es más grande que la `<img>`:
 * el logotipo ocupa una banda centrada (816 px de ancho, unas 3 veces el de la página a 40 px) y el cristal tiene
 * margen arriba, abajo y a los lados. Fuera del logotipo el último fotograma es transparente (negro en el MP4, que la
 * página mezcla con `screen`), así que el relevo a la `<img>` no salta.
 *
 * `ember` es la brasa del DOM (`data-ember` en Forgia.tsx): centro al 98,08 % y al 86,95 % de la caja del SVG y un
 * diámetro del 4,2 % del ancho. El vídeo acaba con ella apagada (el 0 % de `mo-heat-ember`) y el CSS la enciende al
 * terminar.
 */
export const FORGIA_REVEAL = {
  webm: "/media/forgia/reveal.webm",
  mp4: "/media/forgia/reveal.mp4",
  video: { w: FORGIA_VIDEO_W, h: FORGIA_VIDEO_H },
  logo: { x: (FORGIA_VIDEO_W - FORGIA_LOGO_W) / 2, y: (FORGIA_VIDEO_H - FORGIA_LOGO_H) / 2, w: FORGIA_LOGO_W, h: FORGIA_LOGO_H },
  ember: { cx: 0.9808, cy: 0.8695, d: 0.042, cold: "#4a4540" },
} as const;

/** Caja del vídeo de Forgia relativa a la `<img>` (porcentajes de su ancho y de su alto). */
export function forgiaVideoBox(): { left: string; top: string; width: string; height: string } {
  const { video, logo } = FORGIA_REVEAL;
  const pct = (v: number) => `${((v) * 100).toFixed(4)}%`;
  return { left: pct(-logo.x / logo.w), top: pct(-logo.y / logo.h), width: pct(video.w / logo.w), height: pct(video.h / logo.h) };
}
