import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const SRC = join(process.cwd(), "src");
const FONTS = join(SRC, "app", "fonts");
const FILES = [
  "inter-tight-latin-400-normal.woff2",
  "inter-tight-latin-500-normal.woff2",
  "inter-tight-latin-600-normal.woff2",
  "instrument-serif-latin-400-normal.woff2",
  "instrument-serif-latin-400-italic.woff2",
];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

describe("fuentes autoalojadas", () => {
  it("ningún fichero de src importa next/font/google", () => {
    const hits = walk(SRC).filter((f) => /\.(ts|tsx)$/.test(f) && readFileSync(f, "utf8").includes("next/font/google"));
    expect(hits).toEqual([]);
  });
  it("están los cinco woff2 y la licencia OFL", () => {
    for (const f of FILES) expect(statSync(join(FONTS, f)).size, f).toBeGreaterThan(5_000);
    expect(readFileSync(join(FONTS, "OFL.txt"), "utf8")).toMatch(/SIL OPEN FONT LICENSE/i);
  });
  it("fonts.ts declara las dos variables de siempre", () => {
    const src = readFileSync(join(SRC, "app", "fonts.ts"), "utf8");
    expect(src).toContain('"--font-inter-tight"');
    expect(src).toContain('"--font-instrument-serif"');
    expect(existsSync(join(SRC, "app", "fonts.ts"))).toBe(true);
  });
});
