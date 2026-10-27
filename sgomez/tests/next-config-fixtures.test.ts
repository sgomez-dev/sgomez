import { afterEach, describe, expect, it, vi } from "vitest";

describe("next.config: fixtures del e2e", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("aborta el build si E2E_FIXTURES=1 y hay WORKERS_CI", async () => {
    vi.stubEnv("E2E_FIXTURES", "1");
    vi.stubEnv("WORKERS_CI", "1");
    await expect(import("../next.config")).rejects.toThrow(/E2E_FIXTURES/);
  });

  it("deja construir con E2E_FIXTURES=1 fuera de Cloudflare", async () => {
    vi.stubEnv("E2E_FIXTURES", "1");
    vi.stubEnv("WORKERS_CI", "");
    // `WORKERS_CI` vacío cuenta como no definida: el build local del e2e no puede romperse.
    await expect(import("../next.config")).resolves.toBeTruthy();
  });

  it("deja construir en Cloudflare sin la variable", async () => {
    vi.stubEnv("E2E_FIXTURES", "");
    vi.stubEnv("WORKERS_CI", "1");
    await expect(import("../next.config")).resolves.toBeTruthy();
  });
});
