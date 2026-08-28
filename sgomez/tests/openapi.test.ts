import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { openApiDocument } from "@/lib/api/openapi";
import { toYaml } from "@/lib/api/yaml";
import { getProjects } from "@/lib/api/data";

type Operation = {
  operationId?: string;
  summary?: string;
  description?: string;
  parameters?: { name: string; in: string; description?: string; schema?: unknown; required?: boolean }[];
  responses?: Record<string, { description?: string; content?: Record<string, { schema?: unknown }> }>;
};

const document = openApiDocument() as unknown as {
  openapi: string;
  info: Record<string, unknown>;
  servers: { url: string }[];
  paths: Record<string, Record<string, Operation>>;
  components: { schemas: Record<string, unknown> };
};

/** Todas las operaciones del documento, con su ruta y su método. */
function operations(): { path: string; method: string; operation: Operation }[] {
  const found: { path: string; method: string; operation: Operation }[] = [];
  for (const [path, item] of Object.entries(document.paths)) {
    for (const [method, operation] of Object.entries(item)) {
      found.push({ path, method, operation });
    }
  }
  return found;
}

describe("documento OpenAPI", () => {
  it("es 3.1 y declara servidor, contacto y licencia", () => {
    expect(document.openapi).toBe("3.1.0");
    expect(document.servers[0].url).toBe("https://sgomez.dev");
    expect(document.info.contact).toBeTruthy();
    expect(document.info.license).toBeTruthy();
    expect(String(document.info.version)).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("la descripción dice cuándo usar la API y cómo llamarla", () => {
    const description = String(document.info.description);
    expect(description).toContain("When to use it");
    expect(description).toContain("How to call it");
    // El dato que un modelo se inventa solo si nadie se lo dice.
    expect(description).toMatch(/co-founder/i);
  });

  it("es serializable a JSON sin perder nada", () => {
    expect(() => JSON.parse(JSON.stringify(document))).not.toThrow();
  });
});

describe("cada operación es autodescriptiva", () => {
  it("tiene operationId, summary y description", () => {
    for (const { path, method, operation } of operations()) {
      expect(operation.operationId, `${method} ${path}`).toBeTruthy();
      expect(operation.summary, `${method} ${path}`).toBeTruthy();
      // Una descripción de tres palabras no describe nada.
      expect(String(operation.description).length, `${method} ${path}`).toBeGreaterThan(60);
    }
  });

  it("los operationId son únicos", () => {
    const ids = operations().map(({ operation }) => operation.operationId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("los operationId sirven como nombre de herramienta de function calling", () => {
    for (const { operation } of operations()) {
      expect(operation.operationId).toMatch(/^[a-zA-Z][a-zA-Z0-9_]{2,63}$/);
    }
  });

  it("todos los parámetros van tipados y descritos", () => {
    for (const { path, method, operation } of operations()) {
      for (const parameter of operation.parameters ?? []) {
        const label = `${method} ${path} → ${parameter.name}`;
        expect(parameter.schema, label).toBeTruthy();
        expect((parameter.schema as { type?: string }).type, label).toBeTruthy();
        expect(String(parameter.description).length, label).toBeGreaterThan(20);
        if (parameter.in === "path") expect(parameter.required, label).toBe(true);
      }
    }
  });

  it("toda respuesta declara un esquema de contenido", () => {
    for (const { path, method, operation } of operations()) {
      const responses = operation.responses ?? {};
      expect(Object.keys(responses).length, `${method} ${path}`).toBeGreaterThan(0);
      for (const [status, response] of Object.entries(responses)) {
        const label = `${method} ${path} → ${status}`;
        expect(response.description, label).toBeTruthy();
        const schema = response.content?.["application/json"]?.schema;
        expect(schema, label).toBeTruthy();
      }
    }
  });

  it("los endpoints que aceptan parámetros documentan su 400", () => {
    for (const { operation } of operations()) {
      if ((operation.parameters ?? []).some((parameter) => parameter.in === "query")) {
        expect(Object.keys(operation.responses ?? {})).toContain("400");
      }
    }
  });
});

describe("esquemas", () => {
  it("todas las referencias resuelven", () => {
    const refs: string[] = [];
    const walk = (node: unknown) => {
      if (Array.isArray(node)) return node.forEach(walk);
      if (node && typeof node === "object") {
        for (const [key, value] of Object.entries(node)) {
          if (key === "$ref" && typeof value === "string") refs.push(value);
          else walk(value);
        }
      }
    };
    walk(document);

    expect(refs.length).toBeGreaterThan(0);
    for (const ref of refs) {
      expect(ref.startsWith("#/components/schemas/"), ref).toBe(true);
      const name = ref.replace("#/components/schemas/", "");
      expect(Object.keys(document.components.schemas), ref).toContain(name);
    }
  });

  it("cada propiedad de cada esquema lleva tipo o referencia", () => {
    const walk = (node: unknown, label: string) => {
      if (!node || typeof node !== "object") return;
      const schema = node as Record<string, unknown>;
      if (schema.properties) {
        for (const [name, property] of Object.entries(schema.properties as Record<string, Record<string, unknown>>)) {
          const has = property.type || property.$ref || property.allOf || property.enum;
          expect(has, `${label}.${name}`).toBeTruthy();
          walk(property, `${label}.${name}`);
        }
      }
      if (schema.items) walk(schema.items, `${label}[]`);
      for (const composite of ["allOf", "anyOf", "oneOf"]) {
        for (const entry of (schema[composite] as unknown[]) ?? []) walk(entry, label);
      }
    };

    for (const [name, schema] of Object.entries(document.components.schemas)) walk(schema, name);
  });

  it("el esquema Error describe el sobre real de los errores", () => {
    const error = document.components.schemas.Error as {
      properties: { error: { required: string[]; properties: { code: { enum: string[] } } } };
    };
    expect(error.properties.error.required).toEqual([
      "status",
      "code",
      "message",
      "hint",
      "documentation_url",
    ]);
    expect(error.properties.error.properties.code.enum).toContain("not_found");
    expect(error.properties.error.properties.code.enum).toContain("invalid_parameter");
    expect(error.properties.error.properties.code.enum).toContain("method_not_allowed");
  });
});

describe("el documento describe las rutas que existen de verdad", () => {
  /** Rutas reales de /api leídas del sistema de ficheros. */
  function routeFiles(directory: string, prefix = ""): string[] {
    const paths: string[] = [];
    for (const entry of readdirSync(directory)) {
      const full = join(directory, entry);
      if (statSync(full).isDirectory()) {
        // [...path] es el comodín del 404 en JSON: no es un endpoint documentable.
        if (entry.startsWith("[...")) continue;
        const segment = entry.startsWith("[") ? `/{${entry.slice(1, -1)}}` : `/${entry}`;
        paths.push(...routeFiles(full, `${prefix}${segment}`));
      } else if (entry === "route.ts" && prefix.startsWith("/v1")) {
        paths.push(`/api${prefix}`);
      }
    }
    return paths;
  }

  it("una ruta documentada por cada endpoint de /api/v1, y ninguna de más", () => {
    const onDisk = routeFiles("src/app/api").sort();
    const documented = Object.keys(document.paths).sort();
    expect(documented).toEqual(onDisk);
  });

  it("el slug de ejemplo es un proyecto que existe", () => {
    const parameter = document.paths["/api/v1/projects/{slug}"].get.parameters?.[0] as unknown as { example: string };
    expect(getProjects().map((project) => project.slug)).toContain(parameter.example);
  });
});

describe("serialización YAML", () => {
  it("emite el mismo documento", () => {
    const yaml = toYaml(document);
    expect(yaml.startsWith('"openapi": "3.1.0"')).toBe(true);
    expect(yaml.endsWith("\n")).toBe(true);
  });

  it("escapa lo que rompería el documento: comillas, saltos de línea y $ref", () => {
    const yaml = toYaml({
      quote: 'dice "hola"',
      multiline: "una\ndos",
      ref: { $ref: "#/components/schemas/Error" },
      empty: {},
      list: [1, true, "x"],
    });
    expect(yaml).toBe(
      [
        '"quote": "dice \\"hola\\""',
        '"multiline": "una\\ndos"',
        '"ref":',
        '  "$ref": "#/components/schemas/Error"',
        '"empty": {}',
        '"list":',
        "  - 1",
        "  - true",
        '  - "x"',
        "",
      ].join("\n"),
    );
  });
});
