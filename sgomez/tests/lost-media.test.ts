import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * Los medios del 404 se generan en local con Remotion (`video/`) y se commitean.
 * Este test guarda el presupuesto: todos los vídeos juntos ≤ 1,5 MB y cada
 * póster ≤ 200 KB.
 */
const dir = (n: string) => fileURLToPath(new URL(`../public/media/404/${n}`, import.meta.url));
const size = (n: string) => statSync(dir(n)).size;

const VIDEOS = ["shatter.webm", "shatter.mp4"];
const POSTERS = ["poster-end.webp"];

describe("medios del 404", () => {
  it("existen todos los ficheros", () => {
    for (const n of [...VIDEOS, ...POSTERS]) expect(existsSync(dir(n)), n).toBe(true);
  });

  it("los vídeos suman como mucho 1,5 MB", () => {
    const total = VIDEOS.reduce((sum, n) => sum + size(n), 0);
    expect(total).toBeLessThanOrEqual(1.5 * 1024 * 1024);
  });

  it("cada póster pesa como mucho 200 KB", () => {
    for (const n of POSTERS) expect(size(n), n).toBeLessThanOrEqual(200 * 1024);
  });
});

describe("geometría horneada", () => {
  it("bake:check pasa: los literales de shards.ts son los del generador de video/", () => {
    const script = fileURLToPath(new URL("../../video/scripts/bake-geometry.mjs", import.meta.url));
    const out = execFileSync(process.execPath, ["--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", script, "--check"], { encoding: "utf8" });
    expect(out).toContain("bake:check OK");
  });
});
