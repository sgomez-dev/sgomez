import { test as base, expect, type ConsoleMessage } from "@playwright/test";

/**
 * `test` con una red de seguridad: cualquier error de consola o excepción no
 * capturada durante el test lo hace fallar, en todas las cargas de página.
 *
 * Único ruido conocido: Chromium escribe «Failed to load resource ... 404» en
 * la consola cuando el DOCUMENTO pedido es un 404 (lo hace con cualquier sitio,
 * no es un defecto). Solo se ignora para las URLs de prueba de 404 del sitio;
 * un recurso que falle con 404 en cualquier otra página sigue fallando el test.
 * No hay scripts de terceros, así que no hay más ruido que filtrar.
 */
const EXPECTED_404_DOCUMENTS = /\/(en\/)?no-existe$/;

function isExpectedNoise(msg: ConsoleMessage): boolean {
  return /status of 404/.test(msg.text()) && EXPECTED_404_DOCUMENTS.test(new URL(msg.location().url || "http://x/").pathname);
}

export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error" && !isExpectedNoise(msg)) errors.push(`${msg.text()} (${msg.location().url})`);
      });
      page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
      await use(errors);
      expect(errors, "errores de consola").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
