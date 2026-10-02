import { describe, expect, it } from "vitest";
import { CONTENT_UPDATED, PAGES } from "@/lib/routing/pages";
// @ts-expect-error módulo .mjs sin tipos
import { SOURCES } from "../scripts/content-dates.mjs";

describe("fechas de contenido desde git", () => {
  it("cada página tiene fecha ISO y declara de qué ficheros sale", () => {
    expect(Object.keys(CONTENT_UPDATED).sort()).toEqual([...PAGES].sort());
    expect(Object.keys(SOURCES).sort()).toEqual([...PAGES].sort());
    for (const d of Object.values(CONTENT_UPDATED)) expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
