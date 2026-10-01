/**
 * Elección de medios y puerta de entrada del 404 animado. Funciones puras: el
 * cliente les pasa lo que mide (UA, núcleos, WebGL2...) y los tests las ejercitan.
 */

/**
 * Safari (macOS, iOS y cualquier navegador de iOS, que es WebKit) dice que
 * reproduce VP9 en WebM pero IGNORA su canal alfa. Ahí se sirve `shatter.mp4`,
 * renderizado sobre negro puro, con `mix-blend-mode: screen`.
 */
export function needsOpaqueVideo(ua: string, maxTouchPoints = 0): boolean {
  if (/\b(iPhone|iPad|iPod)\b/.test(ua)) return true;
  // iPadOS en modo escritorio se presenta como Macintosh, pero con pantalla táctil.
  if (/Macintosh/.test(ua) && maxTouchPoints > 1) return true;
  return /Safari\//.test(ua) && !/(Chrome|Chromium|CriOS|FxiOS|Edg|OPR|Android|Firefox)/.test(ua);
}

export type Gate = {
  webgl2: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  cores: number | undefined;
  /** El WebGL2 lo pinta la CPU (SwiftShader, llvmpipe): 12 fragmentos de vidrio irían a tirones. */
  software?: boolean;
};

/** ¿El nombre del renderizador de WebGL es uno por software? */
export function isSoftwareRenderer(name: string): boolean {
  return /swiftshader|llvmpipe|softpipe|software|microsoft basic render/i.test(name);
}

/** WebGL2 por hardware, sin `prefers-reduced-motion`, sin Save-Data y 4 núcleos o más (si se sabe). */
export function gatingPasses(g: Gate): boolean {
  return g.webgl2 && !g.software && !g.reducedMotion && !g.saveData && (g.cores === undefined || g.cores >= 4);
}

export const VIDEO_SRC = { webm: "/media/404/shatter.webm", mp4: "/media/404/shatter.mp4" } as const;
