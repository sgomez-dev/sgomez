import type { Page } from "@playwright/test";

/** Elementos animados enteros en el viewport cuya animación NO ha llegado al final. Vacío = bien. */
export async function settledInViewport(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const out: string[] = [];
    const vh = innerHeight;
    for (const el of document.querySelectorAll<HTMLElement>("[data-motion], [data-motion] *")) {
      const r = el.getBoundingClientRect();
      if (r.height === 0 || r.top < 0 || r.bottom > vh) continue;
      // la bio (Task 4) y la escena fijada (Task 5) dependen de la posición a propósito: no son entradas
      if (el.closest('[data-motion="word-reveal"], [data-pin]')) continue;
      for (const a of el.getAnimations()) {
        // el barrido de luz (E3) es un adorno de una pasada, no una entrada: no tiene que estar terminado al aterrizar
        if ((a as CSSAnimation).animationName?.startsWith("mo-light")) continue;
        if (a.effect?.getComputedTiming().progress !== 1) {
          out.push(`${el.tagName.toLowerCase()}[data-motion=${el.closest<HTMLElement>("[data-motion]")?.dataset.motion}] ${(a as CSSAnimation).animationName ?? ""}`);
        }
      }
    }
    return out;
  });
}

/** Pone el borde superior de `selector` en la fracción `fraction` del viewport (0 = arriba, 1 = abajo). */
export async function scrollToProgress(page: Page, selector: string, fraction: number) {
  await page.evaluate(
    ([sel, f]) => {
      const el = document.querySelector(sel as string)!;
      const top = el.getBoundingClientRect().top + scrollY;
      scrollTo({ top: top - innerHeight * (f as number), behavior: "instant" });
    },
    [selector, fraction] as const,
  );
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}

/** Suma de layout-shift sin input reciente mientras corre `fn`. */
export async function layoutShiftDuring(page: Page, fn: () => Promise<void>): Promise<number> {
  await page.evaluate(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
        if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
      }
    }).observe({ type: "layout-shift", buffered: false });
  });
  await fn();
  return page.evaluate(() => (window as unknown as { __cls: number }).__cls);
}

/** Animaciones sin terminar de los elementos `selector` que se ven al menos en `min` (0..1) de su alto. Vacío = bien. */
export async function unfinishedWhenMostlyVisible(page: Page, selector: string, min: number): Promise<string[]> {
  return page.evaluate(
    ([sel, m]) => {
      const out: string[] = [];
      for (const card of document.querySelectorAll<HTMLElement>(sel as string)) {
        const r = card.getBoundingClientRect();
        const seen = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0);
        if (r.height === 0 || seen / r.height < (m as number)) continue;
        for (const el of [card, ...card.querySelectorAll<HTMLElement>("*")]) {
          for (const a of el.getAnimations()) {
            const p = a.effect?.getComputedTiming().progress;
            if (p !== 1) out.push(`${el.tagName.toLowerCase()}${el.dataset.layer ? `[${el.dataset.layer}]` : ""} ${(a as CSSAnimation).animationName ?? ""} ${p}`);
          }
        }
      }
      return out;
    },
    [selector, min] as const,
  );
}
