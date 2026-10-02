/**
 * La bio se enciende palabra a palabra: cada `[data-w]` pasa de `--text-2` a
 * `--text` (los dos cumplen AA, así que el estado inicial ya es texto legible).
 * Hasta `lg` el párrafo usa su propia línea de tiempo; desde `lg` es sticky, su
 * posición no cambia y manda la rejilla que lo contiene (`data-reveal-scope`).
 * Es el único rango que usa `contain`; el resto termina en `entry 100%`.
 */
export const css = `
@keyframes mo-light { from { color: var(--text-2); } to { color: var(--text); } }
:root[data-motion-state="on"] [data-motion="word-reveal"] { view-timeline: --reveal block; }
:root[data-motion-state="on"] [data-motion="word-reveal"] [data-w] {
  animation: mo-light linear both;
  animation-timeline: --reveal;
  animation-range: contain calc(var(--i) / var(--n) * 60%) contain calc((var(--i) + 1) / var(--n) * 60%);
}
@media (min-width: 64rem) {
  :root[data-motion-state="on"] [data-reveal-scope] { view-timeline: --reveal block; }
  :root[data-motion-state="on"] [data-motion="word-reveal"] { view-timeline: none; }
}
`;
