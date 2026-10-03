import type { Primitive } from "../types";
import { revealOnEnter } from "../reveal-fallback";

/** Titulares de capítulo. Con `animation-timeline` el movimiento es CSS estático (motion.css, E5 revisada); aquí solo vive el respaldo de Firefox. El h1 del hero (LCP) no se anima. */
/** Sin animation-timeline (Firefox): revelado ligero al entrar (E2). */
export const fallback: Primitive = (el) => {
  if (el.tagName !== "H2") return;
  return revealOnEnter([el]);
};
