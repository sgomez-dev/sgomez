import type { Primitive } from "../types";

/** Solo con puntero fino y hover. El elemento sigue siendo un <a> normal: su zona activa se mueve con él. */
const FINE = "(hover: hover) and (pointer: fine)";

const px = (v: number) => `${Math.round(v * 10) / 10}px`;

export const run: Primitive = (el, ctx) => {
  if (!matchMedia(FINE).matches) return;
  const strength = el.dataset.motion === "magnetic" ? 6 : 8;
  const stop = ctx.pointer(el, {
    strength,
    onMove: (x, y) => {
      el.style.setProperty("--mx", px(x));
      el.style.setProperty("--my", px(y));
    },
  });
  return () => {
    stop();
    el.style.removeProperty("--mx");
    el.style.removeProperty("--my");
  };
};

/** El imán usa `transform`; las entradas, `translate` y `clip-path`: nunca dos mecanismos sobre la misma propiedad. */
export const magnetCss = `
@media ${FINE} {
  :root[data-motion-state="on"] [data-motion="intent"],
  :root[data-motion-state="on"] [data-motion="magnetic"] {
    transform: translate3d(var(--mx, 0px), var(--my, 0px), 0);
  }
}`;

export const css = magnetCss;
