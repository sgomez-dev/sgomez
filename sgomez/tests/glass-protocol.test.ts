import { describe, expect, it } from "vitest";
import { FRAME_MS, PLACEMENTS, pointerTarget } from "@/three/protocol";

describe("protocolo del cristal", () => {
  it("30 fps como máximo", () => expect(FRAME_MS).toBe(33));
  it("el puntero se normaliza a -1..1 y se recorta", () => {
    expect(pointerTarget(0, 0, 1000, 800)).toEqual({ x: -1, y: -1 });
    expect(pointerTarget(500, 400, 1000, 800)).toEqual({ x: 0, y: 0 });
    expect(pointerTarget(5000, -50, 1000, 800)).toEqual({ x: 1, y: -1 });
  });
  it("el cristal del hero se coloca donde el póster pinta el suyo", () => {
    // GlassPoster: translate(238 166) sobre una caja de 400
    expect(PLACEMENTS.hero.left).toBeCloseTo(59.5, 1);
    expect(PLACEMENTS.hero.top).toBeCloseTo(41.5, 1);
    expect(PLACEMENTS.contact.left).toBeCloseTo(59.5, 1);
  });
});
