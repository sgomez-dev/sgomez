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
