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

import * as card from "@/motion/primitives/card";
import * as badge from "@/motion/primitives/badge";
import * as quote from "@/motion/primitives/quote";
import * as intent from "@/motion/primitives/intent";
import * as magnetic from "@/motion/primitives/magnetic";

const all2 = { card, badge, quote, intent, magnetic };
const keyframes2 = (css: string) => [...css.matchAll(/@keyframes\s+([\w-]+)\s*\{([\s\S]*?)\}\s*(?=@|:root|$|\n\n)/g)].map((m) => ({ name: m[1]!, body: m[2]! }));

describe("primitivas de las Tasks 5 y 6 en el registro", () => {
  it("están registradas y cada una tiene su módulo con css", async () => {
    for (const key of Object.keys(all2)) {
      expect(REGISTRY[key]?.load, key).toBeTypeOf("function");
      expect(((await REGISTRY[key]!.load!()) as { css?: string }).css, key).toMatch(/:root\[data-motion-state="on"\]/);
    }
  });
  it("ningún keyframe de texto toca opacity, filter ni transform", () => {
    for (const [key, m] of Object.entries(all2)) for (const k of keyframes2(m.css)) {
      expect(k.body, `${key} ${k.name}`).not.toMatch(/\b(opacity|filter|transform)\s*:/);
    }
  });
});

describe("entradas y citas", () => {
  it("las citas no se recortan nunca", () => {
    expect(quote.css).not.toMatch(/clip-path/);
  });
  it("las tarjetas de la experiencia solo entran en lista vertical (bajo md)", () => {
    expect(card.css).toMatch(/@media \(max-width: 47\.99rem\)[\s\S]*animation-timeline:\s*view\(\)/);
  });
  it("las insignias dejan sitio al anillo de foco", () => {
    expect(badge.css).toMatch(/inset\(-0\.5rem/);
  });
});

describe("imán", () => {
  it("el transform del imán solo con puntero fino y hover", () => {
    const at = intent.css.indexOf("transform:");
    expect(at).toBeGreaterThan(-1);
    expect(intent.css.lastIndexOf("@media (hover: hover) and (pointer: fine)", at)).toBeGreaterThan(-1);
  });
  it("las entradas no usan transform: el imán es su dueño", () => {
    expect(intent.css.replace(/@media \(hover[\s\S]*$/, "")).not.toMatch(/transform/);
  });
});
