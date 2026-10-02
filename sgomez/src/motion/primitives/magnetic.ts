import type { Primitive } from "../types";

/** Solo con puntero fino y hover. El elemento sigue siendo un <a> normal: su zona activa se mueve con él. El `transform` que lo mueve está en motion.css, tras `data-motion-ready`. */
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
