import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import NotFoundBody from "@/app/components/NotFoundBody";
import type { Lang } from "@/i18n/languages";
import { llmsTxt } from "@/lib/machine/llms-txt";
import { llmsFullTxt } from "@/lib/machine/llms-full";
import { agentsMd } from "@/lib/machine/agents-md";
import { MARKDOWN_PATHS, markdownForPath, notFoundMarkdown } from "@/lib/markdown/documents";
import { staticPages } from "@/lib/content/pages";
import { machineHref } from "@/lib/routing/pages";

/** Enlaces de un texto (href de HTML o `(url)` de markdown) a la versión de raíz, en español, de un fichero. */
function rootMachineLinks(text: string): string[] {
  const found = text.match(/(?:href="|\()(?:https:\/\/sgomez\.dev)?\/(?:llms\.txt|llms-full\.txt|agents\.md)(?=["\)#?])/g);
  return found ?? [];
}

describe("B2: las superficies en inglés enlazan los ficheros de máquina en inglés", () => {
  const en: Lang = "en";

  it("machineHref(en) cuelga de /en y el resto de ficheros no cambia", () => {
    expect(machineHref("/llms.txt", en)).toBe("/en/llms.txt");
    expect(machineHref("/agents.md", en)).toBe("/en/agents.md");
    expect(machineHref("/llms.txt", "es")).toBe("/llms.txt");
    expect(machineHref("/openapi.json", en)).toBe("/openapi.json");
  });

  it("nav y pie en inglés enlazan /en/llms.txt y nunca /llms.txt", () => {
    const html = renderToStaticMarkup(
      <>
        <Nav lang={en} />
        <Footer lang={en} />
      </>,
    );
    expect(html).toContain('href="/en/llms.txt"');
    expect(rootMachineLinks(html)).toEqual([]);
  });

  it("nav y pie en español siguen enlazando /llms.txt", () => {
    const html = renderToStaticMarkup(<Footer lang="es" />);
    expect(html).toContain('href="/llms.txt"');
    expect(html).not.toContain("/en/llms.txt");
  });

  it("el 404 en inglés, en HTML y en markdown", () => {
    expect(rootMachineLinks(renderToStaticMarkup(<NotFoundBody lang={en} />))).toEqual([]);
    expect(rootMachineLinks(notFoundMarkdown("/x", en))).toEqual([]);
  });

  it("todo el markdown inglés y los ficheros de máquina ingleses", () => {
    for (const path of MARKDOWN_PATHS.filter((p) => p === "/en" || p.startsWith("/en/"))) {
      expect(rootMachineLinks(markdownForPath(path)!), path).toEqual([]);
    }
    for (const page of staticPages(en)) expect(rootMachineLinks(JSON.stringify(page)), page.path).toEqual([]);
    expect(rootMachineLinks(llmsTxt(en))).toEqual([]);
    expect(rootMachineLinks(llmsFullTxt(en))).toEqual([]);
    expect(rootMachineLinks(agentsMd(en))).toEqual([]);
  });

  it("el detector sí ve un enlace de raíz", () => {
    expect(rootMachineLinks('<a href="/llms.txt">x</a>')).toHaveLength(1);
    expect(rootMachineLinks("[a](https://sgomez.dev/agents.md)")).toHaveLength(1);
    expect(rootMachineLinks("[a](https://sgomez.dev/en/agents.md)")).toHaveLength(0);
  });

  it("los ejemplos de curl en inglés piden ?lang=en y el texto explica el idioma por defecto", () => {
    for (const text of [agentsMd(en), llmsTxt(en)]) {
      expect(text).toContain("?lang=en");
      expect(text).toContain("Accept-Language: en");
      expect(text).toMatch(/Spanish by default/);
    }
    const curls = agentsMd(en).split("\n").filter((l) => l.startsWith("curl -s") && l.includes("/api/v1/"));
    expect(curls.length).toBeGreaterThanOrEqual(3);
    for (const line of curls) expect(line, line).toContain("lang=en");
    const dev = staticPages(en).find((p) => p.slug === "developers")!;
    const code = JSON.stringify(dev);
    expect(code).toContain("/api/v1/profile?lang=en");
  });

  it("en español los ejemplos de curl no añaden lang", () => {
    for (const line of agentsMd("es").split("\n").filter((l) => l.startsWith("curl -s") && l.includes("/api/v1/"))) {
      expect(line).not.toContain("lang=");
    }
  });
});
