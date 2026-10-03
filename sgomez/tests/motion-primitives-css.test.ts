import { describe, expect, it } from "vitest";
import fs from "node:fs";
import { REGISTRY, needsRuntime } from "@/motion/registry";

// E5 revisada: el movimiento ligado al scroll es CSS estático en motion.css, no del registro.
const css = fs.readFileSync("src/motion/motion.css", "utf8");
const keyframes = [...css.matchAll(/@keyframes\s+([\w-]+)\s*\{([\s\S]*?)\}\s*(?=\n@|\n:root|\n\n|$)/g)].map((m) => ({ name: m[1]!, body: m[2]! }));
const rule = (selector: string) => {
  const at = css.indexOf(selector);
  expect(at, selector).toBeGreaterThan(-1);
  return css.slice(at, css.indexOf("}", at));
};

describe("registro: solo lo que necesita JS", () => {
  it("count, intent y magnetic corren; text-reveal y build solo tienen respaldo", () => {
    for (const k of ["count", "intent", "magnetic"]) expect(REGISTRY[k]?.load, k).toBeTypeOf("function");
    for (const k of ["text-reveal", "build"]) expect(REGISTRY[k]?.fallbackOnly, k).toBe(true);
    for (const k of ["card", "badge", "quote", "word-reveal"]) expect(REGISTRY[k], k).toBeUndefined();
  });
  it("no existe el campo css en el registro", async () => {
    for (const [k, e] of Object.entries(REGISTRY)) {
      expect((e as { css?: string }).css, k).toBeUndefined();
      expect(((await e.load!()) as { css?: string }).css, k).toBeUndefined();
    }
  });
  it("con animation-timeline, titulares y tarjetas no piden el runtime; sin él, sí", () => {
    const mk = (...keys: string[]) => ({ querySelectorAll: () => keys.map((k) => ({ dataset: { motion: k } })) }) as unknown as ParentNode;
    const plain = mk("text-reveal", "build");
    expect(needsRuntime(plain, REGISTRY, true)).toBe(false);
    expect(needsRuntime(plain, REGISTRY, false)).toBe(true);
    expect(needsRuntime(mk("text-reveal", "count"), REGISTRY, true)).toBe(true);
  });
});

describe("CSS de las primitivas en motion.css", () => {
  it("todo lo ligado al scroll cuelga de :root[data-motion-state=on]", () => {
    for (const m of css.matchAll(/^\s*(:root[^{]*)\{[^}]*animation-timeline/gm)) expect(m[1]).toMatch(/:root\[data-motion-state="on"\]/);
    expect(css).not.toMatch(/(^|\n)\s*(h2|\[data-motion)[^{]*\{[^}]*animation-timeline/);
  });
  it("lo que depende de JS (el imán) cuelga de data-motion-ready", () => {
    const at = css.indexOf("transform: translate3d(var(--mx");
    expect(at).toBeGreaterThan(-1);
    const sel = css.slice(css.lastIndexOf("@media (hover: hover)", at), at);
    expect(sel).toContain("(pointer: fine)");
    expect(sel.match(/data-motion-state="on"\]\[data-motion-ready\]/g)?.length).toBe(2);
  });
  it("los keyframes de texto nunca tocan opacity, filter ni transform, salvo mo-deco-*", () => {
    expect(keyframes.length).toBeGreaterThanOrEqual(10);
    for (const k of keyframes.filter((k) => !k.name.startsWith("mo-deco-"))) {
      expect(k.body, k.name).not.toMatch(/\b(opacity|filter|transform)\s*:/);
    }
  });
  it("anima solo los h2 de capítulo", () => {
    expect(css).toMatch(/h2\[data-motion="text-reveal"\]/);
    expect(css).not.toMatch(/h1\[data-motion/);
  });
  it("cada fase de la construcción termina como tarde en entry 100% (sin cover ni exit)", () => {
    for (const layer of ["trace", "outline", "fill", "content"]) {
      const r = rule(`[data-layer="${layer}"]`);
      expect(r).toMatch(/animation-timeline:\s*--build/);
      expect(r.match(/animation-range:\s*([^;]+);/)![1]).not.toMatch(/\b(cover|exit|contain)\b/);
    }
    expect(css).toMatch(/view-timeline:\s*--build\s+block/);
  });
  it("la bio cambia de color entre tokens AA y nada más", () => {
    const light = keyframes.find((k) => k.name === "mo-light")!;
    expect(light.body).toMatch(/color:\s*var\(--text-2\)/);
    expect(light.body).toMatch(/color:\s*var\(--text\)/);
    expect(light.body.replace(/(from|to)\s*\{\s*color:[^;]+;\s*\}/g, "").trim()).toBe("");
  });
  it("las citas no se recortan nunca", () => {
    const q = keyframes.find((k) => k.name === "mo-quote")!;
    expect(q.body).not.toMatch(/clip-path/);
  });
  it("las tarjetas de la experiencia solo entran en lista vertical (bajo md)", () => {
    const at = css.indexOf('[data-motion="card"] {');
    expect(css.lastIndexOf("@media (max-width: 47.99rem)", at)).toBeGreaterThan(css.lastIndexOf("}\n", at - 40) - 200);
    expect(css.slice(css.lastIndexOf("@media", at), at)).toContain("max-width: 47.99rem");
  });
  it("las insignias dejan sitio al anillo de foco", () => {
    expect(keyframes.find((k) => k.name === "mo-badge")!.body).toMatch(/inset\(-0\.5rem/);
  });
  it("las entradas no usan transform: el imán es su dueño", () => {
    expect(rule('[data-motion="intent"] {')).not.toMatch(/transform/);
  });
});
