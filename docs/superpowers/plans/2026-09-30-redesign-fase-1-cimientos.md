# sgomez.dev v3 — Fase 1: cimientos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar la web nueva en estático: bilingüe (español sin prefijo, inglés en `/en`), con la identidad visual B (Inter Tight + Instrument Serif), los 9 capítulos en su estado final sin animación avanzada, `/lab` eliminado y las superficies para agentes intactas y en dos idiomas.

**Architecture:** Toda página vive bajo `app/[lang]/`, que es el root layout y fija `<html lang>`. `src/proxy.ts` reescribe las rutas sin prefijo a `es`, redirige `/es/*` y `/lab*`, y sigue haciendo la negociación de markdown. El contenido es un único módulo de datos con textos `{ es, en }` que consumen las páginas, la API, el markdown, `llms.txt` y el JSON-LD. El movimiento avanzado (Motion, R3F, Remotion) NO entra en esta fase: cada capítulo se construye ya con la estructura y los `data-*` que la fase 2 animará.

**Tech Stack:** Next.js 16.2 (App Router, `proxy.ts`), React 19.2, TypeScript strict, Tailwind CSS 4, `next/font/google` (Inter Tight, Instrument Serif), Vitest 3, Playwright + `@axe-core/playwright`, `@lhci/cli`. Despliegue en Vercel.

**Spec:** `docs/superpowers/specs/2026-09-30-sgomez-redesign-design.md` (esta fase = §10.1; con §2, §3, §5, §6, §7 y §8 aplicados en lo que corresponde a estático).

**Directorio de trabajo:** la app está en `sgomez/` dentro del repo (`C:\Users\santiago.gomez\Desktop\Repos\sgomez\sgomez`). Todos los comandos `npm` se ejecutan ahí. La rama es `feat/redesign-v3`.

## Global Constraints

- El nombre se escribe siempre entero: **Santiago Gómez de la Torre Romero** (formal) o **Santiago Gómez de la Torre** (corto). Nunca «Santiago Gómez» a secas, porque parte el apellido compuesto.
- Commits con autor Santiago (el `git config` del repo) y **sin** `Co-Authored-By` ni ningún otro trailer. Solo en local; sin push.
- Nada de APIs de pago ni servicios externos nuevos. Solo se usan las fuentes que ya existen (email, perfiles, blog.sgomez.dev).
- URLs españolas actuales intactas: `/`, `/about`, `/contact`, `/developers`, `/privacy`, `/api/v1/*`, `/openapi.json`, `/api/openapi.{json,yaml}`, `/llms.txt`, `/agents.md`, `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest` y las variantes `*.md` responden como hoy.
- Inglés en `/en`, `/en/about`, `/en/contact`, `/en/developers` y `/en/privacy`. `/es` y `/es/*` redirigen con 308 a la versión sin prefijo. `/lab` y `/lab/*` redirigen con 301 a `/`, y `/en/lab*` a `/en`.
- La API sin `lang` responde exactamente igual que hoy, en español. `?lang=en` o `Accept-Language: en…` la sirven en inglés.
- Contraste WCAG AA: 4,5:1 en cuerpo y 3:1 en display ≥ 24 px. Tokens de texto: `--text` `#F4F6FB`, `--text-2` `#AAB2C6`, `--serif-ink` `#C9D1E6`. Fondos: `--bg` `#05060A`, `--bg-2` `#0B0D14`, `--bg-3` `#121624`. Luz: `--light-1` `#8FA8FF`, `--light-2` `#6EF0DC`.
- Los brillos y el cristal nunca van detrás de un bloque de texto. Los titulares no usan degradado.
- Todo el texto está en el HTML del servidor y visible sin JavaScript. Esta fase no añade nada que empiece en `opacity: 0`.
- Cada `<Link>` lleva `prefetch={false}`, igual que en claude-skills (evita ráfagas de prefetch). Un test lo comprueba.
- No se pasan funciones a componentes `'use client'`. Las cadenas con variables se escriben como plantilla con `{name}` y se rellenan con `fill()`.
- JSON-LD siempre con `serializeJsonLd()`, que escapa `<`, `>`, `&`, U+2028 y U+2029 como `\\u003c` y compañía, nunca `JSON.stringify` a pelo en un `<script>`.
- Presupuesto de JS inicial ≤ 170 KB gzip en `/` y `/en`.

## Review Focus

1. **Rutas españolas de hoy.** Cada URL de la lista de Global Constraints debe dar el mismo estado y el mismo tipo de contenido que en producción. Se fija en la Task 4 con un test de `routeRequest()` y en la Task 11 con un e2e que recorre la lista.
2. **Navegación de cliente entre páginas españolas reescritas.** Las peticiones RSC a `/about` no pueden romperse por la reescritura a `/es/about`. Se fija en la Task 11 con un e2e que pulsa un enlace de la nav, comprueba el `<h1>` destino y que no haya errores en consola.
3. **`Accept: text/markdown` en `/en/about`.** Debe devolver el markdown en inglés con `Link: <https://sgomez.dev/en/about>; rel="canonical"`. Se fija en la Task 4 con un test de `decide()` y de `markdownForPath()`.
4. **Cambio de idioma desde una página sin equivalente**, como un 404. Debe llevar a la home de ese idioma, nunca a otro 404. Se fija en la Task 5 con un test de `switchLangHref()`.
5. **Recomendaciones en la versión inglesa.** La cita original en español se conserva con `lang="es"` y la traducción va etiquetada como traducida, nunca atribuida al autor como si la hubiera escrito en inglés. Se fija en la Task 8 con un test de `recommendationView()` y en la Task 11 con un e2e.

---

## Mapa de ficheros

| Fichero | Responsabilidad |
|---|---|
| `src/i18n/languages.ts` | `LANGS`, `Lang`, `DEFAULT_LANG`, `isLang`, `localizedPath`, `splitLang`, `hreflangAlternates`, `switchLangHref` |
| `src/i18n/fill.ts` | `fill(template, vars)` |
| `src/i18n/dictionaries/{es,en}.ts`, `src/i18n/index.ts` | cadenas de interfaz, tipo `Dictionary`, `getDictionary(lang)` |
| `src/app/content/index.tsx` | contenido con textos `Localized` (`{ es, en }`) |
| `src/lib/content/localized.ts` | `Localized`, `t(value, lang)` |
| `src/lib/content/figures.ts` | `siteFigures()`: cifras derivadas de los datos |
| `src/lib/api/data.ts` | getters con `lang` (por defecto `'es'`) |
| `src/lib/api/http.ts` | + `resolveLang(request)` |
| `src/lib/content/pages.ts` | `staticPages(lang)`, `findStaticPage(path, lang)` |
| `src/lib/markdown/documents.ts` | markdown por ruta localizada |
| `src/lib/routing/request.ts` | `routeRequest(pathname)`: reescritura/redirección pura, probada |
| `src/proxy.ts` | encadena `routeRequest` y la negociación |
| `src/lib/routing/pages.ts` | `PAGES` (rutas lógicas), `CONTENT_UPDATED`, `localizedHtmlRoutes()` (fuera de `site.ts` para no crear un ciclo con `@/i18n`) |
| `src/app/[lang]/layout.tsx` | root layout con `lang`, fuentes, nav y footer |
| `src/app/[lang]/page.tsx` y `about|contact|developers|privacy/page.tsx` | páginas |
| `src/app/[lang]/[...missing]/page.tsx`, `src/app/[lang]/not-found.tsx` | 404 localizado |
| `src/app/[lang]/llms.txt/route.ts`, `src/app/[lang]/agents.md/route.ts` | versiones inglesas (solo `en`) |
| `src/app/styles/tokens.css`, `src/app/globals.css` | tokens y base |
| `src/lib/design/contrast.ts` | `contrastRatio(a, b)` para el test de tokens |
| `src/components/ui/*` | `Container`, `Eyebrow`, `Display`, `ButtonLink`, `Section` |
| `src/components/Nav.tsx`, `src/components/Footer.tsx` | navegación fija arriba y pie |
| `src/chapters/*.tsx` | un componente por capítulo del guion |
| `src/lib/contact/mailto.ts` | `contactMailto(intent, lang)` |
| `src/lib/seo/jsonld.ts` | `serializeJsonLd`, `pageGraph(page, lang)` |
| `src/lib/seo/metadata.ts` | `buildMetadata(...)` con hreflang |
| `public/robots.txt` | Content-Signal, sin `Host`, bots nuevos |
| `playwright.config.ts`, `e2e/*.spec.ts`, `lighthouserc.json` | e2e y presupuestos |
| `../.github/workflows/ci.yml` | CI en PR (ruta desde la raíz del repo: `.github/workflows/ci.yml`) |

Se eliminan: `src/app/lab/**`, `public/lab/**`, `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/about|contact|developers|privacy/page.tsx`, `src/app/not-found.tsx` (pasan bajo `[lang]`), y los componentes `MacBook`, `MacInterlude`, `BottomBar`, `PlaygroundButton`, `HeroSection`, `AboutSection`, `ExperienceSection`, `SkyQuetzSection`, `TechnologiesSection`, `ProjectsSection`, `OpenSourceSection`, `CertificationsSection`, `RecommendationsSection`, `EducationSection` y `ContactSection` (los sustituyen los capítulos). `LatestPosts` y `DownloadCVButton` se reescriben dentro de `chapters/`.

---

### Task 1: Núcleo de idiomas

**Files:**
- Create: `src/i18n/languages.ts`, `src/i18n/fill.ts`, `src/i18n/dictionaries/es.ts`, `src/i18n/dictionaries/en.ts`, `src/i18n/index.ts`
- Test: `tests/i18n.test.ts`

**Interfaces:**
- Produces:
  - `LANGS: readonly ['es','en']`, `type Lang = 'es'|'en'`, `DEFAULT_LANG: 'es'`, `isLang(x: unknown): x is Lang`
  - `localizedPath(lang: Lang, path: string): string`: `('es','/about')→'/about'`, `('en','/')→'/en'`, `('en','/about')→'/en/about'`
  - `splitLang(pathname: string): { lang: Lang; path: string }`: `'/en/about'→{en,'/about'}`, `'/en'→{en,'/'}`, `'/about'→{es,'/about'}`
  - `hreflangAlternates(path: string): Record<'es'|'en'|'x-default', string>` (URLs absolutas; x-default = es)
  - `switchLangHref(pathname: string, to: Lang, knownPaths: readonly string[]): string`
  - `fill(template: string, vars: Record<string, string|number>): string`
  - `type Dictionary`, `getDictionary(lang: Lang): Dictionary`

- [ ] **Step 1: Write the failing test**

```ts
// tests/i18n.test.ts
import { describe, expect, it } from "vitest";
import { LANGS, isLang, localizedPath, splitLang, hreflangAlternates, switchLangHref } from "@/i18n/languages";
import { fill } from "@/i18n/fill";
import { getDictionary } from "@/i18n";
import es from "@/i18n/dictionaries/es";
import en from "@/i18n/dictionaries/en";

describe("languages", () => {
  it("español sin prefijo, inglés bajo /en", () => {
    expect(localizedPath("es", "/")).toBe("/");
    expect(localizedPath("es", "/about")).toBe("/about");
    expect(localizedPath("en", "/")).toBe("/en");
    expect(localizedPath("en", "/about")).toBe("/en/about");
  });
  it("splitLang es el inverso de localizedPath", () => {
    for (const lang of LANGS) for (const path of ["/", "/about", "/work/nudaui"]) {
      expect(splitLang(localizedPath(lang, path))).toEqual({ lang, path });
    }
    expect(splitLang("/english")).toEqual({ lang: "es", path: "/english" });
  });
  it("isLang solo acepta los idiomas publicados", () => {
    expect(isLang("en")).toBe(true);
    expect(isLang("fr")).toBe(false);
    expect(isLang(undefined)).toBe(false);
  });
  it("hreflang recíproco con x-default en español", () => {
    expect(hreflangAlternates("/about")).toEqual({
      es: "https://sgomez.dev/about",
      en: "https://sgomez.dev/en/about",
      "x-default": "https://sgomez.dev/about",
    });
  });
  it("cambiar de idioma sin equivalente lleva a la home de ese idioma", () => {
    const known = ["/", "/about"];
    expect(switchLangHref("/about", "en", known)).toBe("/en/about");
    expect(switchLangHref("/en/about", "es", known)).toBe("/about");
    expect(switchLangHref("/no-existe", "en", known)).toBe("/en");
    expect(switchLangHref("/en/no-existe", "es", known)).toBe("/");
  });
});

describe("fill", () => {
  it("rellena y deja visibles las variables que faltan", () => {
    expect(fill("{n} proyectos", { n: 13 })).toBe("13 proyectos");
    expect(fill("{a} y {b}", { a: "x" })).toBe("x y {b}");
  });
});

describe("diccionarios", () => {
  it("en tiene exactamente las mismas claves que es", () => {
    const keys = (o: object, p = ""): string[] =>
      Object.entries(o).flatMap(([k, v]) => (v && typeof v === "object" && !Array.isArray(v) ? keys(v, `${p}${k}.`) : [`${p}${k}`]));
    expect(keys(en).sort()).toEqual(keys(es).sort());
  });
  it("ninguna cadena vacía", () => {
    const values = (o: object): unknown[] => Object.values(o).flatMap((v) => (v && typeof v === "object" ? values(v) : [v]));
    for (const d of [es, en]) for (const v of values(d)) expect(String(v).trim()).not.toBe("");
  });
  it("getDictionary devuelve el de cada idioma", () => {
    expect(getDictionary("en")).toBe(en);
    expect(getDictionary("es")).toBe(es);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/i18n.test.ts`
Expected: FAIL, `Cannot find module '@/i18n/languages'`.

- [ ] **Step 3: Implement**

```ts
// src/i18n/languages.ts
import { SITE_URL } from "@/lib/site";

export const LANGS = ["es", "en"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "es";

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as readonly string[]).includes(value);
}

/** Español sin prefijo (las URLs de siempre); el resto de idiomas bajo /{lang}. */
export function localizedPath(lang: Lang, path: string): string {
  const clean = path === "" ? "/" : path;
  if (lang === DEFAULT_LANG) return clean;
  return clean === "/" ? `/${lang}` : `/${lang}${clean}`;
}

export function splitLang(pathname: string): { lang: Lang; path: string } {
  const match = /^\/([a-z]{2})(\/.*)?$/.exec(pathname);
  if (match && isLang(match[1]) && match[1] !== DEFAULT_LANG) {
    return { lang: match[1], path: match[2] ?? "/" };
  }
  return { lang: DEFAULT_LANG, path: pathname };
}

/** URL absoluta; la home española es exactamente SITE_URL, sin barra final (= IDENTITY.url). */
function absoluteLocalized(lang: Lang, path: string): string {
  const p = localizedPath(lang, path);
  return p === "/" ? SITE_URL : `${SITE_URL}${p}`;
}

export function hreflangAlternates(path: string): Record<Lang | "x-default", string> {
  return { es: absoluteLocalized("es", path), en: absoluteLocalized("en", path), "x-default": absoluteLocalized("es", path) };
}

/** Enlace del selector de idioma: la misma página en `to`, o su home si no existe. */
export function switchLangHref(pathname: string, to: Lang, knownPaths: readonly string[]): string {
  const { path } = splitLang(pathname);
  return localizedPath(to, knownPaths.includes(path) ? path : "/");
}
```

`languages.ts` imports only `SITE_URL` from `@/lib/site`. `site.ts` must **never** import from `@/i18n`, to keep the dependency one-way. The localized route catalogue lives in `src/lib/routing/pages.ts` (Task 4) for that reason.

```ts
// src/i18n/fill.ts
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (all, key: string) => (key in vars ? String(vars[key]) : all));
}
```

`src/i18n/dictionaries/es.ts` exports `const es = { … } as const; export default es;` and `en.ts` exports `const en: Dictionary = { … }`. `Dictionary` is defined in `src/i18n/index.ts` as a deep-string version of `typeof es`:

```ts
// src/i18n/index.ts
import es from "./dictionaries/es";
import en from "./dictionaries/en";
import type { Lang } from "./languages";

type DeepString<T> = { [K in keyof T]: T[K] extends string ? string : DeepString<T[K]> };
export type Dictionary = DeepString<typeof es>;

const DICTIONARIES: Record<Lang, Dictionary> = { es, en };
export function getDictionary(lang: Lang): Dictionary {
  return DICTIONARIES[lang];
}
```

The dictionaries hold ONLY interface strings (not content):
- nav labels: `nav.work`, `nav.about`, `nav.openSource`, `nav.contact`, `nav.skills` («Skills», which links to skills.sgomez.dev), `nav.blog`, `nav.switchTo` («English» / «Español»), `nav.skip` («Saltar al contenido» / «Skip to content»);
- chapter eyebrows and headings for the 9 chapters (`chapters.hero.eyebrow`, `chapters.about.heading`, …);
- CTA labels: `cta.talk`, `cta.work`, `cta.cv`;
- contact intents: `contact.intent.freelance|job|other.{label,subject,body}`;
- figure templates: `figures.years` («{n} años construyendo software» / «{n} years building software»), `figures.projects`, `figures.certs`;
- `recommendations.translated` («Traducido del español» for en; «Original en español» for es);
- footer strings and 404 strings.

Write them in natural Spain Spanish (with «tú») and native English. Keep every key that a later task references in this list.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/i18n.test.ts`
Expected: PASS (all).

- [ ] **Step 5: Commit**

```bash
git add src/i18n tests/i18n.test.ts
git commit -m "feat(i18n): idiomas, rutas localizadas y diccionarios es/en"
```

---

### Task 2: Contenido bilingüe y API con idioma (núcleo)

**Files:**
- Create: `src/lib/content/localized.ts`, `src/lib/content/figures.ts`
- Modify: `src/app/content/index.tsx` (all visible text → `Localized`), `src/app/seo.ts` (`IDENTITY.description` → `{ es, en }` via a new `IDENTITY_TEXT`), `src/lib/api/data.ts` (getters take `lang`), `src/lib/api/http.ts` (+`resolveLang`), and every `src/app/api/v1/**/route.ts` (pass `resolveLang(request)`)
- Test: `tests/content-i18n.test.ts`; the existing `tests/api.test.ts` must pass **unchanged**

**Interfaces:**
- Consumes: `Lang`, `LANGS` (Task 1)
- Produces:
  - `type Localized = { es: string; en: string }`, `t(value: Localized | string, lang: Lang): string`
  - every getter in `data.ts` keeps its name and gains an optional last parameter `lang: Lang = 'es'`: `getProfile(lang)`, `getProjects(lang)`, `getProject(slug, lang)`, `getExperience(lang)`, `getSkills(lang)`, `getCertifications(lang)`, `getEducation(lang)`, `getRecommendations(lang)`, `getAbout(lang)` and `search(query, limit, lang)`. Slugs stay derived from the **Spanish** text, so they are identical in both languages.
  - `Recommendation` gains `original_language: 'es'` and `comment_translation?: string`. In `lang='en'`, `comment` is the original text and `comment_translation` is the English one, so a quote is never attributed in a language its author did not write.
  - `resolveLang(request: Request): Lang`: `?lang=` wins, then an `Accept-Language` starting with `en`, then `'es'`.
  - `siteFigures(): { years: number | null; projects: number; certifications: number }`

- [ ] **Step 1: Write the failing test**

```ts
// tests/content-i18n.test.ts
import { describe, expect, it } from "vitest";
import * as content from "@/app/content";
import { getProjects, getRecommendations, getProfile, getProject } from "@/lib/api/data";
import { resolveLang } from "@/lib/api/http";
import { siteFigures } from "@/lib/content/figures";

function localizedLeaves(value: unknown, path = "content"): { path: string; es: string; en: string }[] {
  if (value && typeof value === "object" && !Array.isArray(value) && "es" in value && "en" in value) {
    const v = value as { es: string; en: string };
    return [{ path, es: v.es, en: v.en }];
  }
  if (Array.isArray(value)) return value.flatMap((v, i) => localizedLeaves(v, `${path}[${i}]`));
  if (value && typeof value === "object") return Object.entries(value).flatMap(([k, v]) => localizedLeaves(v, `${path}.${k}`));
  return [];
}

describe("contenido bilingüe", () => {
  const leaves = localizedLeaves(content);
  it("hay textos localizados", () => expect(leaves.length).toBeGreaterThan(40));
  it("ningún texto le falta el inglés o el español", () => {
    for (const l of leaves) {
      expect(l.es.trim(), l.path).not.toBe("");
      expect(l.en.trim(), l.path).not.toBe("");
    }
  });
  it("el inglés no es una copia del español en textos largos", () => {
    for (const l of leaves) if (l.es.length > 40) expect(l.en, l.path).not.toBe(l.es);
  });
});

describe("API por idioma", () => {
  it("sin idioma responde en español, como hasta ahora", () => {
    expect(getProfile().availability.statement).toBe(getProfile("es").availability.statement);
  });
  it("los slugs son los mismos en los dos idiomas", () => {
    expect(getProjects("en").map((p) => p.slug)).toEqual(getProjects("es").map((p) => p.slug));
    const first = getProjects("es")[0]!;
    expect(getProject(first.slug, "en")?.slug).toBe(first.slug);
  });
  it("en inglés la cita original se conserva y la traducción va aparte", () => {
    const es = getRecommendations("es");
    const en = getRecommendations("en");
    expect(en.map((r) => r.comment)).toEqual(es.map((r) => r.comment));
    for (const r of en) {
      expect(r.original_language).toBe("es");
      expect(r.comment_translation?.length).toBeGreaterThan(40);
    }
    for (const r of es) expect(r.comment_translation).toBeUndefined();
  });
  it("resolveLang: ?lang gana, luego Accept-Language, luego español", () => {
    expect(resolveLang(new Request("https://x/api?lang=en"))).toBe("en");
    expect(resolveLang(new Request("https://x/api?lang=fr"))).toBe("es");
    expect(resolveLang(new Request("https://x/api", { headers: { "accept-language": "en-GB,en;q=0.9" } }))).toBe("en");
    expect(resolveLang(new Request("https://x/api", { headers: { "accept-language": "es-ES" } }))).toBe("es");
    expect(resolveLang(new Request("https://x/api?lang=es", { headers: { "accept-language": "en" } }))).toBe("es");
  });
});

describe("cifras derivadas", () => {
  it("salen de los datos", () => {
    const f = siteFigures();
    expect(f.projects).toBe(content.projects.length);
    expect(f.certifications).toBe(content.certifications.length);
    const years = content.experience.flatMap((e) => (t(e.period).match(/\b(19|20)\d{2}\b/g) ?? []).map(Number));
    expect(f.years).toBe(new Date().getFullYear() - Math.min(...years));
  });
});

function t(v: unknown): string {
  return typeof v === "string" ? v : (v as { es: string }).es;
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/content-i18n.test.ts`
Expected: FAIL (`siteFigures` missing, no localized leaves).

- [ ] **Step 3: Implement**

```ts
// src/lib/content/localized.ts
import type { Lang } from "@/i18n/languages";
export type Localized = { es: string; en: string };
export function t(value: Localized | string, lang: Lang): string {
  return typeof value === "string" ? value : value[lang];
}
```

In `src/app/content/index.tsx`, convert to `Localized` every human-readable string: `hero.title`, `hero.subtitle`, `about.description`, each `timeline[].title/desc`, `skyquetz.role/slogan/desc/myPart`, `stats[].label`, `products[].tagline/desc`, `projects[].desc`, `education[].desc`, `experience[].role/desc/period`, `certifications[].date` and `technologies[].category`. Leave as plain strings: proper nouns and identifiers (`name`, `title` of projects and certifications, `institution`, URLs, stack). Recommendations keep `comment` in Spanish and gain `commentEn`. The English text is a faithful, native rendering of the Spanish: no new claims or numbers. Where `seo.ts` already has an English version (`SKYQUETZ.descriptionEn`, `CLAUDE_CANVAS.descriptionEn`), reuse its wording.

In `data.ts`, thread `lang` through every getter with `t(value, lang)`. Keep `slugify()` inputs on the Spanish text (e.g. `slugify(t(entry.role, 'es') + '-' + organization)`), so slugs don't change. `getRecommendations(lang)`:

```ts
export function getRecommendations(lang: Lang = "es"): Recommendation[] {
  return recommendations.map((entry) => ({
    slug: slugify(entry.name),
    name: entry.name,
    date: entry.date,
    comment: Array.isArray(entry.comment) ? entry.comment.join("\n\n") : entry.comment,
    original_language: "es" as const,
    ...(lang === "en" ? { comment_translation: entry.commentEn } : {}),
    recommender_url: entry.recommenderUrl,
  }));
}
```

`resolveLang` in `http.ts`:

```ts
export function resolveLang(request: Request): Lang {
  const param = new URL(request.url).searchParams.get("lang");
  if (param !== null) return isLang(param) ? param : "es";
  const accept = request.headers.get("accept-language") ?? "";
  return /^\s*en\b/i.test(accept) ? "en" : "es";
}
```

Each API route passes `resolveLang(request)` to its getter. The OpenAPI document (`src/lib/api/openapi.ts`) gains an optional `lang` query parameter (`enum: [es, en]`, default `es`) on every data operation. `tests/openapi.test.ts` must still pass, so add the parameter to the spec generator, not by hand.

`src/lib/content/figures.ts`:

```ts
import { certifications, experience, projects } from "@/app/content";
import { t } from "./localized";

const YEAR = /\b(19|20)\d{2}\b/g;

export function siteFigures(now: Date = new Date()): { years: number | null; projects: number; certifications: number } {
  const perEntry = experience.map((e) => (t(e.period, "es").match(YEAR) ?? []).map(Number));
  // Spec §3.3: si algún periodo no trae un año de 4 cifras, la cifra no se muestra.
  const years = perEntry.every((ys) => ys.length > 0) ? now.getFullYear() - Math.min(...perEntry.flat()) : null;
  return { years, projects: projects.length, certifications: certifications.length };
}
```

Add this assertion to the test, so that a period without a year fails loudly instead of silently hiding the figure: `expect(content.experience.every((e) => /\b(19|20)\d{2}\b/.test(t(e.period)))).toBe(true)`.

- [ ] **Step 4: Run all tests**

Run: `npx vitest run`
Expected: PASS, including the **unchanged** `tests/api.test.ts`, `tests/openapi.test.ts` and `tests/discovery.test.ts`.

- [ ] **Step 5: Commit**

```bash
git add src/app/content src/app/seo.ts src/lib tests/content-i18n.test.ts src/app/api
git commit -m "feat(content): contenido bilingüe; la API acepta lang y conserva las citas originales"
```

---

### Task 3: Páginas de contenido y markdown bilingües

**Files:**
- Modify: `src/lib/content/pages.ts`, `src/lib/markdown/documents.ts`, `src/lib/markdown/render.ts` (only if it hard-codes Spanish labels)
- Test: `tests/content.test.ts` (extend; existing assertions keep passing for `es`)

**Interfaces:**
- Consumes: `Lang`, `localizedPath` (Task 1); localized content (Task 2)
- Produces:
  - `staticPages(lang: Lang): StaticPage[]`; `StaticPage.path` is the **localized** path (`/en/about` in English). `STATIC_PAGES` stays as an alias of `staticPages('es')`.
  - `findStaticPage(path: string): StaticPage | undefined` resolves localized paths (`/en/contact` → the English contact page).
  - `MARKDOWN_DOCUMENTS` keys include `/`, `/en`, `/about`, `/en/about` and every other localized page.
  - `homeMarkdown(lang)` and `notFoundMarkdown(requestedPath?, lang?)`

- [ ] **Step 1: Write the failing tests**

```ts
// append to tests/content.test.ts
import { staticPages, findStaticPage } from "@/lib/content/pages";
import { MARKDOWN_PATHS, markdownForPath } from "@/lib/markdown/documents";

describe("páginas en inglés", () => {
  it("cada página española tiene su gemela inglesa bajo /en", () => {
    const es = staticPages("es").map((p) => p.path);
    const en = staticPages("en").map((p) => p.path);
    expect(en).toEqual(es.map((p) => `/en${p}`));
  });
  it("el markdown en inglés sale en inglés y con su canónica", () => {
    const md = markdownForPath("/en/about")!;
    expect(md).toMatch(/^# About Santiago Gómez de la Torre Romero/m);
    expect(md).toContain("https://sgomez.dev/en/about");
  });
  it("hay markdown para la home en los dos idiomas y ninguno para /lab", () => {
    expect(MARKDOWN_PATHS).toContain("/");
    expect(MARKDOWN_PATHS).toContain("/en");
    expect(MARKDOWN_PATHS.some((p) => p.includes("lab"))).toBe(false);
  });
  it("la privacidad ya no menciona /lab y nombra las fuentes reales", () => {
    for (const lang of ["es", "en"] as const) {
      const text = JSON.stringify(findStaticPage(lang === "es" ? "/privacy" : "/en/privacy"));
      expect(text).not.toMatch(/\/lab/);
      expect(text).toMatch(/Inter Tight/);
      expect(text).toMatch(/Instrument Serif/);
    }
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/content.test.ts`
Expected: FAIL (`staticPages` not exported).

- [ ] **Step 3: Implement**
  - Turn each page constant into a builder `(lang: Lang) => StaticPage`. Write the English text for `about`, `contact`, `developers` and `privacy` as native English with the same facts.
  - The English `about` h1 is «About Santiago Gómez de la Torre Romero», and it keeps the sentence that explains the compound surname.
  - Privacy (both languages):
    - drop the `/lab` paragraph;
    - replace «Las fuentes Geist se sirven desde este mismo dominio» with the real fonts, «Inter Tight e Instrument Serif, que Next.js descarga al compilar y sirve desde este mismo dominio». The same sentence in English.
  - Developers: the list of markdown routes becomes `/`, `/about`, `/contact`, `/privacy`, `/developers` and their `/en/…` twins. Remove `/lab`.
  - `documents.ts`:
    - remove `labMarkdown`;
    - `homeMarkdown(lang)` with localized headings (`## Profile`, `## Projects`, `## Pages`, `## For agents`);
    - build `MARKDOWN_DOCUMENTS` from `LANGS.flatMap(lang => [[localizedPath(lang,'/'), () => homeMarkdown(lang)], ...staticPages(lang).map(...)])`.

- [ ] **Step 4: Run tests**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib tests/content.test.ts
git commit -m "feat(content): páginas y markdown en inglés; fuera /lab"
```

---

### Task 4: Enrutado bajo `[lang]`, proxy y retirada de `/lab` (núcleo)

**Files:**
- Create: `src/lib/routing/request.ts`, `src/app/[lang]/layout.tsx`, `src/app/[lang]/page.tsx` (temporary: renders the existing home sections, which Tasks 6–8 replace), `src/app/[lang]/{about,contact,developers,privacy}/page.tsx`, `src/app/[lang]/[...missing]/page.tsx`, `src/app/[lang]/not-found.tsx`, `src/app/[lang]/llms.txt/route.ts`, `src/app/[lang]/agents.md/route.ts`
- Create (also): `src/lib/routing/pages.ts`
- Modify: `src/proxy.ts`, `src/lib/site.ts` (drop `/lab` from `HTML_ROUTES`), `src/lib/markdown/routing.ts`, `src/app/sitemap.ts`, `src/app/llms.txt/route.ts` and `src/app/agents.md/route.ts` (become `(lang) => string` builders shared with the `/en` routes)
- Delete: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/{about,contact,developers,privacy}/page.tsx`, `src/app/not-found.tsx`, `src/app/lab/**`, `public/lab/**`
- Test: `tests/routing.test.ts`; update `tests/discovery.test.ts` (sitemap with alternates) and `tests/negotiate.test.ts` (localized decide)

**Interfaces:**
- Consumes: Tasks 1–3
- Produces:
  - `routeRequest(pathname: string): { kind: 'next' } | { kind: 'rewrite'; to: string } | { kind: 'redirect'; to: string; status: 301 | 308 }`
  - In `src/lib/routing/pages.ts`: `PAGES = ['/', '/about', '/contact', '/developers', '/privacy'] as const` (logical paths) and `localizedHtmlRoutes(): { path, lang, logical, title, changeFrequency, priority }[]`. `HTML_ROUTES` in `site.ts` keeps its current shape (the Spanish routes, minus `/lab`).
  - `CONTENT_UPDATED: Record<(typeof PAGES)[number], string>` (ISO dates, set by hand when a page's content changes; a test forbids future dates)
  - `llmsTxt(lang: Lang): string`, `agentsMd(lang: Lang): string`

- [ ] **Step 1: Write the failing test**

```ts
// tests/routing.test.ts
import { describe, expect, it } from "vitest";
import { routeRequest } from "@/lib/routing/request";
import { decide } from "@/lib/markdown/routing";
import sitemap from "@/app/sitemap";
import { CONTENT_UPDATED } from "@/lib/routing/pages";

describe("routeRequest", () => {
  it.each([
    ["/", { kind: "rewrite", to: "/es" }],
    ["/about", { kind: "rewrite", to: "/es/about" }],
    ["/en", { kind: "next" }],
    ["/en/about", { kind: "next" }],
    ["/es", { kind: "redirect", to: "/", status: 308 }],
    ["/es/about", { kind: "redirect", to: "/about", status: 308 }],
    ["/lab", { kind: "redirect", to: "/", status: 301 }],
    ["/lab/terminal", { kind: "redirect", to: "/", status: 301 }],
    ["/en/lab", { kind: "redirect", to: "/en", status: 301 }],
    ["/api/v1/profile", { kind: "next" }],
    ["/llms.txt", { kind: "next" }],
    ["/agents.md", { kind: "next" }],
    ["/openapi.json", { kind: "next" }],
    ["/about.md", { kind: "next" }],
    ["/Santiago_Gómez_de_la_Torre_Romero.png", { kind: "next" }],
    ["/_next/static/x.js", { kind: "next" }],
  ])("%s", (path, expected) => {
    expect(routeRequest(path)).toEqual(expected);
  });
});

describe("negociación localizada", () => {
  it("/en/about con Accept markdown sirve markdown con canónica inglesa", () => {
    expect(decide("/en/about", "text/markdown", false)).toEqual({ kind: "markdown", path: "/en/about", canonical: "/en/about", indexable: true });
  });
  it("/en/about.md no se indexa y apunta a /en/about", () => {
    expect(decide("/en/about.md", null, false)).toEqual({ kind: "markdown", path: "/en/about", canonical: "/en/about", indexable: false });
  });
  it("/en.md es la variante de la home inglesa", () => {
    expect(decide("/en.md", null, false)).toMatchObject({ kind: "markdown", canonical: "/en" });
  });
});

describe("sitemap", () => {
  const entries = sitemap();
  it("publica las dos versiones de cada página, con alternates recíprocos", () => {
    const about = entries.find((e) => e.url === "https://sgomez.dev/about")!;
    expect(about.alternates?.languages).toEqual({ es: "https://sgomez.dev/about", en: "https://sgomez.dev/en/about", "x-default": "https://sgomez.dev/about" });
    expect(entries.some((e) => e.url === "https://sgomez.dev/en/about")).toBe(true);
  });
  it("sin /lab", () => expect(entries.some((e) => e.url.includes("/lab"))).toBe(false));
  it("lastModified viene de CONTENT_UPDATED y nunca es futuro", () => {
    for (const d of Object.values(CONTENT_UPDATED)) expect(new Date(d).getTime()).toBeLessThanOrEqual(Date.now());
    const a = sitemap().map((e) => String(e.lastModified));
    const b = sitemap().map((e) => String(e.lastModified));
    expect(a).toEqual(b);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/routing.test.ts`
Expected: FAIL (module missing).

- [ ] **Step 3: Implement `routeRequest`**

```ts
// src/lib/routing/request.ts
import { NEGOTIATION_EXEMPT_PATHS } from "@/lib/site";

export type RouteDecision =
  | { kind: "next" }
  | { kind: "rewrite"; to: string }
  | { kind: "redirect"; to: string; status: 301 | 308 };

const FILE = /\.[a-z0-9]+$/i;

export function routeRequest(pathname: string): RouteDecision {
  if (pathname.startsWith("/_next") || pathname === "/api" || pathname.startsWith("/api/")) return { kind: "next" };
  if (NEGOTIATION_EXEMPT_PATHS.includes(pathname) || FILE.test(pathname)) return { kind: "next" };

  if (pathname === "/lab" || pathname.startsWith("/lab/")) return { kind: "redirect", to: "/", status: 301 };
  if (pathname === "/en/lab" || pathname.startsWith("/en/lab/")) return { kind: "redirect", to: "/en", status: 301 };

  if (pathname === "/es" || pathname.startsWith("/es/")) {
    return { kind: "redirect", to: pathname.slice(3) || "/", status: 308 };
  }
  if (pathname === "/en" || pathname.startsWith("/en/")) return { kind: "next" };
  return { kind: "rewrite", to: pathname === "/" ? "/es" : `/es${pathname}` };
}
```

- [ ] **Step 4: Wire it into `proxy.ts`**

`proxy()` runs `routeRequest` first:
- `redirect` → `NextResponse.redirect(new URL(to, request.url), status)`;
- `rewrite` → continue to the markdown decision using the **public** pathname. When the decision is `html`, return `NextResponse.rewrite(new URL(to + request.nextUrl.search, request.url))` with the same `Vary` and `Link: …rel="alternate"; type="text/markdown"` headers the current code sets on `NextResponse.next()`;
- `next` → today's behaviour.

The markdown branch is unchanged: `markdownForPath` receives the public localized path (`/about`, `/en/about`).

Extend the `config.matcher` exclusions with `en/llms.txt|en/agents.md`. Keep every current exclusion.

`markdownVariantOf('/en')` must return `/en.md`, and `canonicalOfVariant('/en.md')` must return `/en`. The current code already does this, because `/en` isn't `/`; add both to `tests/negotiate.test.ts`.

- [ ] **Step 5: Move pages under `[lang]`**

```tsx
// src/app/[lang]/layout.tsx
import { notFound } from "next/navigation";
import { LANGS, isLang } from "@/i18n/languages";
import "../globals.css";

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}
export const dynamicParams = false;

export default async function LangLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <html lang={lang === "es" ? "es-ES" : "en"}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
```

- Move the current `metadata` and `viewport` exports of `app/layout.tsx` into a `generateMetadata` here. Task 10 rewrites it; for now keep today's values and only localize `openGraph.locale`.
- Keep the agent `<link rel=…>` tags. Keep the JSON-LD script for now, but switch it to `serializeJsonLd` (introduced in Task 10; until then keep `JSON.stringify`).
- `app/[lang]/about/page.tsx` and its siblings:

  ```tsx
  export async function generateMetadata({ params }) { const { lang } = await params; return pageMetadata(findStaticPage(localizedPath(lang, "/about"))!); }
  export default async function Page({ params }) { const { lang } = await params; return <StaticPageLayout page={findStaticPage(localizedPath(lang, "/about"))!} />; }
  ```

- `app/[lang]/[...missing]/page.tsx` → `notFound()`. `app/[lang]/not-found.tsx` is today's 404, localized through the dictionary and `notFoundMarkdown(undefined, lang)`.
- `app/[lang]/llms.txt/route.ts` and `agents.md/route.ts`:
  - `generateStaticParams() { return [{ lang: "en" }] }`, `dynamicParams = false`;
  - the GET returns `llmsTxt('en')` or `agentsMd('en')`;
  - the root `/llms.txt` and `/agents.md` keep serving their current content (`llmsTxt('es')`).
  - Note: today's `/llms.txt` narrative is in **English** on purpose. Keep it byte-compatible so `tests/discovery.test.ts` passes. Its `es`/`en` split only changes the section links it lists: the root version links Spanish pages, the `/en` version links English pages.
- Delete the lab directories, `public/lab`, `/lab` from `HTML_ROUTES` and the `/lab` references in `developers` (already removed in Task 3).
- Sitemap: one entry per `localizedHtmlRoutes()` item, with `alternates.languages = hreflangAlternates(logical)` and `lastModified = CONTENT_UPDATED[logical]`. Plus the machine files (`/llms.txt`, `/en/llms.txt`, `/agents.md`, `/en/agents.md`, `/openapi.json`) with `lastModified` = the max of `CONTENT_UPDATED`.
- `CONTENT_UPDATED` starts at `'2026-09-30'` for every page.

- [ ] **Step 6: Run everything**

Run: `npx vitest run && npm run build`
Expected: all tests PASS. The build lists `/[lang]` with `es` and `en`, every route as static (○ or ●), and only the proxy as dynamic.

- [ ] **Step 7: Smoke-check with the real server**

Run: `npm run start`. In another shell:

```bash
for p in / /about /contact /developers /privacy /en /en/about /es /es/about /lab /lab/x /en/lab /no-existe /about.md /en/about.md /llms.txt /en/llms.txt /agents.md /en/agents.md /openapi.json /api/v1/profile "/api/v1/profile?lang=en" /sitemap.xml /robots.txt; do printf "%-26s " "$p"; curl -s -o /dev/null -w "%{http_code} %{content_type} %{redirect_url}\n" "http://localhost:3000$p"; done
curl -s -H "Accept: text/markdown" http://localhost:3000/en/about | head -3
```

Expected:
- 200 for every page, the `.md` variants, the machine files and the API;
- 308 for `/es` → `/` and `/es/about` → `/about`;
- 301 for the three `/lab` routes;
- 404 for `/no-existe`;
- the markdown opens with `# About Santiago Gómez de la Torre Romero`.

Quote this output in the task report.

- [ ] **Step 8: Commit**

```bash
git add -A src tests public
git commit -m "feat(routing): páginas bajo [lang]; español sin prefijo por el proxy, inglés en /en; /lab redirige"
```

---

### Task 5: Sistema de diseño, navegación y pie

**Files:**
- Create: `src/app/styles/tokens.css`, `src/lib/design/contrast.ts`, `src/components/ui/{Container,Eyebrow,Display,ButtonLink,Section}.tsx`, `src/components/Nav.tsx`, `src/components/LangSwitch.tsx`, `src/components/Footer.tsx`
- Modify: `src/app/globals.css` (replace the current theme), `src/app/[lang]/layout.tsx` (fonts, `<Nav>`, `<Footer>`, skip link)
- Test: `tests/design.test.ts`, `tests/links.test.ts`

**Interfaces:**
- Consumes: `getDictionary`, `switchLangHref`, `localizedPath`, `PAGES`
- Produces:
  - `contrastRatio(fg: string, bg: string): number`
  - UI primitives, all server components:
    - `<Container>` (max-w 1200 px, 16 px gutter on mobile, 32 px from md)
    - `<Eyebrow>` (12 px, tracking .14em, uppercase, `--text-2`)
    - `<Display as="h1"|"h2" lead={string} serif={string}>`. It renders `lead` in Inter Tight 600 (tracking -0.055em, `--text`) followed by `serif` in Instrument Serif italic (`--serif-ink`).
    - `<ButtonLink href variant="primary"|"ghost">`
    - `<Section id labelledBy>`
  - `<Nav lang>` (a server component rendered once in the layout)
  - `<LangSwitch lang>` (the ONLY `'use client'` component of this phase: it reads `usePathname()` and renders `<a href={switchLangHref(pathname, other, PAGES)} hrefLang lang>`; it receives plain strings only)

- [ ] **Step 1: Write the failing tests**

```ts
// tests/design.test.ts
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import { contrastRatio } from "@/lib/design/contrast";

const css = fs.readFileSync("src/app/styles/tokens.css", "utf8");
const token = (name: string) => new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`).exec(css)![1]!;

describe("contraste de los tokens (WCAG AA)", () => {
  it("contrastRatio calcula bien los extremos", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 0);
    expect(contrastRatio("#777777", "#777777")).toBeCloseTo(1, 5);
  });
  for (const bg of ["bg", "bg-2", "bg-3"]) {
    it(`texto de cuerpo sobre --${bg} ≥ 4.5`, () => {
      expect(contrastRatio(token("text"), token(bg))).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(token("text-2"), token(bg))).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(token("serif-ink"), token(bg))).toBeGreaterThanOrEqual(4.5);
    });
  }
  it("el botón primario (texto --bg sobre --text) ≥ 4.5", () => {
    expect(contrastRatio(token("bg"), token("text"))).toBeGreaterThanOrEqual(4.5);
  });
});
```

```ts
// tests/links.test.ts
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

function files(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? files(path.join(dir, d.name)) : d.name.endsWith(".tsx") ? [path.join(dir, d.name)] : []));
}

describe("<Link> sin prefetch", () => {
  it("todo <Link> declara prefetch={false}", () => {
    for (const f of files("src")) {
      const src = fs.readFileSync(f, "utf8");
      for (const m of src.matchAll(/<Link\b[^>]*>/g)) expect(m[0], f).toMatch(/prefetch=\{false\}/);
    }
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/design.test.ts tests/links.test.ts`
Expected: FAIL (tokens file missing; existing `<Link>`s without `prefetch`).

- [ ] **Step 3: Implement**

`contrast.ts`, standard WCAG relative luminance:

```ts
function channel(c: number) { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; }
function luminance(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}
export function contrastRatio(fg: string, bg: string): number {
  const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (a! + 0.05) / (b! + 0.05);
}
```

`tokens.css` declares on `:root` exactly the values from Global Constraints, plus:
- `--line: #ffffff14`;
- `--radius: 14px`;
- `--font-sans: var(--font-inter-tight)`;
- `--font-serif: var(--font-instrument-serif)`.

`globals.css` imports Tailwind 4 and `./styles/tokens.css`, sets `body { background: var(--bg); color: var(--text); font-family: var(--font-sans); }` and a visible focus ring (`:focus-visible { outline: 2px solid var(--light-1); outline-offset: 3px }`), and removes the old violet theme classes. Keep only the utility classes still referenced; `grep` before deleting any of them.

Fonts in the layout:

```tsx
import { Inter_Tight, Instrument_Serif } from "next/font/google";
const sans = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", weight: ["400", "500", "600"], display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], variable: "--font-instrument-serif", weight: "400", style: ["normal", "italic"], display: "swap" });
```

`Nav`:
- fixed to the top, height 64 px, background `color-mix(in oklab, var(--bg) 78%, transparent)` with `backdrop-filter: blur(12px)`, a bottom border in `--line`, and `z-50`;
- left: the wordmark «Santiago Gómez de la Torre», linking to `localizedPath(lang, '/')`;
- center/right: anchors to `#work`, `#about`, `#open-source` and `#contact` on the home (written as `localizedPath(lang,'/') + '#work'`, so they work from any page), the external «Skills» link (`https://skills.sgomez.dev`) and «Blog» (`https://blog.sgomez.dev`), then `<LangSwitch lang>`;
- below `md` the links collapse into a `<details>` disclosure. That needs no JS and stays accessible.
- Add the test `switchLangHref('/no-existe','en',PAGES) === '/en'`: it is already in `tests/i18n.test.ts`, so re-check it passes.

The layout renders:
- a skip link, `<a href="#main" class="sr-only focus:not-sr-only">{d.nav.skip}</a>`;
- then `<Nav>`, `<main id="main" class="pt-16">`, `{children}` and `<Footer>`.

`Nav` lives in the layout, which cannot know the current page, so the language switch is the small client component `<LangSwitch>`. It uses `usePathname()`, which also covers the 404: an unknown path goes to that language's home through `switchLangHref`. Without JS, the server-rendered href points to the other language's home, and it's corrected on hydration. That is acceptable, and the e2e for Review Focus 4 runs with JS.

Add `prefetch={false}` to every `<Link>` in `src/` (StaticPageLayout, not-found, any other).

`Footer`:
- the links to about, contact, developers, privacy, llms.txt, OpenAPI, skills.sgomez.dev and blog.sgomez.dev;
- `© {year} Santiago Gómez de la Torre Romero` (the current footer drops the accent in «Gómez». Fix it);
- the language switch repeated.

- [ ] **Step 4: Run tests and build**

Run: `npx vitest run && npm run build`
Expected: PASS; the build succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A src tests
git commit -m "feat(design): tokens con contraste AA comprobado, Inter Tight + Instrument Serif, nav fija y pie"
```

---

### Task 6: Capítulos 01–03 (hero, quién soy, lo que construyo)

**Files:**
- Create: `src/chapters/Hero.tsx`, `src/chapters/About.tsx`, `src/chapters/Build.tsx`, `src/components/Portrait.tsx`, `src/components/GlassPoster.tsx`
- Modify: `src/app/[lang]/page.tsx` (starts composing chapters)
- Test: `tests/chapters.test.tsx`, a render test with `react-dom/server`

**Interfaces:**
- Consumes: localized content (Task 2), `siteFigures()`, UI primitives (Task 5), `getDictionary`
- Produces: `<Hero lang>`, `<About lang>` and `<Build lang>`, all server components. Every animatable element carries a `data-motion="…"` attribute naming its phase-2 behaviour (`text-reveal`, `count`, `layer`, `glass`, `portrait`), so phase 2 attaches motion without changing markup.

Visual reference: the chosen mockup B with typography 4 (`.superpowers/brainstorm/*/content/tipografia.html`, card 4). Replicate its layout with the contrast fixes from the spec.

- **Hero** (`<section id="top">`):
  - two columns from `lg`: text left (max-w 640 px), portrait + glass right. On mobile it stacks, with the portrait above the text, max 320 px high, and the glass behind the portrait only;
  - `<Eyebrow>{d.chapters.hero.eyebrow}</Eyebrow>` («Full-stack engineer · Santander»);
  - `<Display as="h1" lead="Santiago Gómez de la Torre." serif={d.chapters.hero.serif} />`, where `serif` is «IA que llega a producción.» / «AI that reaches production.». Size `clamp(44px, 7vw, 96px)`, line-height .95;
  - the **answer sentence**: `<p data-answer>` with `t(hero.subtitle, lang)`, in `--text-2`, 18 px;
  - the CTAs: `<ButtonLink href="#contact" variant="primary">{d.cta.talk}</ButtonLink>` and `<ButtonLink href="#work" variant="ghost">{d.cta.work}</ButtonLink>`;
  - an availability pill (a small dot in `--light-2` plus text from the dictionary).
- **Portrait:** `next/image` of `/Santiago_Gómez_de_la_Torre_Romero.png` with `priority`, `sizes="(min-width:1024px) 40vw, 80vw"` and alt «Retrato de Santiago Gómez de la Torre» / «Portrait of Santiago Gómez de la Torre». Treatment: a CSS mask with a radial fade to transparent at the edges, and `filter: saturate(.9) contrast(1.05)`. `data-motion="portrait"`.
- **GlassPoster:** the static stand-in for the phase-3 3D glass. An inline SVG blob filled with a conic-like gradient (`#8FA8FF → #FFFFFF → #6EF0DC → #5B6CFF`) plus a blurred glow, `aria-hidden="true"`, positioned **behind the portrait and never behind text**, `data-motion="glass"`. It must not be the LCP element: it is SVG with no text, and the portrait image is the LCP.
- **About** (`<section id="about" aria-labelledby="about-h">`):
  - an h2 with the Display pattern;
  - the bio (`t(about.description, lang)`) split into paragraphs, the first one as the large «lead» paragraph (24–28 px, `data-motion="text-reveal"`);
  - a figures row of three `<dl>` items built from `siteFigures()` with the dictionary templates via `fill()`. When `years` is `null`, render two items, not three. Each `<dd>` carries `data-motion="count"` and `data-value={n}`.
- **Build** (`<section id="build">`): the stack told as layers of an AI product. Six layers in this order, each with its label from the dictionary and the technologies taken from `technologies` in content:
  1. Interface (Frontend)
  2. API (Backend)
  3. Model (LLM work: RAG, Evals, Embeddings, Prompt engineering, from `IDENTITY.knowsAbout`)
  4. Data (Databases & Tools)
  5. Evaluation (Evals)
  6. Infrastructure (DevOps & Cloud)

  Each layer is a rounded bar (`--bg-3`, 1 px border in `color-mix(var(--light-1) 35%, transparent)`) with its label left and the tech chips right. `data-motion="layer"` and `data-index`. Static: stacked vertically with 10 px gaps.

- [ ] **Step 1: Write the failing test**

```tsx
// tests/chapters.test.tsx
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Hero from "@/chapters/Hero";
import About from "@/chapters/About";
import Build from "@/chapters/Build";
import { siteFigures } from "@/lib/content/figures";

describe("capítulos 01–03 en HTML de servidor", () => {
  for (const lang of ["es", "en"] as const) {
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
    it(`${lang}: seis capas en Build`, () => expect(html.match(/data-motion="layer"/g)).toHaveLength(6));
    it(`${lang}: el cristal es decorativo`, () => expect(html).toMatch(/data-motion="glass"[^>]*aria-hidden="true"|aria-hidden="true"[^>]*data-motion="glass"/));
  }
});
```

Update `vitest.config.mts` to include `tests/**/*.test.tsx`. The environment stays `node`, because `renderToStaticMarkup` needs no DOM. If `next/image` fails outside Next, mock it in `tests/setup.ts` with `vi.mock("next/image", () => ({ default: (p: any) => <img {...p} /> }))`, register `setupFiles`, and mock `next/link` the same way.

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/chapters.test.tsx`
Expected: FAIL (modules missing).

- [ ] **Step 3: Implement the three chapters and the two components per the description above**

- [ ] **Step 4: Run tests, build, and look at it**

Run: `npx vitest run && npm run build && npm run start`. Open `http://localhost:3000` and `/en` at 1280 px and at 375 px. Checks:
- no horizontal scroll;
- the glass never sits under text;
- the nav doesn't cover the hero CTAs.

Save two screenshots per language to `../.superpowers/verify/task-6/` (gitignored).

- [ ] **Step 5: Commit**

```bash
git add -A src tests vitest.config.mts
git commit -m "feat(home): hero con retrato y frase de respuesta, quién soy con cifras derivadas, stack en capas"
```

---

### Task 7: Capítulos 04–07 (experiencia, proyectos, open source, SkyQuetz)

**Files:**
- Create: `src/chapters/Experience.tsx`, `src/chapters/Projects.tsx`, `src/chapters/OpenSource.tsx`, `src/chapters/SkyQuetz.tsx`
- Modify: `src/app/[lang]/page.tsx`
- Test: extend `tests/chapters.test.tsx`

**Interfaces:**
- Consumes: `getExperience(lang)`, `getProjects(lang)`, content `skyquetz`, `CLAUDE_CANVAS`, UI primitives
- Produces: `<Experience lang>`, `<Projects lang>`, `<OpenSource lang>` and `<SkyQuetz lang>`

- **Experience** (`#experience`): a horizontal row of cards (`data-motion="timeline"` on the track). **Statically it is a vertical list on mobile and a horizontally scrollable row (`overflow-x: auto`, `scroll-snap-type: x mandatory`) from `md`.** The horizontal row must not create page-level horizontal overflow, so scrolling happens inside the track only. Each card shows the period (mono, `--text-2`), role, organization and description.
- **Projects** (`#work`): a product-tile grid, 1/2/3 columns. The first three projects (Claude Canvas, NudaUI Semantic Search, NudaUI) are «featured»: they span 2 columns on `lg` and hold a device frame (a rounded rectangle, `--bg-2`, 1 px `--line` border) with a `data-motion="reel"` slot. **In this phase the slot shows the project's name and stack, never an empty box.** Every tile links to the project URL (`rel="noopener"`, `target="_blank"`) with an accessible name «{title} — {d.projects.open}».
- **OpenSource** (`#open-source`): NudaUI, Claude Canvas (with its attribution sentence, exactly as `CLAUDE_CANVAS.attribution` in English / its Spanish equivalent from `pages.ts`, never shortened) and claude-skills (link `https://skills.sgomez.dev`). Each block is a card built with `data-motion="build"` layers: an outline div, a fill div and a content div. Statically all three are visible and composed.
- **SkyQuetz** (`#skyquetz`, keeping this anchor id because the JSON-LD breadcrumb targets it):
  - the logo `/brand/skyquetz-logo.webp` with alt from content;
  - desc, `myPart` and the three stats;
  - two product cards (Synentria, Packatrack) with their links;
  - it is visibly secondary: smaller heading scale (h2 at 40 px, not 64 px);
  - a `data-motion="monogram"` wrapper on the logo.

- [ ] **Step 1: Write the failing tests** (append):

```tsx
import Experience from "@/chapters/Experience";
import Projects from "@/chapters/Projects";
import OpenSource from "@/chapters/OpenSource";
import SkyQuetz from "@/chapters/SkyQuetz";
import { getExperience, getProjects } from "@/lib/api/data";
import { CLAUDE_CANVAS } from "@/app/seo";

describe("capítulos 04–07", () => {
  for (const lang of ["es", "en"] as const) {
    const html = renderToStaticMarkup(<><Experience lang={lang} /><Projects lang={lang} /><OpenSource lang={lang} /><SkyQuetz lang={lang} /></>);
    it(`${lang}: todas las experiencias y todos los proyectos`, () => {
      for (const e of getExperience(lang)) expect(html).toContain(e.role);
      for (const p of getProjects(lang)) expect(html).toContain(p.title);
    });
    it(`${lang}: anclas estables`, () => {
      for (const id of ["experience", "work", "open-source", "skyquetz"]) expect(html).toContain(`id="${id}"`);
    });
    it(`${lang}: Claude Canvas conserva su atribución`, () => expect(html).toMatch(/David Siegel/));
    it(`${lang}: enlace a skills.sgomez.dev`, () => expect(html).toContain('href="https://skills.sgomez.dev"'));
    it(`${lang}: ningún hueco de reel vacío`, () => {
      for (const m of html.matchAll(/data-motion="reel"[^>]*>([\s\S]*?)<\/div>/g)) expect(m[1]!.replace(/<[^>]+>/g, "").trim()).not.toBe("");
    });
  }
});
```

- [ ] **Step 2: Run to verify failure** — `npx vitest run tests/chapters.test.tsx` → FAIL.
- [ ] **Step 3: Implement the four chapters.**
- [ ] **Step 4:** `npx vitest run && npm run build`, then a visual check at 1280 and 375 px on `/` and `/en`. There must be **no page-level horizontal scroll** at 375 px, including the experience track. Screenshots go to `../.superpowers/verify/task-7/`.
- [ ] **Step 5: Commit**

```bash
git add -A src tests
git commit -m "feat(home): experiencia, proyectos como fichas de producto, open source y SkyQuetz"
```

---

### Task 8: Capítulos 08–09 (prueba social, contacto) y limpieza

**Files:**
- Create: `src/chapters/Proof.tsx`, `src/chapters/Contact.tsx`, `src/chapters/LatestPosts.tsx` (rewrite of the current one, same `BLOG_API`), `src/lib/contact/mailto.ts`, `src/lib/content/recommendation-view.ts`
- Modify: `src/app/[lang]/page.tsx` (final composition, in the order of the script)
- Delete: `src/app/components/{MacBook,MacInterlude,BottomBar,PlaygroundButton,HeroSection,AboutSection,ExperienceSection,SkyQuetzSection,TechnologiesSection,ProjectsSection,OpenSourceSection,CertificationsSection,RecommendationsSection,EducationSection,ContactSection,LatestPosts,DownloadCVButton}.tsx`
- Test: `tests/contact.test.ts`, extend `tests/chapters.test.tsx`

**Interfaces:**
- Produces:
  - `type ContactIntent = 'freelance' | 'job' | 'other'`
  - `contactMailto(intent: ContactIntent, lang: Lang): string` returns a `mailto:contact@sgomez.dev?subject=…&body=…` URL, encoded with `encodeURIComponent`, taking the subject and body from the dictionary
  - `recommendationView(r: Recommendation, lang: Lang): { quote: string; quoteLang: 'es'; translation?: string; translatedLabel?: string }`

- [ ] **Step 1: Write the failing tests**

```ts
// tests/contact.test.ts
import { describe, expect, it } from "vitest";
import { contactMailto } from "@/lib/contact/mailto";
import { recommendationView } from "@/lib/content/recommendation-view";
import { getRecommendations } from "@/lib/api/data";
import { getDictionary } from "@/i18n";

describe("contacto por intención", () => {
  for (const lang of ["es", "en"] as const) for (const intent of ["freelance", "job", "other"] as const) {
    it(`${lang}/${intent}`, () => {
      const url = new URL(contactMailto(intent, lang));
      expect(url.protocol).toBe("mailto:");
      expect(url.pathname).toBe("contact@sgomez.dev");
      expect(url.searchParams.get("subject")).toBe(getDictionary(lang).contact.intent[intent].subject);
      expect(url.searchParams.get("body")).toBe(getDictionary(lang).contact.intent[intent].body);
    });
  }
});

describe("recomendaciones", () => {
  it("en inglés: cita original en español y traducción etiquetada", () => {
    const [r] = getRecommendations("en");
    const v = recommendationView(r!, "en");
    expect(v.quote).toBe(r!.comment);
    expect(v.quoteLang).toBe("es");
    expect(v.translation).toBe(r!.comment_translation);
    expect(v.translatedLabel).toBe(getDictionary("en").recommendations.translated);
  });
  it("en español: solo la cita, sin traducción", () => {
    const v = recommendationView(getRecommendations("es")[0]!, "es");
    expect(v.translation).toBeUndefined();
  });
});
```

Also append to `tests/chapters.test.tsx`:
- rendering `<Proof lang="en" />`, the quote paragraph carries `lang="es"`;
- `<Contact lang>` renders three links whose `href` equals `contactMailto(intent, lang)`;
- the CV link `/CV_Santiago_Gómez_de_la_Torre_Romero.pdf` is on the `job` intent;
- `#contact` exists.

- [ ] **Step 2: Run to verify failure** — FAIL.
- [ ] **Step 3: Implement**
  - **Proof** (`#proof`):
    - recommendations as large quotes (26–30 px, Instrument Serif italic, `--serif-ink`), one per row, with name and date. In English the Spanish quote comes first (`lang="es"`), then the translation in `--text-2` with the small label «Translated from Spanish»;
    - the certifications as a grid of badges (`data-motion="badge"`): title, institution, date, linked to the credential;
    - the education row;
    - `<LatestPosts>`: a server fetch with `next: { revalidate: 3600 }`, exactly like today, including its fallback when the blog is down (**read the current component and keep the fallback behaviour**).
  - **Contact** (`#contact`):
    - a big closing Display («Hablemos.» / «Let's talk.»);
    - the three intent cards, each an `<a href={contactMailto(...)}>` with a label and a one-line description;
    - the email written in plain text as well;
    - the profiles from `contactLinks` (drop Facebook if it's not in `IDENTITY.sameAs`. It isn't, so remove it from the visible list but keep it in content);
    - the CV link;
    - a `data-motion="glass"` decorative slot (the same `GlassPoster`, `aria-hidden`).
  - Delete the old components and any now-unused CSS in `globals.css`. Run `grep -r "MacInterlude\|BottomBar\|PlaygroundButton" src` afterwards; it must print nothing.

- [ ] **Step 4:** `npx vitest run && npm run build`, then a visual check (1280 and 375 px, both languages). Screenshots go to `../.superpowers/verify/task-8/`.
- [ ] **Step 5: Commit**

```bash
git add -A src tests public
git commit -m "feat(home): prueba social con citas originales, contacto por intención; fuera los componentes antiguos"
```

---

### Task 9: Páginas de contenido y 404 con el nuevo diseño

**Files:**
- Modify: `src/app/components/StaticPageLayout.tsx` (move it to `src/components/StaticPageLayout.tsx` and update imports), `src/app/[lang]/not-found.tsx`
- Test: extend `tests/content.test.ts` with a render test

- Restyle with the tokens:
  - measure 68ch;
  - h1 through `<Display>` (the page title as `lead`, and no serif part unless the page defines one);
  - section headings in Inter Tight 600, 28 px;
  - tables with `--line` borders and a horizontal scroll **inside** a wrapper (`overflow-x:auto`, `tabIndex={0}`, `role="region"`, `aria-label`) so they never overflow the page;
  - code blocks the same way.
- The page `lead` renders as `<p data-answer>`, the answer-first sentence of spec §8.1 that `speakable` points to.
- Keep the «Ver en markdown» / «View as markdown» link to `markdownVariantOf(page.path)`.
- The 404 keeps its full site map (pages in the current language, the machine files and the API) and its literal markdown block.

- [ ] **Step 1: Failing test** (append to `tests/content.test.ts`):

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import StaticPageLayout from "@/components/StaticPageLayout";
it("las tablas y el código se desplazan dentro de su región, no la página", () => {
  const html = renderToStaticMarkup(<StaticPageLayout page={findStaticPage("/en/developers")!} />);
  expect(html).toMatch(/role="region"[^>]*tabindex="0"|tabindex="0"[^>]*role="region"/i);
  expect(html).toContain('href="/en/developers.md"');
});
```

(Rename the file to `tests/content.test.tsx` if JSX is needed, and keep the include pattern from Task 6.)

- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** `npx vitest run && npm run build`, plus a visual check of `/developers` and `/en/privacy` at 375 px with no page-level horizontal scroll. **Step 5: Commit**

```bash
git add -A src tests
git commit -m "feat(pages): páginas de contenido y 404 con el diseño nuevo, tablas desplazables dentro de su región"
```

---

### Task 10: SEO y GEO de la fase 1 (núcleo)

**Files:**
- Create: `src/lib/seo/jsonld.ts`, `src/lib/seo/metadata.ts`, `src/app/[lang]/opengraph-image.tsx`, `src/app/[lang]/llms-full.txt/route.ts` (en) and `src/app/llms-full.txt/route.ts` (es)
- Modify: `src/app/seo.ts` (`personGraph(lang, page)`), `src/app/[lang]/layout.tsx` and every page (`generateMetadata` via `buildMetadata`), `public/robots.txt`, `src/lib/site.ts` (`MACHINE_ROUTES` + llms-full), `src/proxy.ts` matcher (+`llms-full.txt`)
- Test: `tests/seo.test.ts`; update `tests/discovery.test.ts` (robots)

**Interfaces:**
- Produces:
  - `serializeJsonLd(value: unknown): string` (escapes `<` `>` `&` U+2028 U+2029 as `\\u003c`, `\\u003e`, `\\u0026`, `\\u2028`, `\\u2029`)
  - `pageGraph(opts: { lang: Lang; path: string; title: string; description: string; type: 'ProfilePage' | 'WebPage' | 'ContactPage' | 'AboutPage'; faq?: { q: string; a: string }[] }): Record<string, unknown>`, which returns `{ '@context': 'https://schema.org', '@graph': [...] }`
  - `buildMetadata(opts: { lang; path; title; description }): Metadata`, with `alternates.canonical`, `alternates.languages` (from `hreflangAlternates`), `alternates.types['text/markdown']`, `openGraph.locale` (`es_ES` / `en_US`) with its `alternateLocale`, and `openGraph.images` pointing at the per-language OG image with `alt`

Content of the graph:
- **Person:** as today, plus:
  - `sameAs` includes `https://skills.sgomez.dev` and `https://www.linkedin.com/in/sgomez-dev/`; keep the existing LinkedIn form too, because today's graph uses `https://linkedin.com/in/sgomez-dev` and both are the same profile;
  - `description` per language;
  - `knowsLanguage: ['es','en']`;
  - `hasCredential`: one `EducationalOccupationalCredential` per certification (`name`, `recognizedBy: { '@type': 'Organization', name: institution }`, `url`).
- **WebSite** with `inLanguage: ['es-ES','en']`.
- **WebPage / ProfilePage / ContactPage** with:
  - `inLanguage`;
  - `dateModified` from `CONTENT_UPDATED[logicalPath]`;
  - `speakable.cssSelector: ['h1', '[data-answer]']`;
  - `isPartOf`.
- **The contact page** adds a `FAQPage` with 4 questions from the dictionary: availability, freelance or employment, time zone and languages, and how to reach Santiago. Every answer is true and taken from `pages.ts`/content.
- Keep the SkyQuetz and Claude Canvas nodes and every existing assertion in `tests/discovery.test.ts`.

`robots.txt`:
- remove the `Host:` line;
- add, directly under `User-agent: *` / `Allow: /`, the line `Content-Signal: search=yes, ai-input=yes, ai-train=yes`;
- add groups for `DuckAssistBot` and `MistralAI-User`;
- add `https://sgomez.dev/en/llms.txt` and `/llms-full.txt` to the header comment;
- keep everything else.

OG image (`opengraph-image.tsx`, 1200×630, `next/og`):
- background `#05060A` with the same radial glow;
- the Display title «Santiago Gómez de la Torre.» plus the localized serif line;
- the portrait on the right, loaded from `public/` through `fetch(new URL(...))` or `readFile`;
- export `alt` per language (`generateImageMetadata` or a localized static `alt`).

`llms-full.txt`: the whole site content in Markdown (the home markdown, then every static page), in its language. The test enforces < 100 KB for `llms.txt`; `llms-full.txt` has no limit but must be < 300 KB.

- [ ] **Step 1: Failing tests**

```ts
// tests/seo.test.ts
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import { serializeJsonLd, pageGraph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

describe("serializeJsonLd", () => {
  it("escapa lo que puede cerrar un <script>", () => {
    const out = serializeJsonLd({ a: "</script><b>&\u2028\u2029" });
    expect(out).not.toMatch(/<|>|&|\u2028|\u2029/);
    expect(out).toContain("\\u003c/script\\u003e");
    expect(JSON.parse(out)).toEqual({ a: "</script><b>&\u2028\u2029" });
  });
});

describe("grafo por página", () => {
  const g = pageGraph({ lang: "en", path: "/contact", title: "Contact", description: "d", type: "ContactPage", faq: [{ q: "Q?", a: "A." }] }) as { "@graph": { "@type": string; [k: string]: unknown }[] };
  const types = g["@graph"].map((n) => n["@type"]);
  it("lleva Person, WebSite, la página y el FAQ", () => {
    for (const t of ["Person", "WebSite", "ContactPage", "FAQPage"]) expect(types).toContain(t);
  });
  it("la persona enlaza skills.sgomez.dev y declara credenciales", () => {
    const p = g["@graph"].find((n) => n["@type"] === "Person")!;
    expect(p.sameAs as string[]).toContain("https://skills.sgomez.dev");
    expect((p.hasCredential as unknown[]).length).toBeGreaterThan(10);
  });
  it("la página tiene idioma, fecha y speakable", () => {
    const page = g["@graph"].find((n) => n["@type"] === "ContactPage")!;
    expect(page.inLanguage).toBe("en");
    expect(page.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}/);
    expect(JSON.stringify(page.speakable)).toContain("[data-answer]");
  });
  it("sin valoraciones inventadas", () => expect(JSON.stringify(g)).not.toMatch(/aggregateRating|"Review"/));
});

describe("metadata", () => {
  it("hreflang recíproco y variante markdown", () => {
    const m = buildMetadata({ lang: "en", path: "/about", title: "t", description: "d" });
    expect(m.alternates?.canonical).toBe("/en/about");
    expect(m.alternates?.languages).toMatchObject({ es: "https://sgomez.dev/about", en: "https://sgomez.dev/en/about" });
    expect((m.alternates?.types as Record<string, string>)["text/markdown"]).toBe("/en/about.md");
  });
});

describe("robots.txt", () => {
  const robots = fs.readFileSync("public/robots.txt", "utf8");
  it("Content-Signal y sin Host", () => {
    expect(robots).toMatch(/^Content-Signal: search=yes, ai-input=yes, ai-train=yes$/m);
    expect(robots).not.toMatch(/^Host:/m);
  });
  it("bots nuevos permitidos", () => {
    for (const bot of ["DuckAssistBot", "MistralAI-User", "GPTBot", "ClaudeBot", "PerplexityBot"]) expect(robots).toMatch(new RegExp(`^User-agent: ${bot}$`, "m"));
  });
});
```

- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement. `serializeJsonLd`:

```ts
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
```

Each page renders `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(pageGraph(...)) }} />`. The layout no longer renders a global graph, so each page renders exactly one `@graph`.

- [ ] **Step 4:** `npx vitest run && npm run build && npm run start`, then:

```bash
curl -s http://localhost:3000/en/contact | grep -o '<script type="application/ld+json">[^<]*' | sed 's/<script type="application\/ld+json">//' | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const g=JSON.parse(s);console.log(g['@graph'].map(n=>n['@type']).join(','))})"
curl -s http://localhost:3000/robots.txt | head -20
curl -s -o /dev/null -w "%{http_code} %{content_type} %{size_download}\n" http://localhost:3000/en/llms.txt
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" http://localhost:3000/en/opengraph-image
```

Expected:
- the first command prints `Person,WebSite,ContactPage,FAQPage` (in some order, plus the SkyQuetz/Claude Canvas nodes);
- robots starts with the updated header;
- `/en/llms.txt` is 200 `text/markdown`;
- the OG image is 200 `image/png`.

Quote the output.

- [ ] **Step 5: Commit**

```bash
git add -A src tests public
git commit -m "feat(seo): un @graph por página y por idioma, hreflang, OG por idioma, llms-full.txt y robots con Content-Signal"
```

---

### Task 11: E2E, accesibilidad, presupuestos y CI

**Files:**
- Create: `playwright.config.ts`, `e2e/routes.spec.ts`, `e2e/experience.spec.ts`, `e2e/a11y.spec.ts`, `lighthouserc.json`, `../.github/workflows/ci.yml` (i.e. `.github/workflows/ci.yml` at the repo root)
- Modify: `package.json` (devDeps `@playwright/test`, `@axe-core/playwright`, `@lhci/cli`; scripts `e2e`, `lhci`)

**Interfaces:** none new; the task consumes everything above.

- `playwright.config.ts`:
  - `webServer: { command: 'npm run build && npm run start', url: 'http://localhost:3000', reuseExistingServer: true, timeout: 300_000 }`;
  - projects `desktop` (1280×800) and `mobile` (375×812, `isMobile: true`).
- `e2e/routes.spec.ts`:
  - every URL in Global Constraints returns its expected status and `content-type`; for redirects, check the `location` header with `maxRedirects: 0`;
  - `/`, `/about`, `/en` and `/en/about` have `<link rel="alternate" hreflang="es|en|x-default">` with the right hrefs;
  - **Review Focus 2:** on `/`, click the nav link to `/about` (a `Link` from the footer), then `await expect(page.locator('h1')).toContainText('Santiago Gómez de la Torre Romero')`, and the collected `console` errors equal `[]`;
  - **Review Focus 4:** on `/no-existe`, the language switch href is `/en`.
- `e2e/experience.spec.ts`:
  - with `javaScriptEnabled: false`, on `/` and `/en`, every `section[id]` of the 9 chapters has non-empty `innerText`, and `[data-answer]` is visible;
  - with `javaScriptEnabled: false`, `document.documentElement.scrollWidth <= window.innerWidth` at 375 px on `/`, `/en`, `/developers` and `/en/privacy`;
  - **Review Focus 5:** on `/en`, the first quote inside `#proof` has `lang="es"` and is followed by the «Translated from Spanish» label;
  - JS budget: sum the `transferSize` of the `script` resources on `/` and `/en` (from `performance.getEntriesByType('resource')`); it must be ≤ 170 × 1024. Note: `next start` compresses by default, so this is a gzip transfer size.
- `e2e/a11y.spec.ts`:
  - `new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa']).analyze()` on `/`, `/en`, `/about`, `/en/contact`, `/developers` and a 404;
  - `violations` must be `[]`, and on failure print `id`, `impact` and the first `target` of each.
- `lighthouserc.json`:
  - collect from `http://localhost:3000/`, `/en` and `/about`, with `numberOfRuns: 3`;
  - assertions:
    - `categories:seo` ≥ 1 (error);
    - `categories:accessibility` ≥ 0.95 (error);
    - `cumulative-layout-shift` ≤ 0.05 (error);
    - `total-blocking-time` ≤ 200 (error);
    - `largest-contentful-paint` ≤ 2500 as **warn** locally (ESET on this machine distorts it; the gate that counts is CI).
- `.github/workflows/ci.yml`:
  - `on: pull_request`;
  - Node 22;
  - `working-directory: sgomez`;
  - `npm ci`, `npx tsc --noEmit`, `npm run lint`, `npx vitest run`, `npx playwright install --with-deps chromium`, `npm run e2e`;
  - Lighthouse: set `CHROME_PATH` from Playwright's Chromium and run `sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0` first. That is the same fix that unblocked claude-skills' CI; without it Chromium aborts with "No usable sandbox!";
  - then `npx lhci autorun`, with LCP as **error** in CI: override `largest-contentful-paint` with `--assert.assertions.largest-contentful-paint=error`, or a separate `lighthouserc.ci.json`.

- [ ] **Step 1:** Write the specs and configs above.
- [ ] **Step 2:** Run `npm run e2e`. It will likely FAIL at first on real defects (contrast, overflow, console errors). Fix the cause in the owning component, not in the test, and record each fix in the report.
- [ ] **Step 3:** Run `npm run lhci` locally. It must pass every error-level assertion; LCP is a warning here.
- [ ] **Step 4: Commit**

```bash
git add -A e2e playwright.config.ts lighthouserc*.json package.json package-lock.json ../.github/workflows/ci.yml
git commit -m "test(e2e): rutas, sin JS, sin desbordes, axe, presupuesto de JS y Lighthouse en CI"
```

---

### Task 12: Verificación final de la fase y PR (controlador)

- [ ] Run the full suite: `npx tsc --noEmit && npm run lint && npx vitest run && npm run e2e`. Quote the totals.
- [ ] Do a real browser pass with Playwright MCP against `npm run start`:
  - `/` and `/en` at 1280 and 375 px, scrolling through all 9 chapters;
  - `/about`, `/en/contact`, `/developers` and a 404;
  - the language switch both ways;
  - the three contact intents open `mailto:` with the right subject;
  - screenshots to `../.superpowers/verify/fase-1/`.
- [ ] Re-run the smoke `curl` list from Task 4 Step 7 and the JSON-LD check from Task 10 Step 4.
- [ ] Opus review of the whole branch. Tasks 2, 4 and 10 are core, so they also get their own opus review at task time.
- [ ] Only after Santiago's go: `git push -u origin feat/redesign-v3` and open a PR against `main` (the branch rule requires PRs). The body carries the verification evidence and ends with the attribution line from the session's system reminder. Vercel builds the preview, and the Lighthouse CI LCP gate runs on it.

---

## Fases siguientes (un plan propio cada una, al terminar la anterior)

- **Fase 2 — Movimiento del DOM:** primitivas `motion/` (TextReveal, StickyScene, Counter, BuildTrace, Magnetic, PageTransition, cada una con su variante sin movimiento), enganchadas a los `data-motion` que ya existen en los capítulos 02, 04, 06, 08 y 09.
- **Fase 3 — 3D en vivo:** `three/GlassScene` en sustitución de `GlassPoster` en el hero y el contacto, con las condiciones de carga de la spec §4.
- **Fase 4 — Taller Remotion:** `video/` con `BuildSequence`, `SkyQuetzMonogram`, `HeroLoop` y `ProjectReel`, más `ScrollSequence` para los capítulos 03, 05 y 07.
- **Fase 5 — Casos de estudio, SEO/GEO de lanzamiento e IndexNow.**
