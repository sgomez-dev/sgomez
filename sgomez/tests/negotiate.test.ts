import { describe, expect, it } from "vitest";
import { parseAccept, prefersMarkdown, selectMediaType } from "@/lib/markdown/negotiate";
import { canonicalOfVariant, decide, markdownVariantOf } from "@/lib/markdown/routing";

const PAGE_TYPES = ["text/html", "text/markdown"];

describe("parseAccept", () => {
  it("lee tipo, subtipo, q y especificidad", () => {
    expect(parseAccept("text/markdown")).toEqual([
      { type: "text", subtype: "markdown", q: 1, specificity: 3 },
    ]);
    expect(parseAccept("text/*;q=0.5")).toEqual([
      { type: "text", subtype: "*", q: 0.5, specificity: 2 },
    ]);
    expect(parseAccept("*/*")).toEqual([{ type: "*", subtype: "*", q: 1, specificity: 1 }]);
  });

  it("ignora un Accept vacío o ausente", () => {
    expect(parseAccept(null)).toEqual([]);
    expect(parseAccept("")).toEqual([]);
  });

  it("trata un q ilegible como ausente en vez de descartar la entrada", () => {
    expect(parseAccept("text/markdown;q=abc")[0].q).toBe(1);
  });
});

describe("selectMediaType", () => {
  it("sirve el primer candidato cuando no hay Accept", () => {
    expect(selectMediaType(null, PAGE_TYPES)).toBe("text/html");
  });

  it("da markdown a quien lo pide por su nombre", () => {
    expect(selectMediaType("text/markdown", PAGE_TYPES)).toBe("text/markdown");
  });

  it("respeta los q-values", () => {
    expect(selectMediaType("text/html;q=0.8, text/markdown;q=0.9", PAGE_TYPES)).toBe("text/markdown");
    expect(selectMediaType("text/html;q=0.9, text/markdown;q=0.8", PAGE_TYPES)).toBe("text/html");
  });

  it("a igual q, el tipo con nombre gana al comodín", () => {
    // El Accept de un navegador: menciona markdown solo a través de */*.
    expect(
      selectMediaType("text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", PAGE_TYPES),
    ).toBe("text/html");
  });

  it("devuelve null cuando el cliente excluye todo lo disponible", () => {
    expect(selectMediaType("application/pdf", PAGE_TYPES)).toBeNull();
    expect(selectMediaType("*/*;q=0", PAGE_TYPES)).toBeNull();
  });
});

describe("prefersMarkdown", () => {
  const cases: [string | null, boolean][] = [
    ["text/markdown", true],
    ["text/markdown;q=1.0, text/html;q=0.8", true],
    ["text/x-markdown", true],
    ["text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", false],
    ["*/*", false],
    ["text/html", false],
    [null, false],
    // Petición RSC de Next: nunca debe recibir markdown.
    ["text/x-component", false],
  ];

  for (const [header, expected] of cases) {
    it(`${JSON.stringify(header)} → ${expected}`, () => {
      expect(prefersMarkdown(header)).toBe(expected);
    });
  }
});

describe("variantes .md", () => {
  it("va y vuelve entre la ruta canónica y su variante", () => {
    for (const path of ["/", "/about", "/developers", "/lab"]) {
      expect(canonicalOfVariant(markdownVariantOf(path))).toBe(path);
    }
  });

  it("la home usa /index.md y no /.md", () => {
    expect(markdownVariantOf("/")).toBe("/index.md");
  });
});

describe("decide", () => {
  it("no toca las peticiones RSC", () => {
    expect(decide("/about", "text/markdown", true)).toEqual({ kind: "skip" });
  });

  it("no toca /api, los assets ni los ficheros que ya sirven su formato", () => {
    expect(decide("/api/v1/profile", "text/markdown", false)).toEqual({ kind: "skip" });
    expect(decide("/_next/static/chunk.js", "text/markdown", false)).toEqual({ kind: "skip" });
    expect(decide("/llms.txt", "text/markdown", false)).toEqual({ kind: "skip" });
    expect(decide("/openapi.json", "text/markdown", false)).toEqual({ kind: "skip" });
    expect(decide("/agents.md", "text/markdown", false)).toEqual({ kind: "skip" });
    expect(decide("/Santiago.png", "*/*", false)).toEqual({ kind: "skip" });
  });

  it("sirve markdown a quien lo negocia, en la misma URL canónica", () => {
    expect(decide("/about", "text/markdown", false)).toEqual({
      kind: "markdown",
      path: "/about",
      canonical: "/about",
      indexable: true,
    });
  });

  it("sirve markdown en la variante .md, sin indexarla", () => {
    expect(decide("/about.md", "*/*", false)).toEqual({
      kind: "markdown",
      path: "/about",
      canonical: "/about",
      indexable: false,
    });
  });

  it("deja pasar el HTML anunciando su variante", () => {
    expect(decide("/", "text/html", false)).toEqual({ kind: "html", alternate: "/index.md" });
  });
});
