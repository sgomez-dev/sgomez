import type { Primitive } from "../types";
import { revealOnEnter } from "../reveal-fallback";

/**
 * Tarjetas que se construyen en cuatro tiempos sobre una línea de tiempo con
 * nombre (`--build`), escalonadas por `--i`: plano (trazo), borde, relleno y
 * contenido. Todo termina como tarde en `entry 100%`.
 * `mo-deco-fade` es opacity solo sobre la capa decorativa `aria-hidden`.
 */
const S = "calc(var(--i, 0) * var(--mo-stagger))";
export const css = `
@keyframes mo-trace { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes mo-deco-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes mo-fill {
  from { clip-path: inset(100% 0 0 0 round var(--radius)); }
  to { clip-path: inset(0 round var(--radius)); }
}
@keyframes mo-content {
  from { clip-path: inset(0 0 100% 0); translate: 0 var(--mo-rise); }
  to { clip-path: inset(-2rem); translate: 0 0; }
}
:root[data-motion-state="on"] [data-motion="build"] { view-timeline: --build block; }
:root[data-motion-state="on"] [data-motion="build"] > [data-layer="trace"] rect {
  animation: mo-trace linear both;
  animation-timeline: --build;
  animation-range: entry ${S} entry calc(45% + ${S});
}
:root[data-motion-state="on"] [data-motion="build"] > [data-layer="outline"] {
  animation: mo-deco-fade linear both;
  animation-timeline: --build;
  animation-range: entry calc(35% + ${S}) entry calc(55% + ${S});
}
:root[data-motion-state="on"] [data-motion="build"] > [data-layer="fill"] {
  animation: mo-fill linear both;
  animation-timing-function: var(--mo-ease);
  animation-timeline: --build;
  animation-range: entry calc(40% + ${S}) entry calc(70% + ${S});
}
:root[data-motion-state="on"] [data-motion="build"] > [data-layer="content"] {
  animation: mo-content linear both;
  animation-timing-function: var(--mo-ease);
  animation-timeline: --build;
  animation-range: entry calc(55% + ${S}) entry 100%;
}
`;

export const fallback: Primitive = (el) => revealOnEnter([el]);
