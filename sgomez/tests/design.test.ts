import { describe, expect, it } from "vitest";
import fs from "node:fs";
import { contrastRatio } from "@/lib/design/contrast";

const css = fs.readFileSync("src/app/styles/tokens.css", "utf8").replace(/\r\n/g, "\n");
const token = (name: string) => new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`).exec(css)![1]!;

describe("contraste de los tokens (WCAG AA)", () => {
  it("contrastRatio calcula bien los extremos", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 0);
    expect(contrastRatio("#777777", "#777777")).toBeCloseTo(1, 5);
  });
  for (const bg of ["bg", "bg-2", "bg-3"]) {
    it(`texto de cuerpo sobre --${bg} ≥ 4.5`, () => {
      expect(contrastRatio(token("text"), token(bg))).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(token("text-2"), token(bg))).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(token("serif-ink"), token(bg))).toBeGreaterThanOrEqual(4.5);
    });
  }
  it("el botón primario (texto --bg sobre --text) ≥ 4.5", () => {
    expect(contrastRatio(token("bg"), token("text"))).toBeGreaterThanOrEqual(4.5);
  });
});
