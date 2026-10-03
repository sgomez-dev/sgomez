import { describe, expect, it } from "vitest";
import { easeOutExpo, magneticOffset, springSettled, springStep, wordSpans } from "@/motion/math";

describe("math del motor", () => {
  it("easeOutExpo: exacto en los extremos y monótono", () => {
    expect(easeOutExpo(0)).toBe(0);
    expect(easeOutExpo(1)).toBe(1);
    let p = 0;
    for (let t = 0; t <= 1; t += 0.01) {
      expect(easeOutExpo(t)).toBeGreaterThanOrEqual(p);
      p = easeOutExpo(t);
    }
  });
  it("wordSpans conserva el texto exacto", () => {
    const text = "Construyo producto.  Llevo la IA\na producción.";
    expect(wordSpans(text).map((s) => s.word).join("")).toBe(text);
  });
  it("el muelle converge al objetivo, arrastra velocidad y se asienta", () => {
    let s = { x: 0, v: 0 };
    s = springStep(s, 10, 0.016);
    expect(s.v).toBeGreaterThan(0);
    for (let i = 0; i < 600; i++) s = springStep(s, 10, 0.016);
    expect(springSettled(s, 10)).toBe(true);
  });
  it("el imán recorta a strength y es 0 en el centro", () => {
    const r = { left: 0, top: 0, width: 100, height: 100 };
    expect(magneticOffset(50, 50, r, 12)).toEqual([0, 0]);
    expect(magneticOffset(1000, -1000, r, 12)).toEqual([12, -12]);
  });
});
