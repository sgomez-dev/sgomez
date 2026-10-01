import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import proxy from "@/proxy";

const get = (path: string, accept = "text/markdown") =>
  proxy(new NextRequest(`https://sgomez.dev${path}`, { headers: { accept } }));

/** Las cabeceras Link se combinan en una sola con comas: se separan por `<`. */
const links = (res: Response) => (res.headers.get("link") ?? "").split(/,\s*(?=<)/);

describe("B3: la variante markdown anuncia sus hreflang", () => {
  const alt = (lang: string, url: string) => `<${url}>; rel="alternate"; hreflang="${lang}"`;

  it("/about.md", () => {
    const res = get("/about.md", "*/*");
    expect(res.status).toBe(200);
    expect(links(res)).toEqual([
      '<https://sgomez.dev/about>; rel="canonical"',
      alt("es", "https://sgomez.dev/about"),
      alt("en", "https://sgomez.dev/en/about"),
      alt("x-default", "https://sgomez.dev/about"),
    ]);
  });

  it("/en/about.md", () => {
    const res = get("/en/about.md", "*/*");
    expect(res.status).toBe(200);
    expect(links(res)).toEqual([
      '<https://sgomez.dev/en/about>; rel="canonical"',
      alt("es", "https://sgomez.dev/about"),
      alt("en", "https://sgomez.dev/en/about"),
      alt("x-default", "https://sgomez.dev/about"),
    ]);
  });

  it("la home en markdown (es y en)", () => {
    expect(links(get("/", "text/markdown")).join()).toContain(alt("en", "https://sgomez.dev/en"));
    expect(links(get("/en", "text/markdown")).join()).toContain(alt("es", "https://sgomez.dev"));
  });

  it("un 404 en markdown no lleva hreflang", () => {
    const res = get("/no-existe.md", "*/*");
    expect(res.status).toBe(404);
    expect(res.headers.get("link")).not.toContain("hreflang");
  });
});

describe("D5: el 404 en markdown se cachea un minuto, el 200 sigue igual", () => {
  it("404", () => {
    expect(get("/no-existe.md", "*/*").headers.get("cache-control")).toBe("public, max-age=60, s-maxage=60");
  });
  it("200", () => {
    expect(get("/about.md", "*/*").headers.get("cache-control")).toBe("public, max-age=300, s-maxage=3600, stale-while-revalidate=86400");
  });
});
