import { describe, expect, it } from "vitest";
import { LANGS, isLang, localizedPath, splitLang, hreflangAlternates, switchLangHref } from "@/i18n/languages";
import { fill } from "@/i18n/fill";
import { getDictionary } from "@/i18n";
import es from "@/i18n/dictionaries/es";
import en from "@/i18n/dictionaries/en";

describe("languages", () => {
  it("español sin prefijo, inglés bajo /en", () => {
    expect(localizedPath("es", "/")).toBe("/");
    expect(localizedPath("es", "/about")).toBe("/about");
    expect(localizedPath("en", "/")).toBe("/en");
    expect(localizedPath("en", "/about")).toBe("/en/about");
  });
  it("splitLang es el inverso de localizedPath", () => {
    for (const lang of LANGS) for (const path of ["/", "/about", "/work/nudaui"]) {
      expect(splitLang(localizedPath(lang, path))).toEqual({ lang, path });
    }
    expect(splitLang("/english")).toEqual({ lang: "es", path: "/english" });
  });
  it("isLang solo acepta los idiomas publicados", () => {
    expect(isLang("en")).toBe(true);
    expect(isLang("fr")).toBe(false);
    expect(isLang(undefined)).toBe(false);
  });
  it("hreflang recíproco con x-default en español", () => {
    expect(hreflangAlternates("/about")).toEqual({
      es: "https://sgomez.dev/about",
      en: "https://sgomez.dev/en/about",
      "x-default": "https://sgomez.dev/about",
    });
  });
  it("cambiar de idioma sin equivalente lleva a la home de ese idioma", () => {
    const known = ["/", "/about"];
    expect(switchLangHref("/about", "en", known)).toBe("/en/about");
    expect(switchLangHref("/en/about", "es", known)).toBe("/about");
    expect(switchLangHref("/no-existe", "en", known)).toBe("/en");
    expect(switchLangHref("/en/no-existe", "es", known)).toBe("/");
  });
});

describe("fill", () => {
  it("rellena y deja visibles las variables que faltan", () => {
    expect(fill("{n} proyectos", { n: 13 })).toBe("13 proyectos");
    expect(fill("{a} y {b}", { a: "x" })).toBe("x y {b}");
  });
});

describe("diccionarios", () => {
  it("en tiene exactamente las mismas claves que es", () => {
    const keys = (o: object, p = ""): string[] =>
      Object.entries(o).flatMap(([k, v]) => (v && typeof v === "object" && !Array.isArray(v) ? keys(v, `${p}${k}.`) : [`${p}${k}`]));
    expect(keys(en).sort()).toEqual(keys(es).sort());
  });
  it("ninguna cadena vacía", () => {
    const values = (o: object): unknown[] => Object.values(o).flatMap((v) => (v && typeof v === "object" ? values(v) : [v]));
    for (const d of [es, en]) for (const v of values(d)) expect(String(v).trim()).not.toBe("");
  });
  it("cada clave usa los mismos {placeholders} en es y en", () => {
    const flat = (o: object, p = ""): Record<string, string> =>
      Object.fromEntries(Object.entries(o).flatMap(([k, v]) => (v && typeof v === "object" ? Object.entries(flat(v, `${p}${k}.`)) : [[`${p}${k}`, String(v)]])));
    const vars = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    const fe = flat(es), fn = flat(en);
    for (const key of Object.keys(fe)) expect(vars(fn[key]), key).toEqual(vars(fe[key]));
  });
  it("getDictionary devuelve el de cada idioma", () => {
    expect(getDictionary("en")).toBe(en);
    expect(getDictionary("es")).toBe(es);
  });
});
