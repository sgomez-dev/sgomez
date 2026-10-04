import { describe, expect, it } from "vitest";
import sharp from "sharp";

describe("foto de la imagen Open Graph", () => {
  it("no tiene transparencias (satori las pinta de blanco) y es cuadrada", async () => {
    const m = await sharp("src/lib/seo/og-portrait.png").metadata();
    expect(m.hasAlpha).toBe(false);
    expect(m.width).toBe(m.height);
  });
  it("es más nueva que la foto de la que sale (si cambia la foto, hay que regenerarla)", async () => {
    const { statSync } = await import("node:fs");
    const { execFileSync } = await import("node:child_process");
    const date = (f: string) => Number(execFileSync("git", ["log", "-1", "--format=%ct", "--", f], { encoding: "utf8" }).trim() || statSync(f).mtimeMs / 1000);
    expect(date("src/lib/seo/og-portrait.png")).toBeGreaterThanOrEqual(date("public/Santiago_Gómez_de_la_Torre_Romero.png"));
  });
});
