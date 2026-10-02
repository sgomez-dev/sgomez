import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Hero from "@/chapters/Hero";
import { PORTRAIT_SIZES } from "@/components/Portrait";
import About from "@/chapters/About";
import Build from "@/chapters/Build";
import Experience from "@/chapters/Experience";
import Projects from "@/chapters/Projects";
import OpenSource from "@/chapters/OpenSource";
import SkyQuetz from "@/chapters/SkyQuetz";
import Proof from "@/chapters/Proof";
import Contact from "@/chapters/Contact";
import LatestPosts, { blogApiDisabled } from "@/chapters/LatestPosts";
import { contactMailto } from "@/lib/contact/mailto";
import { getRecommendations } from "@/lib/api/data";
import { IDENTITY } from "@/app/seo";
import { getExperience, getProjects } from "@/lib/api/data";
import { CLAUDE_CANVAS } from "@/app/seo";
import { siteFigures } from "@/lib/content/figures";
import { getDictionary } from "@/i18n";
import { fill } from "@/i18n/fill";

const figuresMock = vi.hoisted(() => ({ override: null as null | { years: number | null; projects: number; certifications: number } }));
vi.mock("@/lib/content/figures", async (orig) => {
  const real = await orig<typeof import("@/lib/content/figures")>();
  return { ...real, siteFigures: (...a: Parameters<typeof real.siteFigures>) => figuresMock.override ?? real.siteFigures(...a) };
});

const count = (html: string) => (html.match(/data-motion="count"/g) ?? []).length;

describe("capítulos 01–03 en HTML de servidor", () => {
  for (const lang of ["es", "en"] as const) {
    const d = getDictionary(lang);
    const html = renderToStaticMarkup(<><Hero lang={lang} /><About lang={lang} /><Build lang={lang} /></>);
    it(`${lang}: nombre completo en el h1`, () => expect(html).toMatch(/<h1[^>]*>[\s\S]*Santiago Gómez de la Torre\.[\s\S]*<\/h1>/));
    it(`${lang}: hay frase de respuesta marcada`, () => expect(html).toMatch(/data-answer/));
    it(`${lang}: nada empieza invisible`, () => {
      expect(html).not.toMatch(/opacity:\s*0[;"]/);
      expect(html).not.toMatch(/visibility:\s*hidden/);
    });
    it(`${lang}: las cifras son las de los datos`, () => {
      const f = siteFigures();
      expect(html).toContain(`data-value="${f.projects}"`);
      expect(html).toContain(`data-value="${f.certifications}"`);
    });
    it(`${lang}: las etiquetas de las cifras están localizadas`, () => {
      for (const tpl of [d.figures.years, d.figures.projects, d.figures.certs]) {
        expect(html).toContain(fill(tpl, { n: "" }).trim());
      }
    });
    it(`${lang}: seis capas en Build`, () => expect(html.match(/data-motion="layer"/g)).toHaveLength(6));
    it(`${lang}: las capas salen en el orden del brief`, () => {
      const L = d.chapters.build.layers;
      const order = [L.interface, L.api, L.model, L.data, L.evaluation, L.infrastructure];
      const build = html.slice(html.indexOf('id="build"'));
      const pos = order.map((l) => build.indexOf(`</span>${l}</span>`));
      expect(pos.every((p) => p > 0)).toBe(true);
      expect([...pos].sort((a, b) => a - b)).toEqual(pos);
    });
    it(`${lang}: cada capa tiene al menos una tecnología`, () => {
      const layers = html.split('data-motion="layer"').slice(1);
      expect(layers).toHaveLength(6);
      for (const layer of layers) expect(layer.match(/<li class="rounded-full/g)?.length ?? 0).toBeGreaterThan(0);
    });
    it(`${lang}: el retrato es prioritario, con sizes y alt localizado`, () => {
      const img = html.match(/<img[^>]*>/)![0];
      expect(img).toContain('data-priority="true"');
      expect(img).toContain(`sizes="${PORTRAIT_SIZES}"`);
      // En píxeles y no en vw: la precarga y la imagen no deben poder elegir candidatos distintos.
      expect(PORTRAIT_SIZES).not.toMatch(/vw/);
      expect(img).toContain(`alt="${d.chapters.hero.portraitAlt}"`);
    });
    it(`${lang}: el cristal es decorativo`, () => expect(html).toMatch(/data-motion="glass"[^>]*aria-hidden="true"|aria-hidden="true"[^>]*data-motion="glass"/));
    it(`${lang}: tres cifras con años y dos sin ellos`, () => {
      expect(count(renderToStaticMarkup(<About lang={lang} />))).toBe(3);
      figuresMock.override = { years: null, projects: 7, certifications: 9 };
      try {
        expect(count(renderToStaticMarkup(<About lang={lang} />))).toBe(2);
      } finally {
        figuresMock.override = null;
      }
    });
  }
  it("el retrato localizado difiere entre idiomas", () => {
    expect(getDictionary("es").chapters.hero.portraitAlt).not.toBe(getDictionary("en").chapters.hero.portraitAlt);
  });
});

/** renderToStaticMarkup escapa el texto; se compara contra lo que de verdad sale. */
const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");

describe("capítulos 04–07", () => {
  for (const lang of ["es", "en"] as const) {
    const d = getDictionary(lang);
    const html = renderToStaticMarkup(
      <>
        <Experience lang={lang} />
        <Projects lang={lang} />
        <OpenSource lang={lang} />
        <SkyQuetz lang={lang} />
      </>,
    );
    it(`${lang}: todas las experiencias y todos los proyectos`, () => {
      for (const e of getExperience(lang)) expect(html).toContain(esc(e.role));
      for (const p of getProjects(lang)) expect(html).toContain(esc(p.title));
    });
    it(`${lang}: anclas estables`, () => {
      for (const id of ["experience", "work", "open-source", "skyquetz"]) expect(html).toContain(`id="${id}"`);
    });
    it(`${lang}: Claude Canvas conserva su atribución`, () => {
      expect(html).toMatch(/David Siegel/);
      expect(html).toContain(esc(lang === "en" ? CLAUDE_CANVAS.attribution : CLAUDE_CANVAS.attributionEs));
    });
    it(`${lang}: enlace a skills.sgomez.dev`, () => expect(html).toContain('href="https://skills.sgomez.dev"'));
    it(`${lang}: ningún hueco de reel vacío`, () => {
      const reels = [...html.matchAll(/data-motion="reel"[^>]*>([\s\S]*?)<\/div>/g)];
      expect(reels).toHaveLength(3);
      for (const m of reels) expect(m[1]!.replace(/<[^>]+>/g, "").trim()).not.toBe("");
    });
    it(`${lang}: pista de experiencia y enlaces de proyecto accesibles`, () => {
      expect(html).toContain('data-motion="timeline"');
      for (const p of getProjects(lang)) {
        // Sin aria-label (WCAG 2.5.3): la acción es texto solo para lectores dentro del enlace.
        expect(html).toContain(`${esc(p.title)}<span class="sr-only">. ${d.projects.open}</span>`);
      }
      expect(html).toContain('rel="noopener"');
    });
    it(`${lang}: SkyQuetz con logo, monograma y dos productos`, () => {
      const sq = html.slice(html.indexOf('id="skyquetz"'));
      expect(sq).toContain("/brand/skyquetz-logo.webp");
      expect(sq).toContain('data-motion="monogram"');
      expect(sq).toContain("Synentria");
      expect(sq).toContain("Packatrack");
    });
    it(`${lang}: Open source con tres bloques build`, () => {
      expect(html.match(/data-motion="build"/g)).toHaveLength(3);
    });
  }
  it("el eslogan de SkyQuetz es la frase de marca en español, también en inglés", () => {
    const html = renderToStaticMarkup(<SkyQuetz lang="en" />);
    expect(html).toMatch(/<p[^>]*lang="es"[^>]*>Estándar internacional, trato cercano\.<\/p>/);
    expect(html).not.toContain("International standard");
  });
});

describe("capítulos 08–09 en HTML de servidor", () => {
  const CV = "/CV_Santiago_Gómez_de_la_Torre_Romero.pdf";
  for (const lang of ["es", "en"] as const) {
    const d = getDictionary(lang);
    const proof = renderToStaticMarkup(<Proof lang={lang} />);
    const contact = renderToStaticMarkup(<Contact lang={lang} />);
    it(`${lang}: anclas #proof y #contact`, () => {
      expect(proof).toContain('id="proof"');
      expect(contact).toContain('id="contact"');
    });
    it(`${lang}: la cita visible y el original`, () => {
      const r = getRecommendations(lang)[0]!;
      if (lang === "en") {
        const label = proof.indexOf(d.recommendations.translated);
        const tr = proof.indexOf(esc(r.comment_translation!.split("\n\n")[0]!));
        expect(label).toBeGreaterThan(0);
        expect(tr).toBeGreaterThan(label);
        // D6: la etiqueta es texto del sitio, visible y fuera del blockquote, justo encima de él.
        const firstQuote = proof.match(/<blockquote[\s\S]*?<\/blockquote>/)![0];
        expect(firstQuote).not.toContain(d.recommendations.translated);
        expect(proof.indexOf("<blockquote")).toBeGreaterThan(label);
        const labelTag = proof.slice(proof.lastIndexOf("<p", label), label);
        expect(labelTag).not.toMatch(/aria-hidden/);
        expect(proof).toMatch(/<p[^>]*lang="en"[^>]*>/);
        const details = proof.match(/<details[\s\S]*?<\/details>/)![0];
        expect(details).toMatch(/<summary(?![^>]*lang=)[^>]*>/);
        expect(details).toContain(d.recommendations.readOriginal);
        expect(details).toMatch(/<div[^>]*lang="es"[^>]*>[\s\S]*<\/div>/);
        expect(details).toContain(esc(r.comment.split("\n\n")[0]!));
        expect(details).not.toContain(esc(r.comment_translation!.split("\n\n")[0]!));
        expect(details).not.toMatch(/<details[^>]*open/);
        // la traducción nunca queda dentro de un elemento lang="es"
        const outside = proof.replace(/<details[\s\S]*?<\/details>/g, "");
        expect(outside).not.toMatch(/lang="es"/);
        expect(outside).toContain(esc(r.comment_translation!.split("\n\n")[0]!));
      } else {
        expect(proof).toMatch(/<p[^>]*lang="es"[^>]*>/);
        expect(proof).not.toContain("<details");
        expect(proof).not.toContain(getDictionary("en").recommendations.translated);
      }
    });
    it(`${lang}: la cita es un <figure> normal y no uno con display: contents`, () => {
      expect(proof).not.toMatch(/<figure[^>]*class="[^"]*contents/);
      expect(proof).toMatch(/<figure[^>]*>[\s\S]*<figcaption[\s\S]*<blockquote/);
    });
    it(`${lang}: insignias de certificación`, () => {
      expect(proof.match(/data-motion="badge"/g)!.length).toBeGreaterThan(5);
    });
    it(`${lang}: tres enlaces de intención con el mailto exacto`, () => {
      for (const intent of ["freelance", "job", "other"] as const) {
        expect(contact).toContain(`href="${esc(contactMailto(intent, lang))}"`);
      }
    });
    it(`${lang}: CV, correo en texto y sin Facebook`, () => {
      expect(contact).toContain(`href="${CV}"`);
      expect(contact).toContain(IDENTITY.email);
      expect(contact).not.toMatch(/facebook|fb\.com/i);
      expect(contact).toContain("linkedin.com/in/sgomez-dev");
    });
    it(`${lang}: hueco de cristal decorativo`, () => {
      expect(contact).toMatch(/<svg[^>]*aria-hidden="true"[^>]*data-motion="glass"/);
    });
  }
});

describe("últimas entradas del blog", () => {
  const COVER = "https://veelwadirgvhyvquvfnn.supabase.co/storage/v1/object/public/blog/posts/2026-09/a.png";
  const post = (slug: string, coverImage: string | null) => ({ slug, title: `T ${slug}`, excerpt: "", coverImage, coverAlt: null, category: "PROYECTO", readingTime: 3, publishedAt: "2026-09-11T00:00:00Z" });
  const render = async (lang: "es" | "en") => renderToStaticMarkup(await LatestPosts({ lang }));
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });
  it("BLOG_API_DISABLED=1: no llama al blog y no renderiza nada; sin la variable sí llama", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ items: [post("a", null)] }) });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("BLOG_API_DISABLED", "1");
    expect(blogApiDisabled()).toBe(true);
    expect(await LatestPosts({ lang: "es" })).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
    expect(blogApiDisabled()).toBe(false);
    expect(await LatestPosts({ lang: "es" })).not.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("respuesta no ok: nada", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    expect(await LatestPosts({ lang: "es" })).toBeNull();
  });
  it("fetch que lanza: nada", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    expect(await LatestPosts({ lang: "en" })).toBeNull();
  });
  it("sin entradas: nada", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ items: [] }) }));
    expect(await LatestPosts({ lang: "es" })).toBeNull();
  });
  it("una portada de un host no autorizado no se pinta (ni el navegador la pediría a un tercero)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ items: [post("a", "https://x.test/a.webp"), post("c", "http://veelwadirgvhyvquvfnn.supabase.co/a.png"), post("d", "no es una url")] }) }));
    const html = await render("es");
    expect(html).not.toContain("<img");
    expect(html).not.toContain("x.test");
    expect(html).toContain("T a");
  });
  it("next.config autoriza el host de las portadas y solo ese", async () => {
    const { default: config } = await import("../next.config");
    expect(config.images?.remotePatterns).toEqual([
      { protocol: "https", hostname: "veelwadirgvhyvquvfnn.supabase.co", pathname: "/storage/v1/object/public/blog/**" },
    ]);
  });
  it("con y sin portada: imagen solo cuando la hay", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ items: [post("a", COVER), post("b", null)] }) }));
    const html = await render("en");
    expect(html.match(/<img/g)).toHaveLength(1);
    expect(html).toContain(`src="${COVER}"`);
    expect(html).toContain('sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"');
    expect(html).toContain('loading="lazy"');
    expect(html).toMatch(/<img[^>]*alt=""/);
    expect(html).not.toContain("aspect-video overflow-hidden bg-[color:var(--bg-3)]\"></div>");
    expect(html).toContain("T b");
  });
});

describe("Proof: disclosure del original", () => {
  it("en: el summary lleva un chevron svg aria-hidden", () => {
    const html = renderToStaticMarkup(<Proof lang="en" />);
    expect(html).toMatch(/<summary[^>]*>[^<]*<svg[^>]*aria-hidden="true"/);
  });
});

describe("Tasks 5 y 6: contratos de marcado del movimiento", () => {
  for (const lang of ["es", "en"] as const) {
    it(`${lang}: la experiencia lleva su escena fijable con el número de tarjetas`, () => {
      const html = renderToStaticMarkup(<Experience lang={lang} />);
      const n = getExperience(lang).length;
      expect(html).toMatch(new RegExp(`<section[^>]*data-pin=""[^>]*style="--n:${n}"`));
      expect(html).toMatch(/data-pin-stage=""/);
      expect(html).toMatch(/data-pin-progress=""[^>]*aria-hidden="true"/);
      expect(html).toMatch(/data-motion="timeline"[^>]*tabindex="0"/i);
    });
  }
});
