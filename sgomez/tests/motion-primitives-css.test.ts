import { describe, expect, it } from "vitest";
import { REGISTRY } from "@/motion/registry";
import * as card from "@/motion/primitives/card";
import * as badge from "@/motion/primitives/badge";
import * as quote from "@/motion/primitives/quote";
import * as intent from "@/motion/primitives/intent";
import * as magnetic from "@/motion/primitives/magnetic";

const all = { card, badge, quote, intent, magnetic };
const keyframes = (css: string) => [...css.matchAll(/@keyframes\s+([\w-]+)\s*\{([\s\S]*?)\}\s*(?=@|:root|$|\n\n)/g)].map((m) => ({ name: m[1]!, body: m[2]! }));

describe("primitivas de las Tasks 5 y 6 en el registro", () => {
  it("están registradas y cada una tiene su módulo con css", async () => {
    for (const key of Object.keys(all)) {
      expect(REGISTRY[key]?.load, key).toBeTypeOf("function");
      expect(((await REGISTRY[key]!.load!()) as { css?: string }).css, key).toMatch(/:root\[data-motion-state="on"\]/);
    }
  });
  it("ningún keyframe de texto toca opacity, filter ni transform", () => {
    for (const [key, m] of Object.entries(all)) for (const k of keyframes(m.css)) {
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
