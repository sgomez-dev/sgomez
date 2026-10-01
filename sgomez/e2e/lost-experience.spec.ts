import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";

/**
 * Ruta 3D del 404. El Chromium de CI pinta WebGL por software y la puerta de
 * `LostExperience` lo descarta; un init-script pone `__LOST_FORCE_GATE__` y
 * `readGate` lo respeta, así que aquí la ruta con vídeo y escena sí corre.
 */
const PATH = "/en/no-existe";
const SAFARI_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15";

test.beforeEach(({}, info) => {
  test.skip(info.project.name !== "desktop", "solo escritorio");
  test.setTimeout(90_000); // WebGL por software en paralelo con otros workers es lento
});

async function forceGate(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __LOST_FORCE_GATE__: boolean }).__LOST_FORCE_GATE__ = true;
  });
}

/** Aborta el chunk 3D por su CONTENIDO (el nombre del fichero cambia en cada build). */
async function blockSceneChunk(page: Page) {
  const state = { aborted: false };
  await page.route("**/_next/static/chunks/**/*.js", async (route) => {
    const res = await route.fetch();
    const body = await res.text();
    if (body.includes("PMREMGenerator")) {
      state.aborted = true;
      await route.abort();
    } else await route.fulfill({ response: res, body });
  });
  return state;
}

test("escena bloqueada: constelación estática completa, sin botón de pausa y sin quedarse en el vídeo", async ({ page, consoleErrors }) => {
  await forceGate(page);
  const blocked = await blockSceneChunk(page);
  // el vídeo puede montarse y retirarse entre dos comprobaciones: un observador lo registra
  await page.addInitScript(() => {
    const w = window as unknown as { __sawVideo?: boolean };
    new MutationObserver(() => {
      if (document.querySelector("[data-lost-video]")) w.__sawVideo = true;
    }).observe(document, { childList: true, subtree: true });
  });
  await page.goto(PATH);

  // la puerta pasó (el vídeo llegó a montarse, aunque se retire enseguida al fallar la escena) y el chunk 3D se abortó de verdad: si no, el test pasaría en vacío
  await expect.poll(() => page.evaluate(() => (window as unknown as { __sawVideo?: boolean }).__sawVideo === true), { timeout: 20_000 }).toBe(true);
  await expect.poll(() => blocked.aborted, { timeout: 20_000 }).toBe(true);

  const stage = page.locator('[data-stage="lost"]');
  // Pase lo que pase con el vídeo, la capa de vídeo acaba retirada y la estática visible.
  await expect(stage).not.toHaveAttribute("data-lost-cover", /video/, { timeout: 25_000 });
  await expect(page.locator("[data-lost-video]")).toHaveCount(0, { timeout: 25_000 });
  await expect(page.locator("[data-lost-canvas]")).toHaveCount(0);

  const anchors = page.locator("a[data-shard-id]");
  await expect(anchors).toHaveCount(7);
  for (const a of await anchors.all()) {
    expect(((await a.textContent()) ?? "").trim().length).toBeGreaterThan(0);
    await expect(a).toHaveAttribute("href", /.+/);
  }
  expect(await page.locator('svg[data-lost-static] line').count()).toBeGreaterThan(0);
  await expect(page.locator("button[aria-pressed]")).toHaveCount(0);
  await expect(page.locator('[data-lost-static]').first()).toHaveCSS("opacity", "1");
  // el aborto del chunk 3D es lo que provoca este único mensaje de consola: se espera, se filtra solo ese
  expect(blocked.aborted).toBe(true);
  const rest = consoleErrors.filter((e) => !/ERR_FAILED \(.*\/_next\/static\/chunks\/.+\.js\)/.test(e));
  consoleErrors.splice(0, consoleErrors.length, ...rest);
});

test("ruta 3D feliz: el lienzo aparece y el botón de pausa alterna aria-pressed", async ({ page }) => {
  await forceGate(page);
  await page.goto(PATH);
  await expect(page.locator("[data-lost-video]")).toBeAttached({ timeout: 20_000 });
  await expect(page.locator("[data-lost-canvas]")).toBeAttached({ timeout: 30_000 });
  // el relevo se completa: fase idle, la escena cubre lo estático, el vídeo se retira y el lienzo es opaco
  await expect(page.locator('[data-stage="lost"]')).toHaveAttribute("data-lost-phase", "idle", { timeout: 60_000 });
  await expect(page.locator('[data-stage="lost"]')).toHaveAttribute("data-lost-cover", "scene");
  await expect(page.locator("[data-lost-video]")).toHaveCount(0);
  await expect(page.locator("[data-lost-canvas]")).toHaveCSS("opacity", "1");
  const pause = page.locator("button[aria-pressed]");
  await expect(pause).toBeVisible();
  await expect(pause).toHaveAttribute("aria-pressed", "false");
  await pause.click();
  await expect(pause).toHaveAttribute("aria-pressed", "true");
  await pause.click();
  await expect(pause).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("a[data-shard-id]")).toHaveCount(7);
});

test("movimiento reducido: ni vídeo ni lienzo ni pausa", async ({ page }) => {
  await forceGate(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(PATH);
  await page.waitForTimeout(1500);
  await expect(page.locator("video")).toHaveCount(0);
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator("button[aria-pressed]")).toHaveCount(0);
  await expect(page.locator("a[data-shard-id]")).toHaveCount(7);
});

test("activar movimiento reducido a mitad de visita retira el vídeo y deja lo estático", async ({ page }) => {
  await forceGate(page);
  await page.goto(PATH);
  await expect(page.locator("[data-lost-video]")).toHaveCount(1, { timeout: 20_000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("[data-lost-video]")).toHaveCount(0);
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator('[data-stage="lost"]')).not.toHaveAttribute("data-lost-cover", /.+/);
  await expect(page.locator("a[data-shard-id]")).toHaveCount(7);
});

test("cruzar el breakpoint con el vídeo en marcha lo abandona y no vuelve", async ({ page }) => {
  await forceGate(page);
  await page.goto(PATH);
  await expect(page.locator("[data-lost-video]")).toHaveCount(1, { timeout: 20_000 });
  await page.setViewportSize({ width: 800, height: 900 });
  await expect(page.locator("[data-lost-video]")).toHaveCount(0, { timeout: 25_000 });
  // cruzar el breakpoint devuelve el escenario estático entero (nunca un escenario vacío)
  await expect(page.locator('[data-stage="lost"]')).toHaveAttribute("data-lost-phase", "static");
  await expect(page.locator("[data-lost-canvas]")).toHaveCount(0);
  await expect(page.locator('[data-stage="lost"]')).not.toHaveAttribute("data-lost-cover", /.+/);
  await expect(page.locator("[data-lost-static]").first()).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(1000);
  await expect(page.locator("[data-lost-video]")).toHaveCount(0);
  await expect(page.locator('[data-stage="lost"]')).not.toHaveAttribute("data-lost-cover", "video");
  await expect(page.locator("a[data-shard-id]")).toHaveCount(7);
});

test.describe("ruta de Safari (MP4 con mix-blend-mode: screen)", () => {
  test.use({ userAgent: SAFARI_UA });

  test("el vídeo vive en una capa hermana sin transform ni z-index, bajo el texto", async ({ page }) => {
    await forceGate(page);
    await page.goto(PATH);
    const video = page.locator('[data-lost-video="mp4"]');
    await expect(video).toHaveCount(1, { timeout: 20_000 });
    const chain = await video.evaluate((v) => {
      const out: { tag: string; transform: string; zIndex: string; position: string }[] = [];
      for (let n: Element | null = v.parentElement; n && n.tagName !== "SECTION"; n = n.parentElement) {
        const cs = getComputedStyle(n);
        out.push({ tag: n.tagName, transform: cs.transform, zIndex: cs.zIndex, position: cs.position });
      }
      return { out };
    });
    for (const c of chain.out) {
      expect(c.transform, `${c.tag} con transform`).toBe("none");
      expect(c.zIndex, `${c.tag} con z-index`).toBe("auto");
    }
    // el titular pinta por encima de la capa del vídeo
    const z = await page.evaluate(() => {
      const h1 = document.querySelector("h1")!;
      const c = h1.closest<HTMLElement>("[class*='z-10']")!;
      return getComputedStyle(c).zIndex;
    });
    expect(z).toBe("10");
  });

  test("sonda de píxeles: el MP4 mezcla con el fondo del sitio, no con negro", async ({ page }) => {
    await forceGate(page);
    await page.goto(PATH);
    const video = page.locator('[data-lost-video="mp4"]');
    await expect(video).toHaveCount(1, { timeout: 20_000 });
    // a mitad del vídeo: reproduciéndose y con fotogramas ya pintados
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused && v.currentTime > 0.8), { timeout: 20_000 }).toBe(true);
    const box = (await video.boundingBox())!;
    const shot = await page.screenshot();
    const bg = await page.evaluate(() => {
      const c = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
      const n = parseInt(c.slice(1), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    });
    // esquinas interiores de la caja 16:9 (zonas vacías del fotograma)
    const pts = [
      [box.x + 6, box.y + 6],
      [box.x + box.width - 7, box.y + 6],
      [box.x + 6, box.y + box.height - 7],
      [box.x + box.width - 7, box.y + box.height - 7],
    ];
    const px = await page.evaluate(
      async ({ b64, pts }) => {
        const bmp = await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob());
        const c = document.createElement("canvas");
        c.width = bmp.width;
        c.height = bmp.height;
        const g = c.getContext("2d")!;
        g.drawImage(bmp, 0, 0);
        return pts.map(([x, y]) => Array.from(g.getImageData(Math.round(x), Math.round(y), 1, 1).data.slice(0, 3)));
      },
      { b64: shot.toString("base64"), pts },
    );
    console.log("probe bg", bg, "pixels", JSON.stringify(px));
    for (const p of px) for (let i = 0; i < 3; i++) expect(Math.abs(p[i] - bg[i])).toBeLessThanOrEqual(2);
  });
});
