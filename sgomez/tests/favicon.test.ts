import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import manifest from "@/app/manifest";

describe("favicon del cristal", () => {
  it("existen el SVG, los PNG, el icono de Apple y el favicon.ico", () => {
    for (const f of ["public/favicon.svg", "public/favicon-32.png", "public/apple-touch-icon.png", "public/icon-192.png", "public/icon-512.png", "public/icon-maskable-512.png", "src/app/favicon.ico"]) {
      expect(existsSync(f), f).toBe(true);
    }
    expect(readFileSync("public/favicon.svg", "utf8")).toMatch(/^<svg[^>]+viewBox="0 0 64 64"/);
  });
  it("el manifest usa el cristal, con un icono maskable propio, y no la foto", () => {
    const icons = manifest().icons ?? [];
    expect(icons.some((i) => i.purpose === "maskable" && i.src === "/icon-maskable-512.png")).toBe(true);
    expect(icons.every((i) => !i.src.includes("Romero"))).toBe(true);
  });
});
