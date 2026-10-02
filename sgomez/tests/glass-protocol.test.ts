import { describe, expect, it } from "vitest";
import { FRAME_MS, PLACEMENTS, PROJECTED_IDS, pointerTarget } from "@/three/protocol";
import { SHARDS } from "@/lib/lost/shards";

describe("protocolo del cristal", () => {
  it("30 fps como máximo", () => expect(FRAME_MS).toBe(33));
  it("el puntero se normaliza a -1..1 y se recorta", () => {
    expect(pointerTarget(0, 0, 1000, 800)).toEqual({ x: -1, y: -1 });
    expect(pointerTarget(500, 400, 1000, 800)).toEqual({ x: 0, y: 0 });
    expect(pointerTarget(5000, -50, 1000, 800)).toEqual({ x: 1, y: -1 });
  });
  it("el cristal del hero se coloca donde el póster pinta el suyo", () => {
    // GlassPoster: translate(238 166) sobre una caja de 400, es decir, 59.5 y 41.5. Con la perspectiva y la pose
    // de reposo, el centro 3D se corrige unos puntos para que la silueta casara al píxel (medido con
    // scripts/glass-capture.mjs, ver progress/2026-10-02-fase-3.md); más de 5 puntos sería otro sitio.
    expect(Math.abs(PLACEMENTS.hero.left - 59.5)).toBeLessThan(5);
    expect(Math.abs(PLACEMENTS.hero.top - 41.5)).toBeLessThan(5);
    expect(Math.abs(PLACEMENTS.contact.left - 59.5)).toBeLessThan(5);
  });
});

describe("protocolo del 404", () => {
  it("los desplazamientos van en el orden de los fragmentos con enlace", () => {
    expect(PROJECTED_IDS).toEqual(SHARDS.filter((s) => s.target !== null).map((s) => s.id));
    expect(PROJECTED_IDS).toHaveLength(7);
  });
});
