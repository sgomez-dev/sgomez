import type { Page } from "@playwright/test";

/** El Chromium de CI pinta WebGL por software: el worker lo descartaría. Esto lo fuerza, como __LOST_FORCE_GATE__ en el 404. */
export async function forceGlass(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __GLASS_FORCE_GATE__: boolean }).__GLASS_FORCE_GATE__ = true;
  });
}

/** Tareas largas del hilo principal desde el inicio de la carga. */
export async function watchLongTasks(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __lt: { start: number; d: number }[] };
    w.__lt = [];
    new PerformanceObserver((l) => l.getEntries().forEach((e) => w.__lt.push({ start: e.startTime, d: e.duration }))).observe({ type: "longtask", buffered: true });
  });
}

/** LCP observado desde el inicio (getEntriesByType no lo trae sin observador). */
export async function watchLcp(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __lcp: { tag: string; t: number } };
    w.__lcp = { tag: "", t: 0 };
    new PerformanceObserver((l) => l.getEntries().forEach((e) => (w.__lcp = { tag: (e as PerformanceEntry & { element?: Element }).element?.tagName ?? "", t: e.startTime }))).observe({ type: "largest-contentful-paint", buffered: true });
  });
}

/** Huecos entre requestAnimationFrame del hilo principal, con su instante. */
export async function watchRafGaps(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __gaps: { t: number; gap: number }[] };
    w.__gaps = [];
    let last = performance.now();
    const f = (t: number) => {
      w.__gaps.push({ t, gap: t - last });
      last = t;
      requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  });
}

/** Tareas largas entre glass:start:<id> y glass:ready:<id>. */
export async function longTasksDuringGlass(page: Page, id: string) {
  return page.evaluate((id) => {
    const s = performance.getEntriesByName(`glass:start:${id}`)[0]?.startTime ?? Infinity;
    const r = performance.getEntriesByName(`glass:ready:${id}`)[0]?.startTime ?? -Infinity;
    return (window as unknown as { __lt: { start: number; d: number }[] }).__lt.filter((t) => t.start + t.d > s && t.start < r).map((t) => Math.round(t.d));
  }, id);
}

/** Mayor hueco de rAF a partir de glass:start:<id>. */
export async function maxRafGapAfterStart(page: Page, id: string) {
  return page.evaluate((id) => {
    const s = performance.getEntriesByName(`glass:start:${id}`)[0]?.startTime ?? Infinity;
    const gaps = (window as unknown as { __gaps: { t: number; gap: number }[] }).__gaps.filter((g) => g.t >= s);
    return Math.round(Math.max(0, ...gaps.map((g) => g.gap)));
  }, id);
}

/** Bloquea el worker del cristal por su contenido (el nombre cambia en cada build). */
export async function blockGlassWorker(page: Page) {
  const state = { aborted: false };
  await page.context().route("**/_next/static/**/*.js", async (route) => {
    const res = await route.fetch();
    const body = await res.text();
    if (body.includes("sgomez-glass-worker")) {
      state.aborted = true;
      await route.abort();
    } else await route.fulfill({ response: res, body });
  });
  return state;
}
