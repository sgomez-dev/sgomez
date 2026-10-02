import { test, expect } from "./fixtures";

test("las fuentes salen del propio sitio y se precargan", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (r) => {
    if (/fonts\.(googleapis|gstatic)\.com/.test(r.url())) external.push(r.url());
  });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  expect(external).toEqual([]);
  const preloads = await page.locator('link[rel="preload"][as="font"]').evaluateAll((ls) => ls.map((l) => (l as HTMLLinkElement).href));
  expect(preloads.length).toBeGreaterThanOrEqual(2);
  expect(preloads.every((h) => h.includes("/_next/static/media/"))).toBe(true);
  const loaded = await page.evaluate(() => [...document.fonts].filter((f) => f.status === "loaded").map((f) => `${f.weight} ${f.style}`));
  expect(loaded).toEqual(expect.arrayContaining(["600 normal", "400 italic"]));
});
