import { describe, expect, it } from "vitest";
import { existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { FORGIA_REVEAL, MONOGRAM_SRC, forgiaVideoBox } from "@/lib/monogram";

/**
 * El vídeo del capítulo 07 se renderiza en local con Remotion (`npm run render -- --only=monogram` en `video/`) y se
 * commitea. Presupuesto: como mucho 400 KB cada fichero. Mide el doble exacto del logotipo de la página (425x253).
 */
const file = (url: string) => fileURLToPath(new URL(`../public${url}`, import.meta.url));

describe("medios del capítulo 07", () => {
  it("existen el WebM y el MP4", () => {
    expect(existsSync(file(MONOGRAM_SRC.webm))).toBe(true);
    expect(existsSync(file(MONOGRAM_SRC.mp4))).toBe(true);
  });
  it("cada vídeo pesa como mucho 400 KB", () => {
    expect(statSync(file(MONOGRAM_SRC.webm)).size).toBeLessThanOrEqual(400 * 1024);
    expect(statSync(file(MONOGRAM_SRC.mp4)).size).toBeLessThanOrEqual(400 * 1024);
  });
});

describe("medios del logotipo de Forgia", () => {
  it("existen el WebM y el MP4", () => {
    expect(existsSync(file(FORGIA_REVEAL.webm))).toBe(true);
    expect(existsSync(file(FORGIA_REVEAL.mp4))).toBe(true);
  });
  it("cada vídeo pesa como mucho 400 KB", () => {
    expect(statSync(file(FORGIA_REVEAL.webm)).size).toBeLessThanOrEqual(400 * 1024);
    expect(statSync(file(FORGIA_REVEAL.mp4)).size).toBeLessThanOrEqual(400 * 1024);
  });
  it("el logotipo ocupa una banda centrada con la proporción del SVG, y la caja del vídeo la contiene", () => {
    const { video, logo } = FORGIA_REVEAL;
    expect(logo.w / logo.h).toBeCloseTo(4945 / 728, 6);
    expect(logo.x).toBeCloseTo((video.w - logo.w) / 2, 6);
    expect(logo.y).toBeCloseTo((video.h - logo.h) / 2, 6);
    expect(video.w % 2 + (video.h % 2)).toBe(0);
    const box = forgiaVideoBox();
    expect(parseFloat(box.width)).toBeCloseTo((video.w / logo.w) * 100, 3);
    expect(parseFloat(box.left)).toBeLessThan(0);
    expect(parseFloat(box.top)).toBeLessThan(0);
  });
});
