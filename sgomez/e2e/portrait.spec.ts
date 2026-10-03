import { test, expect } from "./fixtures";

/**
 * C1: el retrato del hero es el LCP y se precarga. Si `sizes` no coincide con el
 * ancho real, la precarga elige un candidato y la imagen otro, y se descarga dos
 * veces (Chrome avisa «preloaded but not used»). El aviso solo salta cuando el
 * escáner de precarga y el diseño ven un viewport distinto, que es justo lo que
 * pasa en un móvil real (la pantalla es más ancha que el viewport emulado), así
 * que el contexto lo reproduce con `screen` mayor que `viewport`.
 */
const CASES = [
  { name: "móvil 375", viewport: { width: 375, height: 812 }, screen: { width: 412, height: 915 }, dpr: 2.625, mobile: true },
  { name: "móvil 375 dpr 3", viewport: { width: 375, height: 812 }, screen: { width: 430, height: 932 }, dpr: 3, mobile: true },
  { name: "escritorio 1280", viewport: { width: 1280, height: 800 }, screen: { width: 1920, height: 1080 }, dpr: 1, mobile: false },
  { name: "móvil horizontal 844x390", viewport: { width: 844, height: 390 }, screen: { width: 915, height: 412 }, dpr: 2.625, mobile: true },
];

for (const c of CASES) {
  for (const path of ["/", "/en"]) {
    test(`${c.name} ${path}: una sola petición del retrato y sin aviso de precarga`, async ({ browser }, info) => {
      // Cada caso crea su propio contexto: no hace falta repetirlo por proyecto.
      test.skip(info.project.name !== "desktop", "los casos ya fijan su viewport");
      const context = await browser.newContext({ viewport: c.viewport, screen: c.screen, deviceScaleFactor: c.dpr, isMobile: c.mobile, hasTouch: c.mobile });
      const page = await context.newPage();
      const portraitRequests: string[] = [];
      const warnings: string[] = [];
      page.on("request", (r) => {
        if (r.url().includes("/_next/image") && decodeURIComponent(r.url()).includes("Santiago_G")) portraitRequests.push(r.url());
      });
      page.on("console", (m) => {
        if (m.type() === "warning" || m.type() === "error") warnings.push(m.text());
      });
      await page.goto(path, { waitUntil: "load" });
      // Chrome avisa unos segundos después del load.
      await page.waitForTimeout(5500);
      const used = await page.evaluate(() => (document.querySelector('img[alt^="Retrato"], img[alt^="Portrait"]') as HTMLImageElement | null)?.currentSrc ?? "");
      expect(portraitRequests, "peticiones del retrato").toHaveLength(1);
      expect(portraitRequests[0]).toBe(used);
      expect(warnings.filter((w) => /preload/i.test(w)), "avisos de precarga").toEqual([]);
      await context.close();
    });
  }
}
