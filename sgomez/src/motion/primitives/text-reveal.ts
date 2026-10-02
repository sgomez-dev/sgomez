import type { Primitive } from "../types";
import { revealOnEnter } from "../reveal-fallback";

/**
 * Titulares de capítulo: suben desde una máscara al entrar. CSS ligado al scroll,
 * sin JS en marcha. Solo `h2` (el h1 del hero es el LCP y no se anima).
 * Sin opacity ni filter: el texto conserva su contraste en cada estado.
 */
export const css = `
@keyframes mo-rise {
  from { clip-path: inset(-0.25em -0.25em 100% -0.25em); translate: 0 0.4em; }
  to { clip-path: inset(-0.25em); translate: 0 0; }
}
:root[data-motion-state="on"] h2[data-motion="text-reveal"] {
  animation: mo-rise linear both;
  animation-timing-function: var(--mo-ease);
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}
`;

/** Sin animation-timeline (Firefox): revelado ligero al entrar (E2). */
export const fallback: Primitive = (el) => {
  if (el.tagName !== "H2") return;
  return revealOnEnter([el]);
};
