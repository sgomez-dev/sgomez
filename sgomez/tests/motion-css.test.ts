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

describe("escena fijada del capítulo 04", () => {
  const at = css.indexOf("@media (min-width: 64rem) and (min-height: 40rem)");
  const block = css.slice(at);
  it("las reglas pegajosas solo existen en pantallas anchas y altas y detrás de la puerta", () => {
    expect(at).toBeGreaterThan(css.indexOf("@supports (animation-timeline: view())"));
    expect(css.lastIndexOf("@media (prefers-reduced-motion: no-preference)", at)).toBeGreaterThan(-1);
    expect(block).toMatch(/\[data-pin-stage\]\s*\{[^}]*position:\s*sticky/);
    expect(css.slice(0, at)).not.toMatch(/position:\s*sticky/);
  });
  it("la escena recorta con clip, nunca con hidden (hidden crearía un scroller)", () => {
    expect(block).toMatch(/overflow:\s*clip/);
    expect(css).not.toMatch(/\[data-pin-stage\][^{]*\{[^}]*overflow:\s*hidden/);
  });
  it("las reglas del pin no se aplican al imprimir, y el h2 no cambia de tamano al cruzar la puerta", () => {
    expect(css.lastIndexOf("@media screen and (prefers-reduced-motion: no-preference)", at)).toBeGreaterThan(-1);
    expect(block).not.toMatch(/\[data-pin-stage\] h2\s*\{[^}]*font-size/);
  });
  it("el resumen solo se muestra fijado y el texto completo sigue en el DOM (recortado, no display none)", () => {
    expect(block).toMatch(/\[data-e="summary"\]\s*\{[^}]*display:\s*block/);
    expect(block).not.toMatch(/\[data-e="desc"\]\s*\{[^}]*display:\s*none/);
  });
  it("la pista nunca se desplaza hacia la derecha si cabe entera", () => {
    expect(css).toMatch(/min\(0px,/);
  });
  it("el alto sale del número de tarjetas y está en el CSS global: ya está en el primer pintado", () => {
    expect(block).toMatch(/height:\s*calc\(100svh \+ var\(--n/);
  });
});
