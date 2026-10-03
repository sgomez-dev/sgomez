# Fase 5: casos de estudio, SEO/GEO pendiente y lanzamiento

Especificación: §3.4, §8, §10.5 y §11 de `docs/superpowers/specs/2026-09-30-sgomez-redesign-design.md`.

## Qué ya está hecho (auditado el 2026-10-02)

Desde la fase 1 ya están en `feat/redesign-v3`:

- la frase de respuesta en cada página;
- el `@graph` con `Person`, `ProfilePage`, `Speakable`, `alumniOf`, `hasCredential`, `knowsAbout` y `FAQPage`;
- `hreflang` en HTML y en el sitemap;
- `llms.txt`, `/en/llms.txt` y `llms-full.txt`;
- `agents.md` en los dos idiomas;
- `robots.txt` con `Content-Signal`, `DuckAssistBot` y `MistralAI-User`;
- los enlaces a skills.sgomez.dev y a blog.sgomez.dev;
- una imagen OG por idioma;
- el contacto por intención (`/contact` y `#contact`, con los tres caminos y `mailto`).

Esta fase no los rehace, solo añade lo que falta.

## Tareas

### Task 1: casos de estudio (`/[lang]/work/[slug]`)

**Files:** modify `src/app/content/index.tsx` (campo opcional `caseStudy` por proyecto), `src/lib/api/data.ts` (`getCaseStudies(lang)` y `CaseStudy` en la API de solo lectura), `src/lib/routing/pages.ts` y `src/lib/routing/request.ts` (la lista de slugs publicados cuenta como ruta conocida, que es el comentario «Fase 5» de `isUnknownHtmlPath`), `src/app/sitemap.ts` y `src/app/seo.ts`; create `src/app/[lang]/work/[slug]/page.tsx`, `src/chapters/CaseStudy.tsx`, `tests/case-study.test.tsx` y `e2e/case-study.spec.ts`.

- El modelo es `caseStudy?: { problem: {es,en}; role: {es,en}; outcome: {es,en}; updated: "AAAA-MM-DD" }`.
  - Solo se publica la página si están los tres textos en los dos idiomas (§3.4).
  - No se inventa nada. Hoy ningún proyecto los tiene, así que no se publica ninguna página. La infraestructura se prueba con un proyecto de fixture solo en los tests.
- `generateStaticParams` solo devuelve los slugs publicados y `dynamicParams = false`. Un slug sin caso da el 404 a medida.
- La página lleva:
  - frase de respuesta, problema, rol, stack, resultado, enlaces y `<time datetime>` visible con `updated`;
  - el reel de la fase 4 si existe;
  - un `@graph` con `CreativeWork` o `SoftwareSourceCode` (si hay repositorio) con `author` hacia `#person`.
- Al menos tres enlaces internos llegan a cada caso: la ficha de la home, `llms.txt` y `llms-full.txt`, y el sitemap.
- Variante markdown por negociación y `noindex` en el `.md`, como el resto.

### Task 2: fechas desde git

**Files:** create `scripts/content-dates.mjs` y `src/lib/routing/content-dates.json` (generado y commiteado); modify `src/lib/routing/pages.ts` (`CONTENT_UPDATED` lee el JSON) y `.github/workflows/ci.yml` (paso que regenera y falla si hay diff, con `fetch-depth: 0`).

- Cada ruta declara los ficheros de los que sale su contenido (diccionarios, `content/index.tsx`, su capítulo). La fecha es el `git log -1 --format=%cs` más reciente de esos ficheros.
- Vercel no necesita la historia, porque lee el JSON commiteado. El CI comprueba que el JSON está al día, así que la fecha nunca es la del build (§8.4).

### Task 3: imagen OG por página

**Files:** modify `src/lib/seo/og-image.tsx` (recibe titular y frase), create `opengraph-image.tsx` en `about`, `contact`, `developers`, `privacy` y `work/[slug]`, y modify `src/lib/seo/metadata.ts` (`og:image:alt` por página).

- Cada imagen lleva el titular de su página y el retrato, a 1200x630, generada en el build.
- Un test comprueba que cada página publica su `og:image` y su `og:image:alt` en su idioma.

### Task 4: IndexNow

**Files:** create `public/<clave>.txt` y `.github/workflows/indexnow.yml`.

- La clave es aleatoria y se genera una vez. El fichero sirve la clave en texto plano.
- El workflow se dispara con `deployment_status` cuando el estado es `success` y el entorno es `Production`. Envía a `https://api.indexnow.org/indexnow` las URL del sitemap cuyo `lastmod` cambió desde el último despliegue de producción.
- No hace nada hasta que haya un despliegue a producción, o sea, después de fusionar.

### Task 5: lanzamiento

1. Abrir el PR de `feat/redesign-v3` contra `main`, con el resumen de las cinco fases. Revisar el CI (Lighthouse móvil con devtools para el LCP, escritorio, e2e) y la preview de Vercel.
2. En la preview, comprobar con curl que Vercel no bloquea a los bots de IA: GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Bingbot y DuckAssistBot, y esperar 200 en `/`, `/en`, `/llms.txt` y `/sitemap.xml`.
3. **Fusionar solo con el visto bueno del dueño.** Fusionar publica en producción.
4. Después de fusionar, el dueño hace los pasos manuales: Google Search Console (propiedad, sitemap e inspección de `/` y `/en`), Bing Webmaster (sitemap y AI Performance) y Brave Search. Se dejan escritos en `docs/superpowers/LANZAMIENTO.md`.

## Dependencias del dueño

- El contenido de cada caso de estudio, en ES y EN: el problema, qué hizo (rol) y el resultado. Sin él, las páginas no se publican, pero todo lo demás se lanza igual.
- La revisión de las traducciones al inglés (§11).
- El visto bueno para fusionar.
