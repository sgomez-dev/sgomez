import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { GET as llmsTxt } from "@/app/llms.txt/route";
import { GET as agentsMd } from "@/app/agents.md/route";
import { GET as openApiJson } from "@/app/openapi.json/route";
import { GET as openApiYaml } from "@/app/api/openapi.yaml/route";
import sitemap from "@/app/sitemap";
import { personGraph } from "@/app/seo";
import { HTML_ROUTES, MACHINE_ROUTES, PAGE_VARY } from "@/lib/site";

type Node = Record<string, unknown>;

const graph = personGraph()["@graph"] as Node[];

function nodeOfType(type: string): Node {
  const found = graph.find((node) => {
    const value = node["@type"];
    return Array.isArray(value) ? value.includes(type) : value === type;
  });
  if (!found) throw new Error(`No hay nodo ${type} en el grafo`);
  return found;
}

describe("/llms.txt", () => {
  it("se sirve como markdown", async () => {
    const response = llmsTxt();
    expect(response.headers.get("content-type")).toBe("text/markdown; charset=utf-8");
    expect(await response.text()).toBeTruthy();
  });

  it("dice cuándo usar el sitio, con trabajos concretos", async () => {
    const text = await llmsTxt().text();
    expect(text).toContain("## When to use this");
    // El valor de la sección está en que nombre trabajos, no en que exista.
    expect(text).toMatch(/Verify who Santiago/);
    expect(text).toMatch(/Check whether he has shipped with a given technology/);
    // Y en que diga también cuándo NO es la fuente correcta.
    expect(text).toMatch(/Do not use it as the source for SkyQuetz/);
  });

  it("anuncia la API y los ficheros para máquinas por su nombre", async () => {
    const text = await llmsTxt().text();
    expect(text).toContain("## API & machine-readable files");
    for (const route of MACHINE_ROUTES) {
      expect(text, route.path).toContain(`https://sgomez.dev${route.path}`);
    }
    expect(text).toContain("https://sgomez.dev/developers");
    expect(text).toContain("/api/v1/profile");
  });

  it("sigue insistiendo en el matiz de cofundador", async () => {
    const text = await llmsTxt().text();
    expect(text).toMatch(/co-founder, not the founder/);
  });
});

describe("/agents.md", () => {
  it("se sirve como markdown y responde cuándo y cómo", async () => {
    const response = agentsMd();
    expect(response.headers.get("content-type")).toBe("text/markdown; charset=utf-8");

    const text = await response.text();
    expect(text).toContain("## When to use this site");
    expect(text).toContain("## How to call it");
    expect(text).toContain("## Facts to get right");
    expect(text).toContain("curl -s https://sgomez.dev/api/v1/profile");
    expect(text).toContain("https://sgomez.dev/openapi.json");
    // El error que un modelo comete solo.
    expect(text).toMatch(/Co-founder, not founder/);
  });
});

describe("especificación publicada", () => {
  it("/openapi.json sirve JSON válido", async () => {
    const response = openApiJson();
    expect(response.headers.get("content-type")).toBe("application/json; charset=utf-8");
    const document = JSON.parse(await response.text());
    expect(document.openapi).toBe("3.1.0");
  });

  it("/api/openapi.yaml sirve el mismo documento en YAML", async () => {
    const response = openApiYaml();
    expect(response.headers.get("content-type")).toBe("application/yaml; charset=utf-8");
    expect(await response.text()).toContain('"openapi": "3.1.0"');
  });
});

describe("sitemap", () => {
  const entries = sitemap();
  const urls = entries.map((entry) => entry.url);

  it("incluye todas las páginas HTML", () => {
    for (const route of HTML_ROUTES) {
      expect(urls, route.path).toContain(`https://sgomez.dev${route.path}`);
    }
  });

  it("incluye los ficheros que un agente busca por su nombre", () => {
    expect(urls).toContain("https://sgomez.dev/llms.txt");
    expect(urls).toContain("https://sgomez.dev/agents.md");
    expect(urls).toContain("https://sgomez.dev/openapi.json");
  });

  it("no repite ninguna URL", () => {
    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe("robots.txt", () => {
  const text = readFileSync("public/robots.txt", "utf8");

  it("anuncia las rampas de entrada para agentes", () => {
    for (const path of ["/llms.txt", "/agents.md", "/openapi.json", "/developers"]) {
      expect(text, path).toContain(`https://sgomez.dev${path}`);
    }
  });

  it("sigue permitiendo el rastreo y declarando el sitemap", () => {
    expect(text).toContain("User-agent: *\nAllow: /");
    expect(text).toContain("Sitemap: https://sgomez.dev/sitemap.xml");
  });
});

describe("JSON-LD de la organización", () => {
  const organization = nodeOfType("ProfessionalService");

  it("declara contactPoint con email y tipo de contacto", () => {
    const contactPoints = organization.contactPoint as Node[];
    expect(Array.isArray(contactPoints)).toBe(true);
    const [contact] = contactPoints;
    expect(contact["@type"]).toBe("ContactPoint");
    expect(contact.contactType).toBeTruthy();
    expect(String(contact.email)).toContain("@");
    expect(contact.availableLanguage).toEqual(["Spanish", "English"]);
  });

  it("declara address como PostalAddress", () => {
    const address = organization.address as Node;
    expect(address["@type"]).toBe("PostalAddress");
    expect(address.addressLocality).toBe("Santander");
    expect(address.addressRegion).toBe("Cantabria");
    expect(address.addressCountry).toBe("ES");
  });

  it("mantiene la relación con la persona sin fusionar las dos entidades", () => {
    // sameAs de la empresa apunta al @id que skyquetz.com usa para sí misma,
    // y el sameAs de la persona NO contiene skyquetz.com. Si esto se rompe,
    // el grafo pasa a afirmar que la persona y la empresa son lo mismo.
    expect(organization.sameAs).toEqual(["https://skyquetz.com/#org"]);
    const person = nodeOfType("Person");
    expect(person.sameAs).not.toContain("https://skyquetz.com");
    expect(organization.founder).toEqual({ "@id": "https://sgomez.dev/#person" });
    expect(organization.numberOfEmployees).toEqual({ "@type": "QuantitativeValue", value: 4 });
  });

  it("las organizaciones nombradas en la persona llevan su localidad", () => {
    const person = nodeOfType("Person");
    const evenbytes = (person.worksFor as Node[])[0];
    expect((evenbytes.address as Node).addressLocality).toBe("Santa Cruz de Bezana");
    const gdg = (person.memberOf as Node[])[0];
    expect((gdg.address as Node).addressLocality).toBe("Santander");
  });
});

describe("Vary: Accept en las páginas HTML", () => {
  /**
   * Next 16 sobreescribe el `Vary` de las respuestas de página, así que el
   * valor que llega al cliente lo fija la capa de hosting. Lo que este test
   * protege es que las tres declaraciones digan lo mismo: si alguien arregla
   * una y se olvida de las otras, gana la desactualizada y el fallo es
   * invisible en local.
   */
  const files = {
    "next.config.ts": readFileSync("next.config.ts", "utf8"),
    "vercel.json": readFileSync("vercel.json", "utf8"),
  };

  it("las tres declaraciones coinciden con PAGE_VARY", () => {
    for (const [name, content] of Object.entries(files)) {
      expect(content, name).toContain(PAGE_VARY);
    }
  });

  it("PAGE_VARY declara Accept y conserva los tokens de RSC", () => {
    expect(PAGE_VARY).toContain("Accept");
    for (const token of ["RSC", "Next-Router-State-Tree", "Next-Router-Prefetch", "Next-Router-Segment-Prefetch"]) {
      expect(PAGE_VARY, token).toContain(token);
    }
    expect(PAGE_VARY).toContain("Accept-Encoding");
  });

  it("las reglas de cabeceras excluyen /api y los assets", () => {
    for (const [name, content] of Object.entries(files)) {
      expect(content, name).toContain("(?!api/|_next/static/|_next/image)");
    }
  });

  it("vercel.json es JSON válido", () => {
    expect(() => JSON.parse(files["vercel.json"])).not.toThrow();
  });
});
