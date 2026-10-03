import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { HERO_LOOP_SRC } from "@/lib/hero-loop";
import { PLACEMENTS } from "@/three/protocol";

/**
 * El bucle del hero se renderiza en local con Remotion (`npm run render -- --only=hero` en `video/`) y se commitea.
 * Presupuesto: como mucho 500 KB cada fichero.
 */
const file = (url: string) => fileURLToPath(new URL(`../public${url}`, import.meta.url));

describe("medios del bucle del hero", () => {
  it("existen el WebM y el MP4", () => {
    expect(existsSync(file(HERO_LOOP_SRC.webm))).toBe(true);
    expect(existsSync(file(HERO_LOOP_SRC.mp4))).toBe(true);
  });
  it("cada vídeo pesa como mucho 500 KB", () => {
    expect(statSync(file(HERO_LOOP_SRC.webm)).size).toBeLessThanOrEqual(500 * 1024);
    expect(statSync(file(HERO_LOOP_SRC.mp4)).size).toBeLessThanOrEqual(500 * 1024);
  });
  it("la colocación del vídeo es la de la escena en vivo del hero", () => {
    // video/src/hero-timeline.ts no puede importar protocol.ts (arrastra el alias @/): guarda su copia de PLACEMENTS.hero.
    const src = readFileSync(fileURLToPath(new URL("../../video/src/hero-timeline.ts", import.meta.url)), "utf8");
    const h = PLACEMENTS.hero;
    expect(src).toContain(`export const P = { left: ${h.left}, top: ${h.top}, z: ${h.z}, scale: ${h.scale}, rest: { rx: ${h.rest.rx}, ry: ${h.rest.ry}, rz: ${h.rest.rz} } };`);
  });
});
