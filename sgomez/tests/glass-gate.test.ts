import { describe, expect, it } from "vitest";
import { gatingPasses } from "@/chapters/lost/media";
import { glassGatePasses, type GlassEnv } from "@/lib/three/gate";
import { slabOutlinePoints, GLASS, POSTER_SILHOUETTE } from "@/lib/lost/shards";

const OK: GlassEnv = { lg: true, offscreen: true, motionOn: true, reducedMotion: false, saveData: false, cores: 8, deviceMemory: 8, forced: false };

describe("puerta del cristal", () => {
  it("pasa en un escritorio capaz", () => expect(glassGatePasses(OK)).toBe(true));
  for (const [k, v] of [["lg", false], ["offscreen", false], ["motionOn", false], ["reducedMotion", true], ["saveData", true], ["cores", 2], ["deviceMemory", 2]] as const) {
    it(`falla con ${k}=${String(v)}`, () => expect(glassGatePasses({ ...OK, [k]: v })).toBe(false));
  }
  it("deviceMemory y cores desconocidos no cierran la puerta", () => expect(glassGatePasses({ ...OK, cores: undefined, deviceMemory: undefined })).toBe(true));
  it("forzar (solo pruebas) no salta lg ni movimiento", () => {
    expect(glassGatePasses({ ...OK, lg: false, forced: true })).toBe(false);
    expect(glassGatePasses({ ...OK, motionOn: false, forced: true })).toBe(false);
  });
  it("el 404 también respeta deviceMemory", () => {
    expect(gatingPasses({ webgl2: true, reducedMotion: false, saveData: false, cores: 8, deviceMemory: 2 })).toBe(false);
    expect(gatingPasses({ webgl2: true, reducedMotion: false, saveData: false, cores: 8 })).toBe(true);
  });
});

describe("contorno del cristal entero (silueta redondeada del póster, F3)", () => {
  const pts = slabOutlinePoints();
  const area = (p: [number, number][]) => p.reduce((s, a, i) => { const b = p[(i + 1) % p.length]!; return s + a[0] * b[1] - b[0] * a[1]; }, 0) / 2;

  it("tiene n puntos, antihorario, centrado y con radio medio GLASS.slabRadius", () => {
    expect(pts).toHaveLength(GLASS.slabOutline.n);
    expect(area(pts)).toBeGreaterThan(0);
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    expect(Math.abs(cx)).toBeLessThan(1e-6);
    expect(Math.abs(cy)).toBeLessThan(1e-6);
    const mean = pts.reduce((s, [x, y]) => s + Math.hypot(x, y), 0) / pts.length;
    expect(mean).toBeCloseTo(GLASS.slabRadius, 6);
  });
  it("es redondeada: ninguna esquina viva entre segmentos contiguos", () => {
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i]!, b = pts[(i + 1) % pts.length]!, c = pts[(i + 2) % pts.length]!;
      const v1 = [b[0] - a[0], b[1] - a[1]] as const, v2 = [c[0] - b[0], c[1] - b[1]] as const;
      const cos = (v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(...v1) * Math.hypot(...v2));
      expect(cos).toBeGreaterThan(Math.cos((25 * Math.PI) / 180));
    }
  });
  it("es la silueta del póster: mismo trazado y mismo giro", () => {
    expect(POSTER_SILHOUETTE.d.startsWith("M222 78c")).toBe(true);
    expect(POSTER_SILHOUETTE.rotate).toBe(18);
    // el póster es más ancho que alto antes de girar; tras girar 18 grados la caja sigue siendo apaisada pero menos
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
    expect(w / h).toBeGreaterThan(0.85);
    expect(w / h).toBeLessThan(1.25);
  });
  it("admite otro número de puntos", () => expect(slabOutlinePoints(120)).toHaveLength(120));
});
