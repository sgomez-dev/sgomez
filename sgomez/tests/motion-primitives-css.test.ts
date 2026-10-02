import { describe, expect, it } from "vitest";
import { css as titles } from "@/motion/primitives/text-reveal";
import { css as build } from "@/motion/primitives/build";
import { css as words } from "@/motion/primitives/word-reveal";
import { REGISTRY } from "@/motion/registry";

const all = { "text-reveal": titles, build, "word-reveal": words };
const keyframes = Object.values(all).flatMap((c) => [...c.matchAll(/@keyframes\s+([\w-]+)\s*\{([\s\S]*?)\}\s*(?=\n[@:]|\n?$)/g)].map((m) => ({ name: m[1]!, body: m[2]! })));

describe("CSS de las primitivas (campo css del registro)", () => {
  it("estan registradas, con su carga perezosa", () => {
    for (const k of ["text-reveal", "build", "word-reveal", "count"]) expect(REGISTRY[k]?.load, k).toBeTypeOf("function");
  });
  it("todo cuelga de :root[data-motion-state=on]", () => {
    for (const [k, c] of Object.entries(all)) {
      for (const rule of c.matchAll(/^(:root[^{]*|@media[^{]*|@keyframes[^{]*)\{/gm)) expect(rule[1], k).toMatch(/^(:root\[data-motion-state="on"\]|@media|@keyframes)/);
      expect(c, k).toContain(':root[data-motion-state="on"]');
    }
  });
  it("los keyframes de texto nunca tocan opacity ni filter, salvo mo-deco-*", () => {
    expect(keyframes.length).toBeGreaterThanOrEqual(6);
    for (const k of keyframes.filter((k) => !k.name.startsWith("mo-deco-"))) {
      expect(k.body, k.name).not.toMatch(/\bopacity\s*:/);
      expect(k.body, k.name).not.toMatch(/\bfilter\s*:/);
      expect(k.body, k.name).not.toMatch(/\btransform\s*:/);
    }
  });
  it("anima solo los h2 de capitulo", () => {
    expect(titles).toMatch(/h2\[data-motion="text-reveal"\]/);
    expect(titles).not.toMatch(/h1/);
  });
  it("cada fase de la construccion termina como tarde en entry 100% (sin cover ni exit)", () => {
    for (const m of build.matchAll(/animation-range:\s*([^;]+);/g)) expect(m[1], m[0]).not.toMatch(/\b(cover|exit|contain)\b/);
  });
  it("las tarjetas usan una linea de tiempo con nombre para sus cuatro capas", () => {
    expect(build).toMatch(/view-timeline:\s*--build\s+block/);
    for (const layer of ["trace", "outline", "fill", "content"]) expect(build).toContain(`[data-layer="${layer}"]`);
  });
  it("la bio cambia de color entre tokens AA y nada mas", () => {
    const light = keyframes.find((k) => k.name === "mo-light")!;
    expect(light.body).toMatch(/color:\s*var\(--text-2\)/);
    expect(light.body).toMatch(/color:\s*var\(--text\)/);
    expect(light.body.replace(/(from|to)\s*\{\s*color:[^;]+;\s*\}/g, "").trim()).toBe("");
  });
});
