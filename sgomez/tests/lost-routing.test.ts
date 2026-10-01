import { describe, expect, it, vi } from "vitest";
import { isUnknownHtmlPath } from "@/lib/routing/request";
import { fetchMolde, fallback404Html, __resetMoldeCache } from "@/lib/lost/molde";

describe("isUnknownHtmlPath", () => {
  it.each([
    ["/no-existe", true], ["/en/no-existe", true], ["/about/x", true], ["/perdido", true], ["/en/perdido", true],
    ["/", false], ["/about", false], ["/en", false], ["/en/about", false], ["/developers", false],
    ["/api/nope", false], ["/_next/static/x.js", false], ["/foo.png", false], ["/about.md", false],
    ["/llms.txt", false], ["/en/llms.txt", false], ["/robots.txt", false], ["/opengraph-image", false], ["/en/opengraph-image", false],
  ])("%s → %s", (path, expected) => expect(isUnknownHtmlPath(path)).toBe(expected));
});

describe("fetchMolde", () => {
  it("una sola petición por idioma dentro del TTL (Review Focus 1)", async () => {
    __resetMoldeCache();
    const f = vi.fn(async () => new Response("<html lang=\"en\">molde</html>", { status: 200 }));
    let t = 0;
    expect(await fetchMolde("en", "https://sgomez.dev", f as unknown as typeof fetch, () => t)).toContain("molde");
    t = 30_000;
    await fetchMolde("en", "https://sgomez.dev", f as unknown as typeof fetch, () => t);
    expect(f).toHaveBeenCalledTimes(1);
    t = 61_000;
    await fetchMolde("en", "https://sgomez.dev", f as unknown as typeof fetch, () => t);
    expect(f).toHaveBeenCalledTimes(2);
  });
  it("manda la cabecera de bypass y pide la ruta interna del idioma", async () => {
    __resetMoldeCache();
    const f = vi.fn(async () => new Response("x", { status: 200 }));
    await fetchMolde("es", "https://sgomez.dev", f as unknown as typeof fetch, () => 0);
    const [url, init] = f.mock.calls[0]! as unknown as [URL, RequestInit];
    expect(String(url)).toBe("https://sgomez.dev/es/perdido");
    expect(new Headers(init.headers).get("x-sgomez-404")).toBe("1");
  });
  it("devuelve null si falla o no es 200 (Review Focus 2)", async () => {
    __resetMoldeCache();
    expect(await fetchMolde("es", "https://x", (async () => { throw new Error("boom"); }) as unknown as typeof fetch, () => 0)).toBeNull();
    __resetMoldeCache();
    expect(await fetchMolde("es", "https://x", (async () => new Response("no", { status: 500 })) as unknown as typeof fetch, () => 0)).toBeNull();
  });
});

describe("fallback404Html", () => {
  it("es HTML completo, en el idioma y con enlaces a las páginas", () => {
    const html = fallback404Html("/en/<script>", "en");
    expect(html).toMatch(/^<!doctype html>/i);
    expect(html).toContain('<html lang="en">');
    expect(fallback404Html("/x", "es")).toContain('<html lang="es-ES">');
    expect(html).toContain('href="https://sgomez.dev/en/about"');
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { PAGES } from "@/lib/routing/pages";
import { safeOrigin, MOLDE_PATH } from "@/lib/lost/molde";

describe("fetchMolde: robustez", () => {
  const ok = () => new Response("<html>molde</html>", { status: 200 });
  it("redirect manual y signal en la petición; un 3xx es fallo", async () => {
    __resetMoldeCache();
    const f = vi.fn(async () => new Response(null, { status: 307 }));
    expect(await fetchMolde("es", "https://sgomez.dev", f as unknown as typeof fetch, () => 0)).toBeNull();
    const init = (f.mock.calls[0] as unknown as [URL, RequestInit])[1];
    expect(init.redirect).toBe("manual");
    expect(init.signal).toBeDefined();
  });
  it("un fetch que nunca resuelve acaba en null por el timeout", async () => {
    __resetMoldeCache();
    const never = (() => new Promise(() => {})) as unknown as typeof fetch;
    expect(await fetchMolde("es", "https://sgomez.dev", never, () => 0, 20)).toBeNull();
  });
  it("peticiones concurrentes en frío hacen UN fetch", async () => {
    __resetMoldeCache();
    const f = vi.fn(async () => { await new Promise((r) => setTimeout(r, 10)); return ok(); });
    const r = await Promise.all([1, 2, 3].map(() => fetchMolde("en", "https://sgomez.dev", f as unknown as typeof fetch, () => 0)));
    expect(f).toHaveBeenCalledTimes(1);
    expect(r.every((x) => x === "<html>molde</html>")).toBe(true);
  });
  it("caché negativa de 10 s tras un fallo", async () => {
    __resetMoldeCache();
    const f = vi.fn(async () => new Response("x", { status: 500 }));
    let t = 0;
    await fetchMolde("es", "https://sgomez.dev", f as unknown as typeof fetch, () => t);
    t = 5_000;
    expect(await fetchMolde("es", "https://sgomez.dev", f as unknown as typeof fetch, () => t)).toBeNull();
    expect(f).toHaveBeenCalledTimes(1);
    t = 11_000;
    await fetchMolde("es", "https://sgomez.dev", f as unknown as typeof fetch, () => t);
    expect(f).toHaveBeenCalledTimes(2);
  });
});

describe("safeOrigin", () => {
  it("acepta los orígenes conocidos y descarta cualquier otro", () => {
    expect(safeOrigin("https://sgomez.dev")).toBe("https://sgomez.dev");
    expect(safeOrigin("http://localhost:3320")).toBe("http://localhost:3320");
    expect(safeOrigin("https://evil.example")).toBe("https://sgomez.dev");
    vi.stubEnv("VERCEL_URL", "sgomez-abc.vercel.app");
    expect(safeOrigin("https://sgomez-abc.vercel.app")).toBe("https://sgomez-abc.vercel.app");
    vi.unstubAllEnvs();
  });
});

describe("las páginas estáticas existen en PAGES (Minor 7)", () => {
  it("cada app/[lang]/*/page.tsx estático está en PAGES", () => {
    const dir = join(process.cwd(), "src/app", "[lang]");
    const found = readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name !== "perdido" && !d.name.startsWith("["))
      .filter((d) => existsSync(join(dir, d.name, "page.tsx")))
      .map((d) => `/${d.name}`);
    expect(found.length).toBeGreaterThan(0);
    for (const p of found) expect(PAGES as readonly string[], p).toContain(p);
  });
});

describe("el molde tiene un solo h1 por idioma (Minor 9)", () => {
  it("renderiza un h1 y las dos rutas internas existen", async () => {
    expect(MOLDE_PATH).toEqual({ es: "/es/perdido", en: "/en/perdido" });
    const { default: Page } = await import("@/app/[lang]/perdido/page");
    for (const lang of ["es", "en"]) {
      const html = renderToStaticMarkup(await Page({ params: Promise.resolve({ lang }) }));
      expect(html.match(/<h1/g), lang).toHaveLength(1);
    }
  });
});
