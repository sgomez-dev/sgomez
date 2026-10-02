import type { Primitive } from "../types";

export const COUNT_MS = 1400;

/**
 * Cifras que cuentan de 0 al valor una vez, al estar la fila al 60% visible.
 * Lo que ya está en pantalla (o por encima) al llegar el runtime se queda con su
 * número. El número real vive siempre en el `sr-only`; esto solo toca la copia
 * visual (`aria-hidden`). El parado deja el valor final.
 */
export const run: Primitive = (el, ctx) => {
  const visual = el.querySelector<HTMLElement>("[data-count]");
  const target = Number(el.dataset.value);
  if (!visual || !Number.isFinite(target)) return;
  if (el.getBoundingClientRect().top < innerHeight) return;
  const final = String(target);
  visual.textContent = "0";
  let started = false;
  let stopCount: (() => void) | undefined;
  const stopView = ctx.inView(
    el,
    () => {
      if (started) return;
      started = true;
      stopCount = ctx.count(0, target, { duration: COUNT_MS, onUpdate: (v) => (visual.textContent = String(v)) });
    },
    { amount: 0.6 },
  );
  return () => {
    stopView();
    stopCount?.();
    visual.textContent = final;
  };
};
