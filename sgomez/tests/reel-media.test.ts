import { describe, expect, it } from "vitest";
import { existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { REEL_SLUGS, hasReel, reelSources } from "@/lib/reels";
import { getProjects } from "@/lib/api/data";

/**
 * Los reels del capítulo 05 se renderizan en local con Remotion (`npm run render -- --only=reels` en `video/`) a partir de
 * capturas reales y se commitean. Presupuesto: como mucho 600 KB cada fichero de vídeo.
 */
const file = (url: string) => fileURLToPath(new URL(`../public${url}`, import.meta.url));
const KB = 1024;

describe("reels del capítulo 05", () => {
  it("solo hay reel para fichas destacadas (las tres primeras)", () => {
    const featured = getProjects("es").slice(0, 3).map((p) => p.slug);
    expect([...REEL_SLUGS].sort()).toEqual([...featured].sort());
    expect(hasReel("sgomez-cli")).toBe(false);
  });

  for (const slug of REEL_SLUGS) {
    describe(slug, () => {
      const s = reelSources(slug);
      it("existen el WebM, el MP4 y el póster", () => {
        for (const url of [s.webm, s.mp4, s.poster]) expect(existsSync(file(url)), url).toBe(true);
      });
      it("cada vídeo pesa como mucho 600 KB", () => {
        expect(statSync(file(s.webm)).size).toBeLessThanOrEqual(600 * KB);
        expect(statSync(file(s.mp4)).size).toBeLessThanOrEqual(600 * KB);
      });
      it("el póster pesa como mucho 60 KB", () => {
        expect(statSync(file(s.poster)).size).toBeLessThanOrEqual(60 * KB);
      });
    });
  }
});
