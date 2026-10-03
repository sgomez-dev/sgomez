import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { scrollToProgress, settledInViewport } from "./motion-utils";

const starts = (page: Page) => page.evaluate(() => (window as { __MOTION_STARTS__?: number }).__MOTION_STARTS__ ?? 0);
const mx = (page: Page) => page.locator('[data-motion="intent"]').first().evaluate((el) => el.style.getPropertyValue("--mx"));
/** El CSS de movimiento es estatico (E5 revisada): esta vivo en cuanto el estado es on. */
const hasCss = (page: Page, _name: string) => expect(page.locator("html")).toHaveAttribute("data-motion-state", "on");

/** Cuenta los oyentes de `pointermove` vivos en las tarjetas del contacto (los pone y quita el imán). */
const countPointerListeners = (page: Page) =>
  page.addInitScript(() => {
    const live = new Map<EventTarget, Set<unknown>>();
    const add = EventTarget.prototype.addEventListener;
    const rem = EventTarget.prototype.removeEventListener;
    EventTarget.prototype.addEventListener = function (this: EventTarget, type: string, fn: never, o?: never) {
      if (type === "pointermove") (live.get(this) ?? live.set(this, new Set()).get(this)!).add(fn);
      return add.call(this, type, fn, o);
    } as typeof add;
    EventTarget.prototype.removeEventListener = function (this: EventTarget, type: string, fn: never, o?: never) {
      if (type === "pointermove") live.get(this)?.delete(fn);
      return rem.call(this, type, fn, o);
    } as typeof rem;
    (window as unknown as { __pm: () => number }).__pm = () => [...document.querySelectorAll('[data-motion="intent"]')].reduce((n, el) => n + (live.get(el)?.size ?? 0), 0);
  });

test.describe("capítulos 08 y 09", () => {
  test("el muro de insignias a medio ensamblar pasa axe", async ({ page }) => {
    await page.goto("/");
    await hasCss(page, "mo-badge");
    await scrollToProgress(page, '#proof [data-motion="badge"]', 0.9);
    const r = await new AxeBuilder({ page }).include("#proof").withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(r.violations.map((v) => `${v.id} ${v.nodes[0]?.target}`)).toEqual([]);
  });

  test("las insignias se ensamblan al entrar y quedan enteras", async ({ page }) => {
    await page.goto("/");
    await hasCss(page, "mo-badge");
    // La última insignia es la última pastilla de emisores; `:last-child` a secas casaba antes con la tercera destacada.
    const last = '#proof ul:has(> [data-motion="badge"]):last-of-type > [data-motion="badge"]:last-child';
    const badge = page.locator(last);
    await scrollToProgress(page, last, 0.97);
    const mid = await badge.evaluate((el) => getComputedStyle(el).clipPath);
    await scrollToProgress(page, last, 0.4);
    await expect.poll(() => badge.evaluate((el) => getComputedStyle(el).scale)).toBe("1");
    expect(await badge.evaluate((el) => getComputedStyle(el).clipPath)).not.toBe(mid);
    expect(await settledInViewport(page)).toEqual([]);
  });

  test("las citas nunca se recortan", async ({ page }) => {
    await page.goto("/");
    await hasCss(page, "mo-quote");
    const quote = page.locator('#proof [data-motion="quote"]').first();
    await scrollToProgress(page, '#proof [data-motion="quote"]', 0.95);
    expect(await quote.evaluate((el) => getComputedStyle(el).clipPath)).toBe("none");
  });

  test("Review Focus 1: llegar a /#contact lo deja todo terminado", async ({ page }) => {
    await page.goto("/#contact");
    await hasCss(page, "mo-card");
    await page.waitForTimeout(300);
    expect(await settledInViewport(page)).toEqual([]);
  });

  test("llegar al final del documento lo deja todo terminado", async ({ page }) => {
    await page.goto("/");
    await hasCss(page, "mo-card");
    await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    await page.waitForTimeout(300);
    expect(await settledInViewport(page)).toEqual([]);
  });

  test("el imán inclina la tarjeta y vuelve a cero al salir", async ({ page }) => {
    test.skip(page.viewportSize()!.width < 1024, "solo con puntero fino de escritorio");
    await page.goto("/#contact");
    await expect.poll(() => starts(page), { timeout: 8000 }).toBe(1);
    await page.waitForTimeout(400);
    const card = page.locator('[data-motion="intent"]').first();
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const box = (await card.boundingBox())!;
    await page.mouse.move(box.x + box.width - 4, box.y + 4);
    await expect.poll(async () => parseFloat(await mx(page))).toBeGreaterThan(4);
    expect(parseFloat(await mx(page))).toBeLessThanOrEqual(8.5);
    await page.mouse.move(0, 0);
    await expect.poll(() => mx(page)).toBe("0px");
  });

  test("sin puntero fino no hay imán: ni oyentes ni transform", async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    await countPointerListeners(page);
    await page.goto("/#contact");
    await expect.poll(() => starts(page), { timeout: 8000 }).toBe(1);
    expect(await page.evaluate(() => (window as unknown as { __pm: () => number }).__pm())).toBe(0);
    expect(await page.locator('[data-motion="intent"]').first().evaluate((el) => getComputedStyle(el).transform)).toBe("none");
    await ctx.close();
  });

  test("Review Focus 4: un solo oyente por elemento tras ir y volver", async ({ page }) => {
    test.skip(page.viewportSize()!.width < 1024, "solo escritorio");
    await countPointerListeners(page);
    await page.goto("/");
    await expect.poll(() => starts(page), { timeout: 8000 }).toBe(1);
    await expect.poll(() => page.evaluate(() => (window as unknown as { __pm: () => number }).__pm())).toBe(3);
    await page.locator("footer").getByRole("link", { name: /sobre mí|about/i }).first().click();
    await page.waitForURL(/about/);
    await page.goBack();
    await expect.poll(() => starts(page), { timeout: 8000 }).toBe(2);
    await expect.poll(() => page.evaluate(() => (window as unknown as { __pm: () => number }).__pm())).toBe(3);
  });

  test("movimiento reducido: sin imán, sin animaciones y todo visible", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#contact");
    await page.waitForTimeout(1000);
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    expect(await page.locator('[data-motion="intent"]').first().evaluate((el) => getComputedStyle(el).clipPath)).toBe("none");
    await expect(page.locator('[data-motion="intent"] a').first()).toBeVisible();
  });

  test("cambiar a movimiento reducido a mitad de visita lo devuelve todo a su sitio", async ({ page }) => {
    await page.goto("/#contact");
    await expect.poll(() => starts(page), { timeout: 8000 }).toBe(1);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator("html")).toHaveAttribute("data-motion-state", "off");
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    expect(await page.evaluate(() => document.querySelectorAll('[data-motion="intent"][style*="--mx"]').length)).toBe(0);
  });

  test("con el teclado la tarjeta es un enlace normal con foco visible", async ({ page }) => {
    await page.goto("/#contact");
    const link = page.locator('[data-motion="intent"] a').first();
    await link.focus();
    await expect(link).toBeFocused();
    expect(await link.getAttribute("href")).toMatch(/^mailto:/);
  });
});
