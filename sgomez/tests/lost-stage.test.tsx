import { describe, expect, it, vi } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { SHARDS, LINES, LINES_MOBILE, HAS_END_POSTER, CAMERA, STAGE_ASPECT_DESKTOP, project, unproject, silhouette, type ShardTarget } from "@/lib/lost/shards";
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
      for (const p of [project(s.pose, STAGE_ASPECT_DESKTOP), s.stage.mobile]) {
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
    const src = readFileSync(fileURLToPath(new URL("../src/lib/lost/shards.ts", import.meta.url)), "utf8");
    expect(/^\s*import\s|\brequire\(|\bimport\(/m.test(src)).toBe(false);
  });
});

type Pt = { left: number; top: number };
const cross = (o: Pt, a: Pt, b: Pt) => (a.left - o.left) * (b.top - o.top) - (a.top - o.top) * (b.left - o.left);
function properlyIntersect(p1: Pt, p2: Pt, p3: Pt, p4: Pt) {
  const d1 = cross(p3, p4, p1), d2 = cross(p3, p4, p2), d3 = cross(p1, p2, p3), d4 = cross(p1, p2, p4);
  return d1 * d2 < 0 && d3 * d4 < 0;
}
function checkPlanar(edges: readonly (readonly [string, string])[], k: "mobile" | "desktop") {
  const pos = new Map(SHARDS.map((s) => [s.id, k === "mobile" ? s.stage.mobile : project(s.pose, STAGE_ASPECT_DESKTOP)]));
  const bad: string[] = [];
  for (let i = 0; i < edges.length; i++)
    for (let j = i + 1; j < edges.length; j++) {
      const [a, b] = edges[i]!, [c, d] = edges[j]!;
      if (a === c || a === d || b === c || b === d) continue;
      if (properlyIntersect(pos.get(a)!, pos.get(b)!, pos.get(c)!, pos.get(d)!)) bad.push(`${a}-${b} x ${c}-${d}`);
    }
  return bad;
}

describe("constelación sin cruces", () => {
  it("LINES_MOBILE: ids válidos, grado 1 a 3, aristas cortas, sin cruces", () => {
    const ids = new Set(SHARDS.map((s) => s.id));
    const deg = new Map<string, number>();
    const pos = new Map(SHARDS.map((s) => [s.id, s.stage.mobile]));
    for (const [a, b] of LINES_MOBILE) {
      expect(ids.has(a) && ids.has(b)).toBe(true);
      deg.set(a, (deg.get(a) ?? 0) + 1);
      deg.set(b, (deg.get(b) ?? 0) + 1);
      expect(Math.hypot(pos.get(a)!.left - pos.get(b)!.left, pos.get(a)!.top - pos.get(b)!.top)).toBeLessThanOrEqual(36);
    }
    for (const s of SHARDS) {
      expect(deg.get(s.id) ?? 0, s.id).toBeGreaterThanOrEqual(1);
      expect(deg.get(s.id) ?? 0, s.id).toBeLessThanOrEqual(3);
    }
    expect(checkPlanar(LINES_MOBILE, "mobile")).toEqual([]);
  });
  it("LINES en escritorio: sin cruces", () => expect(checkPlanar(LINES, "desktop")).toEqual([]));
  it("el fragmento más bajo del móvil queda por encima del 82%", () => {
    expect(Math.max(...SHARDS.map((s) => s.stage.mobile.top))).toBeLessThanOrEqual(82);
  });
});

describe("póster final (L7)", () => {
  const exists = (n: string) => existsSync(fileURLToPath(new URL(`../public/media/404/${n}`, import.meta.url)));
  it("HAS_END_POSTER coincide con el disco (poster-end.webp)", () => {
    expect(HAS_END_POSTER).toBe(exists("poster-end.webp"));
  });
  it("sin pósters viejos de constelación en disco", () => {
    expect(exists("constellation.webp")).toBe(false);
    expect(exists("constellation-mobile.webp")).toBe(false);
  });
  it("LostStage pinta el póster final solo con HAS_END_POSTER, como CSS y nunca como <img>", () => {
    const on = renderToStaticMarkup(<LostStage lang="en" hasEndPoster />);
    expect(on).toContain("url(/media/404/poster-end.webp)");
    expect(on).toContain("100% 100%");
    expect(on).not.toMatch(/<img/);
    const off = renderToStaticMarkup(<LostStage lang="en" hasEndPoster={false} />);
    expect(off).not.toContain("poster-end");
  });
});

describe("proyección compartida (L6)", () => {
  it("unproject(project(p)) vuelve a p, a la profundidad del propio punto", () => {
    for (const s of SHARDS) {
      for (const aspect of [STAGE_ASPECT_DESKTOP, 0.75, 1.6]) {
        const q = project(s.pose, aspect);
        const back = unproject(q.left, q.top, s.pose.z, aspect);
        expect(Math.abs(back.x - s.pose.x)).toBeLessThan(1e-6);
        expect(Math.abs(back.y - s.pose.y)).toBeLessThan(1e-6);
      }
    }
  });
  it("unproject usa la profundidad (z distinto da x distinto)", () => {
    const a = unproject(80, 30, 0, STAGE_ASPECT_DESKTOP);
    const b = unproject(80, 30, 0.6, STAGE_ASPECT_DESKTOP);
    expect(b.x).toBeLessThan(a.x);
  });
  it("silhouette: polígono válido de 3 o más puntos dentro de 0 a 100%", () => {
    for (const s of SHARDS) {
      for (const aspect of [STAGE_ASPECT_DESKTOP, 0.75]) {
        const sil = silhouette(s, aspect);
        const pts = [...sil.clip.matchAll(/(-?[0-9.]+)% (-?[0-9.]+)%/g)].map((m) => [Number(m[1]), Number(m[2])]);
        expect(pts.length, s.id).toBeGreaterThanOrEqual(3);
        for (const [x, y] of pts) {
          expect(x!).toBeGreaterThanOrEqual(0);
          expect(x!).toBeLessThanOrEqual(100);
          expect(y!).toBeGreaterThanOrEqual(0);
          expect(y!).toBeLessThanOrEqual(100);
        }
        expect(sil.w).toBeGreaterThan(0);
        expect(sil.h).toBeGreaterThan(0);
      }
    }
  });
  it("las variables --dl y --dt renderizadas son project() de la pose", () => {
    const html = renderToStaticMarkup(<LostStage lang="es" hasEndPoster />);
    for (const s of SHARDS.filter((x) => x.target !== null)) {
      const p = project(s.pose, STAGE_ASPECT_DESKTOP);
      const re = new RegExp("--ml:[^;]*;--mt:[^;]*;--mh:[^;]*;--mr:[^;]*;--dl:([0-9.]+)%;--dt:([0-9.]+)%", "g");
      const found = [...html.matchAll(re)].map((m) => [Number(m[1]), Number(m[2])] as const);
      expect(found.some(([l, t]) => Math.abs(l - p.left) < 0.01 && Math.abs(t - p.top) < 0.01), s.id).toBe(true);
    }
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
    expect(html).toContain("normal-case");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("Error 404");
    expect(html).toContain("·");
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
