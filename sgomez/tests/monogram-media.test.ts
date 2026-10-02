import { describe, expect, it } from "vitest";
import { existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { MONOGRAM_SRC } from "@/lib/monogram";

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
