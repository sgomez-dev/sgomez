import { describe, expect, it } from "vitest";
import fs from "node:fs";

const css = fs.readFileSync("src/motion/motion.css", "utf8");
const keyframes = [...css.matchAll(/@keyframes\s+([\w-]+)\s*\{([\s\S]*?)\n\}/g)].map((m) => ({ name: m[1]!, body: m[2]! }));

describe("motion.css", () => {
  it("toda regla con animation-timeline está detrás de la puerta", () => {
    const gate = css.indexOf("@media (prefers-reduced-motion: no-preference)");
    const supports = css.indexOf("@supports (animation-timeline: view())");
    expect(gate).toBeGreaterThanOrEqual(0);
    expect(supports).toBeGreaterThan(gate);
    const firstUse = css.search(/animation-timeline:\s*(?!none)/);
    if (firstUse >= 0) expect(firstUse).toBeGreaterThan(supports);
    expect(css).toMatch(/:root\[data-motion-state="on"\]/);
  });
  it("los keyframes de texto nunca tocan opacity ni filter (contraste AA en cada estado)", () => {
    for (const k of keyframes.filter((k) => !k.name.startsWith("mo-deco-"))) {
      expect(k.body, k.name).not.toMatch(/\bopacity\s*:/);
      expect(k.body, k.name).not.toMatch(/\bfilter\s*:/);
    }
  });
  it("las entradas usan translate/scale, nunca transform (el imán es dueño de transform)", () => {
    for (const k of keyframes) expect(k.body, k.name).not.toMatch(/\btransform\s*:/);
  });
  it("el h1 del hero (LCP) no se anima", () => {
    expect(css).not.toMatch(/h1\[data-motion/);
    expect(css).not.toMatch(/(^|[\s,{])\[data-motion="text-reveal"\]/m);
  });
});
