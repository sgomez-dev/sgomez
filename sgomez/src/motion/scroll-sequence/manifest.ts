export type SizeKey = "desktop" | "mobile";
export type SequenceSize = { w: number; h: number; path: string };

/** Una secuencia de fotogramas WebP. Los ficheros son `<path>/0001.webp` y siguientes. */
export type SequenceManifest = {
  id: string;
  frames: number;
  width: number;
  height: number;
  sizes: Record<SizeKey, SequenceSize>;
  /** El último fotograma: es lo que ven el SSR, el movimiento reducido, Save-Data y quien no tiene JS. */
  poster: string;
};

export const framePath = (size: SequenceSize, index: number) => `${size.path}/${String(index + 1).padStart(4, "0")}.webp`;

/** Manifiesto estándar de una pieza renderizada por `video/scripts/render.mjs`. */
export function defineSequence(id: string, frames: number, desktop: { w: number; h: number }, mobile: { w: number; h: number }): SequenceManifest {
  return {
    id,
    frames,
    width: desktop.w,
    height: desktop.h,
    sizes: {
      desktop: { ...desktop, path: `/media/${id}/desktop` },
      mobile: { ...mobile, path: `/media/${id}/mobile` },
    },
    poster: `/media/${id}/poster.webp`,
  };
}
