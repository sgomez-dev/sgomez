import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { SHARDS, LINES, CAMERA, type ShardTarget } from "@/lib/lost/shards";
import { shardHref } from "@/lib/lost/shard-links";
import LostStage from "@/chapters/lost/LostStage";
import { RequestedPathLabel, formatRequestedPath, readRequestedPath } from "@/chapters/lost/RequestedPath";
import { LANGS } from "@/i18n/languages";
import { getDictionary } from "@/i18n";
import { PAGES } from "@/lib/routing/pages";
import { localizedPath } from "@/i18n/languages";
import { MACHINE_ROUTES } from "@/lib/site";
import { machineHref } from "@/lib/routing/pages";

const TARGETS: ShardTarget[] = ["home", "about", "work", "openSource", "contact", "developers", "agents"];

describe("SHARDS", () => {
  it("siete con destino, cada destino una sola vez, y 4 o 5 decorativos", () => {
    const linked = SHARDS.filter((s) => s.target !== null);
    expect(linked).toHaveLength(7);
    expect([...linked.map((s) => s.target)].sort()).toEqual([...TARGETS].sort());
    const decorative = SHARDS.filter((s) => s.target === null);
    expect(decorative.length).toBeGreaterThanOrEqual(4);
    expect(decorative.length).toBeLessThanOrEqual(5);
    expect(new Set(SHARDS.map((s) => s.id)).size).toBe(SHARDS.length);
  });
  it("escala 0.4 a 1.4 y posiciones dentro de la caja", () => {
    for (const s of SHARDS) {
      expect(s.scale).toBeGreaterThanOrEqual(0.4);
      expect(s.scale).toBeLessThanOrEqual(1.4);
      for (const p of [s.stage.desktop, s.stage.mobile]) {
        expect(p.left).toBeGreaterThan(5);
        expect(p.left).toBeLessThan(95);
        expect(p.top).toBeGreaterThan(0);
        expect(p.top).toBeLessThan(100);
      }
    }
    expect(CAMERA.fov).toBe(35);
  });
  it("todos los ids de LINES existen", () => {
    const ids = new Set(SHARDS.map((s) => s.id));
    expect(LINES.length).toBeGreaterThan(5);
    for (const [a, b] of LINES) {
      expect(ids.has(a), a).toBe(true);
      expect(ids.has(b), b).toBe(true);
    }
  });
  it("shards.ts no importa nada (Remotion lo importa por ruta relativa)", () => {
    const src = readFileSync("src/lib/lost/shards.ts", "utf8");
    expect(/^\s*import\s|\brequire\(|\bimport\(/m.test(src)).toBe(false);
  });
});

describe("shardHref", () => {
  const machinePaths = new Set<string>(MACHINE_ROUTES.map((r) => r.path));
  for (const lang of LANGS) {
    it(`${lang}: cada destino apunta a una ruta del catálogo o a un fichero de máquina`, () => {
      const known = new Set<string>([
        ...PAGES.map((p) => localizedPath(lang, p)),
        ...[...machinePaths].map((p) => machineHref(p, lang)),
      ]);
      for (const t of TARGETS) {
        const href = shardHref(t, lang);
        expect(known.has(href.split("#")[0]!), `${t} → ${href}`).toBe(true);
      }
    });
  }
  it("anclas y destinos concretos", () => {
    expect(shardHref("work", "es")).toBe("/#work");
    expect(shardHref("work", "en")).toBe("/en#work");
    expect(shardHref("openSource", "en")).toBe("/en#open-source");
    expect(shardHref("contact", "es")).toBe("/#contact");
    expect(shardHref("agents", "en")).toBe("/en/llms.txt");
    expect(shardHref("agents", "es")).toBe("/llms.txt");
  });
});

describe("LostStage", () => {
  for (const lang of LANGS) {
    const html = renderToStaticMarkup(<LostStage lang={lang} />);
    const d = getDictionary(lang);
    it(`${lang}: siete enlaces con su href, título, data-stage y nada oculto`, () => {
      expect(html).toContain('data-stage="lost"');
      expect(html).toContain(d.notFound.heading);
      expect(html).toContain(d.notFound.headingSerif);
      expect(html).toContain("<h1");
      const anchors = html.match(/<a [^>]*data-shard-id="[^"]+"[^>]*>/g) ?? [];
      expect(anchors).toHaveLength(7);
      for (const t of TARGETS) expect(html).toContain(`href="${shardHref(t, lang)}"`);
      expect(html.match(/data-shard-id="/g)!.length).toBe(SHARDS.length);
      expect(html).not.toMatch(/opacity:\s*0\s*[;"]/);
      expect(html).not.toMatch(/visibility:\s*hidden|display:\s*none/);
      expect(html).toContain(d.lost.here);
      expect(html).toContain(d.notFound.home);
      expect(html).toContain(d.notFound.map);
    });
    it(`${lang}: la imagen de fondo solo va por CSS, nunca por <img>`, () => {
      expect(html).not.toMatch(/<img/);
    });
  }
  it("en: título inglés", () => {
    const html = renderToStaticMarkup(<LostStage lang="en" />);
    expect(html).toContain("This page");
    expect(html).toContain("broke.");
  });
});

describe("RequestedPath", () => {
  it("trunca a 80 caracteres", () => {
    const long = "/" + "a".repeat(200);
    expect(Array.from(formatRequestedPath(long)).length).toBe(80);
    expect(formatRequestedPath("/corta")).toBe("/corta");
  });
  it("escapa el HTML en el render", () => {
    const html = renderToStaticMarkup(<RequestedPathLabel label="Error 404" path={formatRequestedPath('/<script>alert(1)</script>')} />);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("Error 404 · ");
  });
  it("sin ruta el label es solo «Error 404»", () => {
    expect(renderToStaticMarkup(<RequestedPathLabel label="Error 404" path="" />)).not.toContain("·");
  });
  it("lee location.pathname", () => {
    vi.stubGlobal("location", { pathname: "/en/proyectos-secretos" });
    expect(readRequestedPath()).toBe("/en/proyectos-secretos");
    vi.unstubAllGlobals();
    expect(readRequestedPath()).toBe("");
  });
});

describe("diccionario lost.*", () => {
  it("existe en los dos idiomas con las mismas claves y sin rayas", () => {
    const es = getDictionary("es").lost;
    const en = getDictionary("en").lost;
    expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort());
    expect(JSON.stringify(es) + JSON.stringify(en)).not.toMatch(/—|–| -- /);
  });
});
