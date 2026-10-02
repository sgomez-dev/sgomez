import { describe, expect, it } from "vitest";
import { COARSE_STEP, frameForProgress, loadOrder, nearestLoaded, sectionProgress, sequenceGatePasses } from "@/motion/scroll-sequence/player";
import { defineSequence, framePath } from "@/motion/scroll-sequence/manifest";
import type { GlassEnv } from "@/lib/three/gate";
import { e2eFixturesEnabled } from "@/lib/e2e";
import { isUnknownHtmlPath } from "@/lib/routing/request";

describe("frameForProgress", () => {
  it("0 es el primero y 1 el último", () => {
    expect(frameForProgress(0, 90)).toBe(0);
    expect(frameForProgress(1, 90)).toBe(89);
  });
  it("fija fuera de rango y con NaN", () => {
    expect(frameForProgress(-3, 24)).toBe(0);
    expect(frameForProgress(7, 24)).toBe(23);
    expect(frameForProgress(NaN, 24)).toBe(0);
  });
  it("es monótona y llega a todos los fotogramas", () => {
    const seen = new Set<number>();
    let prev = 0;
    for (let i = 0; i <= 1000; i++) {
      const f = frameForProgress(i / 1000, 24);
      expect(f).toBeGreaterThanOrEqual(prev);
      prev = f;
      seen.add(f);
    }
    expect(seen.size).toBe(24);
  });
  it("una secuencia de un fotograma", () => expect(frameForProgress(0.5, 1)).toBe(0));
});

describe("sectionProgress", () => {
  it("0 al entrar por abajo, 1 al salir por arriba, 0,5 al centro", () => {
    expect(sectionProgress({ top: 800, height: 400 }, 800)).toBe(0);
    expect(sectionProgress({ top: -400, height: 400 }, 800)).toBe(1);
    expect(sectionProgress({ top: 200, height: 400 }, 800)).toBeCloseTo(0.5);
  });
  it("se queda en 0 y 1 fuera de rango", () => {
    expect(sectionProgress({ top: 5000, height: 400 }, 800)).toBe(0);
    expect(sectionProgress({ top: -5000, height: 400 }, 800)).toBe(1);
  });
});

describe("loadOrder", () => {
  it("1 de cada 4 primero, después el resto, sin repetir y sin perder ninguno", () => {
    const o = loadOrder(24);
    expect(o).toHaveLength(24);
    expect(new Set(o).size).toBe(24);
    const coarse = o.slice(0, 7);
    expect(coarse).toEqual([0, 4, 8, 12, 16, 20, 23]);
    expect(coarse.slice(0, -1).every((i) => i % COARSE_STEP === 0)).toBe(true);
    const rest = o.slice(7);
    expect(rest).toEqual([...rest].sort((a, b) => a - b));
    expect(rest.some((i) => i % COARSE_STEP === 0)).toBe(false);
  });
  it("90 fotogramas: 23 + 1 en la primera pasada", () => {
    const o = loadOrder(90);
    expect(o.slice(0, 23).every((i) => i % 4 === 0)).toBe(true);
    expect(o[23]).toBe(89);
    expect(new Set(o).size).toBe(90);
  });
  it("si el último ya es múltiplo de 4 no se duplica", () => expect(loadOrder(9)).toEqual([0, 4, 8, 1, 2, 3, 5, 6, 7]));
});

describe("nearestLoaded", () => {
  const has = (set: number[]) => (i: number) => set.includes(i);
  it("el propio si está cargado", () => expect(nearestLoaded(8, 24, has([4, 8, 12]))).toBe(8));
  it("el más cercano, y a igualdad el anterior", () => {
    expect(nearestLoaded(9, 24, has([4, 8, 12]))).toBe(8);
    expect(nearestLoaded(10, 24, has([4, 8, 12]))).toBe(8);
    expect(nearestLoaded(11, 24, has([4, 8, 12]))).toBe(12);
  });
  it("en los extremos y sin nada cargado", () => {
    expect(nearestLoaded(0, 24, has([12]))).toBe(12);
    expect(nearestLoaded(23, 24, has([12]))).toBe(12);
    expect(nearestLoaded(5, 24, has([]))).toBe(-1);
  });
});

describe("manifiesto", () => {
  const m = defineSequence("build", 90, { w: 1600, h: 900 }, { w: 800, h: 450 });
  it("rutas /media/<id>/<tamaño>/0001.webp", () => {
    expect(framePath(m.sizes.desktop, 0)).toBe("/media/build/desktop/0001.webp");
    expect(framePath(m.sizes.mobile, 89)).toBe("/media/build/mobile/0090.webp");
    expect(m.poster).toBe("/media/build/poster.webp");
    expect([m.width, m.height]).toEqual([1600, 900]);
  });
});

describe("puerta", () => {
  const env: GlassEnv = { lg: false, offscreen: false, motionOn: true, reducedMotion: false, saveData: false, cores: 8, deviceMemory: 8, forced: false };
  it("pasa en móvil con movimiento permitido (no exige lg ni OffscreenCanvas)", () => expect(sequenceGatePasses(env)).toBe(true));
  it("no pasa con movimiento apagado, reducido o Save-Data", () => {
    expect(sequenceGatePasses({ ...env, motionOn: false })).toBe(false);
    expect(sequenceGatePasses({ ...env, reducedMotion: true })).toBe(false);
    expect(sequenceGatePasses({ ...env, saveData: true })).toBe(false);
  });
});

describe("la ruta de prueba no existe en producción", () => {
  it("sin E2E_FIXTURES es un 404 para el proxy, en los dos idiomas", () => {
    expect(e2eFixturesEnabled()).toBe(false);
    expect(isUnknownHtmlPath("/e2e-sequence")).toBe(true);
    expect(isUnknownHtmlPath("/en/e2e-sequence")).toBe(true);
  });
});
