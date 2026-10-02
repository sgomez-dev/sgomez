/**
 * Reels del capítulo 05 (`ProjectReel` en video/): uno por proyecto destacado cuya URL pública respondió al capturarla.
 * Un proyecto que no está aquí se queda con la ficha de iniciales y stack, sin reel (no se inventa ninguna pantalla).
 */
export const REEL_SLUGS: readonly string[] = ["claude-canvas", "nudaui-semantic-search-rag", "nudaui"];

/** Proporción y tamaño del reel y de su póster (el fotograma 0). */
export const REEL_SIZE = { width: 960, height: 540 } as const;

export const hasReel = (slug: string) => REEL_SLUGS.includes(slug);

export function reelSources(slug: string) {
  return {
    webm: `/media/reels/${slug}.webm`,
    mp4: `/media/reels/${slug}.mp4`,
    poster: `/media/reels/${slug}.webp`,
  } as const;
}
