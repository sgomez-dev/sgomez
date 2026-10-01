import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import proxy from "@/proxy";
import { __resetMoldeCache } from "@/lib/lost/molde";
import sitemap from "@/app/sitemap";

const req = (path: string, headers: Record<string, string> = {}) =>
  new NextRequest(`https://sgomez.dev${path}`, { headers });

afterEach(() => {
  vi.unstubAllGlobals();
  __resetMoldeCache();
});

describe("proxy: 404 real por idioma", () => {
  it("con la cabecera de bypass, /es/perdido y /en/perdido se sirven directos (sin 308 ni rewrite)", async () => {
    for (const path of ["/es/perdido", "/en/perdido"]) {
      const res = await proxy(req(path, { "x-sgomez-404": "1" }));
      expect(res.status, path).toBe(200);
      expect(res.headers.get("location"), path).toBeNull();
      expect(res.headers.get("x-middleware-rewrite"), path).toBeNull();
      expect(res.headers.get("x-middleware-next"), path).toBe("1");
    }
  });

  it("sin la cabecera, /es/perdido redirige 308 a /perdido", async () => {
    const res = await proxy(req("/es/perdido"));
    expect(res.status).toBe(308);
  });

  it("una ruta desconocida devuelve 404 con el molde de su idioma y las cabeceras", async () => {
    const f = vi.fn(async (url: URL) => new Response(`<html lang="x">${url.pathname}</html>`, { status: 200 }));
    vi.stubGlobal("fetch", f);
    const en = await proxy(req("/en/no-existe", { accept: "text/html" }));
    expect(en.status).toBe(404);
    expect(await en.text()).toContain("/en/perdido");
    expect(en.headers.get("content-type")).toBe("text/html; charset=utf-8");
    expect(en.headers.get("cache-control")).toBe("public, max-age=60, s-maxage=60");
    expect(en.headers.get("x-robots-tag")).toBe("noindex, follow");
    expect(en.headers.get("vary")).toContain("Accept");
    const es = await proxy(req("/no-existe", { accept: "text/html" }));
    expect(es.status).toBe(404);
    expect(await es.text()).toContain("/es/perdido");
  });

  it("si el molde falla sirve el HTML de reserva con 404, nunca un 500", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("boom"); }));
    const res = await proxy(req("/en/no-existe", { accept: "text/html" }));
    expect(res.status).toBe(404);
    const html = await res.text();
    expect(html).toContain('<html lang="en">');
    expect(html).toContain("https://sgomez.dev/en/about");
  });

  it("Accept: text/markdown en una ruta desconocida sigue dando el markdown 404", async () => {
    const res = await proxy(req("/en/no-existe", { accept: "text/markdown" }));
    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toContain("text/markdown");
  });

  it("/foo.png y /api/nope no reciben la experiencia HTML", async () => {
    const f = vi.fn();
    vi.stubGlobal("fetch", f);
    await proxy(req("/foo.png"));
    expect(f).not.toHaveBeenCalled();
  });

  it("el sitemap no publica /perdido", () => {
    expect(sitemap().some((e) => e.url.includes("perdido"))).toBe(false);
  });
});

describe("bypass sin recursión", () => {
  it("una petición con bypass a otra ruta NO llama a fetch y recibe la reserva 404", async () => {
    const f = vi.fn();
    vi.stubGlobal("fetch", f);
    const res = await proxy(req("/no-existe", { "x-sgomez-404": "1" }));
    expect(f).not.toHaveBeenCalled();
    expect(res.status).toBe(404);
    expect(await res.text()).toContain('<html lang="es-ES">');
  });
  it("la respuesta directa del molde no es cacheable ni indexable", async () => {
    const res = await proxy(req("/en/perdido", { "x-sgomez-404": "1" }));
    expect(res.headers.get("cache-control")).toBe("private, no-store");
    expect(res.headers.get("x-robots-tag")).toBe("noindex, follow");
  });
  it("la reserva degradada (sin molde) no es cacheable", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("x", { status: 500 })));
    const res = await proxy(req("/en/no-existe", { accept: "text/html" }));
    expect(res.status).toBe(404);
    expect(res.headers.get("cache-control")).toBe("private, no-store");
  });
  it("con un Host falso el fetch va a SITE_URL", async () => {
    const f = vi.fn(async (url: URL) => new Response(String(url), { status: 200 }));
    vi.stubGlobal("fetch", f);
    const res = await proxy(new NextRequest("https://evil.example/no-existe", { headers: { accept: "text/html" } }));
    expect(res.status).toBe(404);
    expect(String(f.mock.calls[0]![0])).toBe("https://sgomez.dev/es/perdido");
  });
});
