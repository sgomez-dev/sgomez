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
    expect(html).toContain('href="https://sgomez.dev/en/about"');
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
