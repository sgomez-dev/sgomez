import { describe, expect, it } from "vitest";
import { STATIC_PAGES, aboutPage, contactPage, developersPage, privacyPage } from "@/lib/content/pages";
import { renderPageMarkdown } from "@/lib/markdown/render";
import { MARKDOWN_PATHS, markdownForPath, notFoundMarkdown } from "@/lib/markdown/documents";
import { tokenizeInline } from "@/lib/content/inline";
import { pageMetadata } from "@/lib/content/metadata";
import { HTML_ROUTES, MACHINE_ROUTES } from "@/lib/site";

/** Texto plano de una página, para medir cuánto contenido real tiene. */
function plainText(page: (typeof STATIC_PAGES)[number]): string {
  const parts: string[] = [page.lead];
  for (const section of page.sections) {
    parts.push(section.heading);
    for (const block of section.blocks) {
      if (block.kind === "paragraph") parts.push(block.text);
      else if (block.kind === "list") parts.push(...block.items);
      else if (block.kind === "links") parts.push(...block.items.map((item) => item.note ?? ""));
      else if (block.kind === "table") parts.push(...block.rows.flat());
    }
  }
  return parts.join(" ");
}

describe("páginas de confianza", () => {
  // El umbral que comprueba la auditoría: menos de 500 caracteres es una
  // página de relleno, y una página de relleno no acredita nada.
  for (const page of [aboutPage, contactPage, privacyPage]) {
    it(`${page.path} supera los 500 caracteres de contenido`, () => {
      expect(plainText(page).length).toBeGreaterThan(500);
    });
  }

  it("la privacidad afirma solo lo que el código sostiene", () => {
    const text = plainText(privacyPage);
    expect(text).toContain("cookies");
    expect(text).toMatch(/analítica/i);
    expect(text).toMatch(/RGPD|Reglamento General de Protección de Datos/i);
  });

  it("cada página lleva título con marca y descripción propia", () => {
    for (const page of STATIC_PAGES) {
      expect(page.metaTitle.length).toBeGreaterThan(20);
      // El nombre tiene que estar en el título para las búsquedas por nombre.
      expect(page.metaTitle).toMatch(/sgomez\.dev|Santiago Gómez/);
      expect(page.description.length).toBeGreaterThan(80);
    }
  });

  it("la metadata declara canónica y variante markdown", () => {
    const metadata = pageMetadata(aboutPage);
    expect(metadata.alternates?.canonical).toBe("/about");
    expect(metadata.alternates?.types).toEqual({ "text/markdown": "/about.md" });
  });
});

describe("portal de desarrolladores", () => {
  const text = plainText(developersPage);

  it("cubre quickstart, endpoints, errores, autenticación y OpenAPI", () => {
    const headings = developersPage.sections.map((section) => section.id);
    expect(headings).toEqual(
      expect.arrayContaining(["quickstart", "endpoints", "errores", "autenticacion", "openapi", "markdown"]),
    );
  });

  it("incluye ejemplos ejecutables", () => {
    const code = developersPage.sections
      .flatMap((section) => section.blocks)
      .filter((block) => block.kind === "code");
    expect(code.length).toBeGreaterThanOrEqual(3);
    expect(code.some((block) => block.kind === "code" && block.code.includes("curl"))).toBe(true);
  });

  it("documenta cada endpoint con su operationId", () => {
    const table = developersPage.sections
      .flatMap((section) => section.blocks)
      .find((block) => block.kind === "table");
    expect(table?.kind).toBe("table");
    if (table?.kind !== "table") return;
    expect(table.rows.length).toBeGreaterThanOrEqual(11);
    for (const row of table.rows) {
      expect(row[0]).toMatch(/^GET \/api\/v1/);
      expect(row[1]).toMatch(/^[a-zA-Z]+$/);
    }
    expect(text).toContain("limit");
  });
});

describe("markdown de las páginas", () => {
  it("hay variante markdown para todas las rutas HTML", () => {
    for (const route of HTML_ROUTES) {
      expect(MARKDOWN_PATHS, route.path).toContain(route.path);
      expect(markdownForPath(route.path)).toBeTruthy();
    }
  });

  it("empieza por un h1 y lleva la URL canónica", () => {
    for (const path of MARKDOWN_PATHS) {
      const document = markdownForPath(path) as string;
      expect(document.startsWith("# "), path).toBe(true);
      expect(document, path).toContain("https://sgomez.dev");
      expect(document.length, path).toBeGreaterThan(400);
    }
  });

  it("no devuelve nada para una ruta que no existe", () => {
    expect(markdownForPath("/no-existe")).toBeUndefined();
  });

  it("las tablas se renderizan como tabla markdown", () => {
    const document = renderPageMarkdown(developersPage);
    expect(document).toContain("| Método y ruta | operationId | Qué devuelve |");
    expect(document).toContain("| --- | --- | --- |");
  });

  it("los enlaces relativos salen absolutos, para poder leerse sin base", () => {
    const document = renderPageMarkdown(contactPage);
    expect(document).toContain("(https://sgomez.dev/llms.txt)");
    expect(document).not.toMatch(/\]\(\/[a-z]/);
  });
});

describe("cuerpo del 404", () => {
  const document = notFoundMarkdown("/lo-que-sea");

  it("dice qué ruta falló", () => {
    expect(document).toContain("/lo-que-sea");
    expect(document.startsWith("# 404")).toBe(true);
  });

  it("lista todas las páginas y todos los ficheros para máquinas", () => {
    for (const route of [...HTML_ROUTES, ...MACHINE_ROUTES]) {
      expect(document, route.path).toContain(`https://sgomez.dev${route.path}`);
    }
  });

  it("apunta a los puntos de entrada de la API", () => {
    expect(document).toContain("/api/v1/health");
    expect(document).toContain("/api/v1/profile");
    expect(document).toContain("/api/v1/search");
  });

  it("funciona también sin ruta, que es como lo usa la página HTML", () => {
    expect(notFoundMarkdown()).toContain("La ruta pedida no existe");
  });
});

describe("marcado en línea", () => {
  it("separa negrita, código y texto", () => {
    expect(tokenizeInline("un **año** y `código` final")).toEqual([
      { kind: "text", value: "un " },
      { kind: "strong", value: "año" },
      { kind: "text", value: " y " },
      { kind: "code", value: "código" },
      { kind: "text", value: " final" },
    ]);
  });

  it("deja el texto sin marcas en una sola pieza", () => {
    expect(tokenizeInline("texto llano")).toEqual([{ kind: "text", value: "texto llano" }]);
  });
});
