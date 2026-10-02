/**
 * Suelta un `<video>`: lo pausa, le quita las `source` y llama a `load()`, que cancela la descarga y libera el decodificador.
 * Sin esto, un vídeo que solo se quita del documento sigue reteniendo su búfer hasta que lo recoge el recolector.
 */
export function releaseVideo(v: HTMLVideoElement): void {
  v.pause();
  for (const s of Array.from(v.querySelectorAll("source"))) s.remove();
  v.removeAttribute("src");
  v.load();
  v.remove();
}
