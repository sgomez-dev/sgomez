# sgomez.dev v3: rediseño "keynote"

Fecha: 2026-09-30 · Autor: Santiago Gómez de la Torre · Estado: pendiente de revisión

## 1. Objetivo

La web debe servir a la vez para tres cosas: **hacer crecer la marca personal**, **conseguir proyectos freelance** y **abrir oportunidades de empleo**. El protagonista es Santiago Gómez de la Torre. Evenbytes y SkyQuetz son contexto, nunca el titular.

Calidad objetivo: una web de producto de Apple aplicada a una persona. Recorrerla tiene que ser una experiencia de principio a fin: movimiento, motion graphics, 3D y componentes que se construyen solos.

**Criterios de éxito**
1. En 5 segundos, alguien sabe quién es, qué hace y cómo contactarle.
2. Cada objetivo tiene su camino hasta el contacto, que registra la intención del visitante (freelance, empleo u otro).
3. Todo el contenido es legible sin JavaScript y desde el primer fotograma. Crawlers y agentes ven la página completa (hoy casi todo sale en blanco en una captura de página completa).
4. Presupuestos de rendimiento y accesibilidad (§7) medidos en CI y en una pasada real en navegador.
5. Las superficies para agentes existentes siguen funcionando igual (§3.1).

## 2. Dirección visual (aprobada en el compañero visual)

- **Estilo B, luminoso cinematográfico.** Fondo negro profundo `#05060A`, luz volumétrica azul/cian y un cristal 3D iridiscente como objeto de marca.
- **Tipografía:** Inter Tight para titulares y texto (600, tracking negativo en display) e Instrument Serif itálica para la segunda frase del titular y los acentos. Ambas con licencia OFL, autoalojadas con `next/font` y subconjunto latino.
- **Retrato protagonista** en el hero, iluminado con la luz del cristal y con parallax de profundidad suave. Dependencia de contenido: una foto nueva con fondo oscuro o neutro, luz lateral y ≥ 2400 px. Mientras no llega se usa la actual con un tratamiento de color.
- **Contraste, regla dura:**
  - Todo texto cumple WCAG AA (4,5:1 cuerpo, 3:1 display ≥ 24 px) en **todos** los estados de la animación.
  - El cristal y los brillos nunca pasan por detrás de un bloque de texto: tienen columna propia y, en móvil, van atenuados detrás de un velo.
  - Los titulares van en blanco sólido y la itálica en `#C9D1E6`. No se usan degradados hacia gris.
- **Paleta:**
  - Fondos: `#05060A`, `#0B0D14`, `#121624`.
  - Texto: `#F4F6FB` y `#AAB2C6`.
  - Acentos de luz: `#8FA8FF` y `#6EF0DC`.
  - Todos van como tokens CSS en `:root`.
- La navegación va **fija arriba**, compacta. La barra flotante inferior desaparece, porque hoy tapa el CTA «Hablemos».

## 3. Contenido

### 3.1 Se conserva
- `src/lib/api/data.ts` como fuente única del contenido.
- Toda la API `/api/v1/*`, OpenAPI (json/yaml), `llms.txt`, `agents.md`, la negociación de contenido, el sitemap y los tests actuales (`api`, `content`, `discovery`, `negotiate`, `openapi`).
- Sus contratos no cambian; solo se añade el parámetro opcional de idioma (§5).

### 3.2 Se elimina
- `/lab` completo (`app/lab/**`, `public/lab/**`), junto con `MacBook`, `MacInterlude`, `PlaygroundButton` y `BottomBar`.
- `/lab` y `/lab/*` responden 301 a `/{lang}`.

### 3.3 Capítulos de la home (guion aprobado)

| # | Capítulo | Contenido (de `data.ts`) | Momento principal | Técnica |
|---|---|---|---|---|
| 01 | Hero | nombre, rol, tagline, disponibilidad, CTA | retrato + cristal vivo que sigue al ratón; el nombre se escribe con luz | R3F en diferido + póster; Motion |
| 02 | Quién soy | bio, cifras | la bio se enciende palabra a palabra; las cifras cuentan | sección fijada + `useScroll` |
| 03 | Lo que construyo | stack por capas | sistema de IA despiezado (UI, API, modelo, RAG, evals, infra) que se monta con el scroll | secuencia Remotion → scrub en canvas |
| 04 | Experiencia | experiencia | la línea de tiempo se desliza en horizontal al bajar | scroll vertical → `translateX` |
| 05 | Proyectos | proyectos | ficha de producto: un dispositivo entra y reproduce el reel | reel Remotion + Motion |
| 06 | Open source | NudaUI, Claude Canvas, claude-skills | componentes que se construyen: plano → borde → relleno → contenido | DOM real + trazado SVG + Motion |
| 07 | SkyQuetz | consultora y sus 2 productos | el monograma se forma con fragmentos del cristal | secuencia Remotion corta |
| 08 | Prueba social | recomendaciones, certificaciones, formación, blog | citas grandes en secuencia; muro de insignias que se ensambla | layout animations + stagger |
| 09 | Contacto | email, perfiles, CV | vuelve el cristal; botón magnético | R3F compartido + Motion |

Las cifras del capítulo 02 salen de los datos, nunca escritas a mano:
- número de certificaciones;
- número de proyectos;
- años de experiencia: el año actual menos el año más antiguo que aparezca en los `period` de la experiencia. Si algún `period` no contiene un año de 4 cifras, la cifra no se muestra y un test falla.

Un test compara las tres con `data.ts`.

### 3.4 Páginas nuevas
- **Caso de estudio por proyecto**, en `/{lang}/work/{slug}`: reel, problema, rol, stack, resultado y enlaces. El `slug` ya existe en `data.ts`. Solo se publica un caso si tiene los campos `problem`, `role` y `outcome` escritos por Santiago; sin ellos, el proyecto se queda en la home sin página propia. No se inventa ningún resultado.
- **Contacto por intención**, en `/{lang}/contact`: tres caminos (proyecto freelance, oportunidad laboral, otro). Cada uno prefija el asunto y un guion breve del correo, y el de empleo ofrece además el CV. Canales: los que existen hoy (email, perfiles, CV). No se añade ningún servicio externo.
- La home, `/about`, `/contact`, `/developers` y `/privacy` se mantienen como rutas, rediseñadas y en los dos idiomas.

## 4. Arquitectura

```
sgomez/
  src/
    app/[lang]/…            páginas (home, work/[slug], about, contact, developers, privacy)
    app/api/…               sin cambios de contrato
    chapters/               un componente por capítulo del guion
    components/             nav, footer, cards, CTA, retrato
    motion/                 primitivas (cada una con su variante sin movimiento)
      TextReveal, StickyScene, ScrollSequence, BuildTrace, Magnetic, Counter, PageTransition
    three/                  GlassScene (R3F), cargado en diferido y solo en cliente
    i18n/                   diccionarios es/en y utilidades de idioma
    lib/api/data.ts         fuente única (textos → { es, en })
  public/media/             salida de Remotion: secuencias AVIF/WebP, reels MP4/WebM, pósters
video/                      proyecto Remotion aparte (NO se despliega)
```

- **Motion** (`motion`, sucesor de `framer-motion`, misma API) para toda la coreografía del DOM.
- **React Three Fiber + drei** solo en `three/`, detrás de `next/dynamic({ ssr: false })`. Se carga tras `requestIdleCallback` y solo si:
  - no está activo `prefers-reduced-motion`;
  - no está activo `Save-Data`;
  - el dispositivo tiene WebGL2 y `hardwareConcurrency ≥ 4`.
  En los demás casos se queda el póster o el loop de vídeo.
- **`ScrollSequence`** es el reproductor estilo Apple:
  - pinta fotogramas en `<canvas>` según el progreso del scroll;
  - carga primero 1 de cada 4 fotogramas en baja resolución y luego completa;
  - empieza a descargar cuando la sección está a 1 viewport;
  - en móvil usa la resolución media.
- **Remotion** vive en `video/`, con sus propias dependencias. Se renderiza en local con `npx remotion render` y la salida se commitea en `public/media/`. No hay render en la nube ni servicios de pago. Composiciones:
  - `BuildSequence`, el sistema despiezado, en `@remotion/three`;
  - `SkyQuetzMonogram`;
  - `HeroLoop`, el vídeo de reserva del hero;
  - un `ProjectReel` por proyecto, a partir de sus capturas.

## 5. Idiomas

- Rutas `/es` y `/en` bajo `[lang]`. `/` redirige según `Accept-Language` (307). Cada página lleva `hreflang` es/en/x-default y el sitemap incluye las dos versiones.
- En `data.ts`, cada texto visible pasa a ser `{ es, en }`. Un test falla si falta alguna traducción.
- Las cadenas de interfaz viven en `i18n/{es,en}.ts`, como plantillas con `fill()` y sin funciones pasadas a componentes cliente (lección de claude-skills).
- La API responde en español por defecto, como hoy, y acepta `?lang=en` o `Accept-Language: en`. `llms.txt` y `agents.md` se publican en los dos idiomas. La versión en español queda en la ruta actual.

## 6. Movimiento y accesibilidad

- **El contenido nunca depende de la animación.**
  - El HTML se sirve con el estado final visible.
  - La animación solo arranca en el cliente y solo si hay JS y está permitido el movimiento.
  - Nada usa `whileInView` con `opacity: 0` en el SSR.
- **`prefers-reduced-motion`:** cada primitiva tiene su variante estática. Las secuencias muestran el fotograma final, el cristal es una imagen, y las transiciones de página, el cursor propio y el parallax se desactivan.
- Hay control de pausa en cualquier movimiento que dure más de 5 s (el loop del hero).
- **Teclado:** foco visible, orden lógico y enlace «saltar al contenido». El botón magnético sigue siendo un `<a>` o `<button>` normal.
- **Cursor propio:** solo con puntero fino. Nunca oculta el cursor del sistema en campos de texto.

## 7. Presupuestos (se miden en CI)

| Métrica | Presupuesto |
|---|---|
| LCP (móvil, 4G lenta) | < 2,5 s. El LCP es el retrato o el titular, nunca el canvas 3D |
| CLS | < 0,05 |
| TBT | < 200 ms |
| JS inicial (gzip) | ≤ 170 KB. El chunk de R3F va aparte, en diferido y ≤ 250 KB |
| Secuencia de scroll | ≤ 4 MB en escritorio, ≤ 1,5 MB en móvil, cada una |
| Lighthouse SEO / a11y | 100 / ≥ 95 |
| Contraste | 0 violaciones de axe en todos los capítulos, con la animación en su estado final e intermedio |

## 8. SEO y GEO

**Objetivo.** Que cualquier buscador o asistente de IA (Google, AI Overviews, ChatGPT, Perplexity, Claude, Copilot) que responda sobre Santiago Gómez de la Torre, o sobre «ingeniero full-stack que lleva IA a producción en España», use sgomez.dev como fuente primaria y la cite. No podemos controlar el ranking de Google; sí podemos ser la fuente más clara, rápida, estructurada y verificable sobre ti.

**Se conserva** (ya es un punto fuerte): `llms.txt` con «When to use this», `agents.md`, OpenAPI, las variantes `.md` con `noindex` y su negociación `Accept: text/markdown`, el grafo de `seo.ts` (con `Person`, `ProfilePage`, `Speakable` y SkyQuetz como entidad separada) y el `Vary` de `vercel.json`.

**Se añade:**

1. **Texto que contesta primero.**
   - Cada página abre con una frase de respuesta directa en HTML real: quién eres, qué haces y dónde. Es la frase que citan los asistentes.
   - El titular creativo va encima, pero la respuesta está en el DOM desde el SSR.
   - `Speakable` apunta a esas frases.
2. **Grafo de entidad completo**, un `@graph` por página:
   - `Person` con `sameAs` a skills.sgomez.dev, GitHub, LinkedIn e Instagram, más `knowsAbout`, `worksFor` (Evenbytes), `founder` (SkyQuetz), `alumniOf` y `hasCredential` desde las certificaciones;
   - `WebSite`, `WebPage` o `ProfilePage` con `dateModified` real;
   - `CreativeWork` o `SoftwareSourceCode` para proyectos y open source;
   - `FAQPage` en contacto, con las preguntas reales de cada intención: disponibilidad, modalidad, zona horaria e idiomas.
   - Nada de `aggregateRating` ni de reseñas inventadas.
3. **Bilingüe de verdad:**
   - `hreflang` es/en/x-default en HTML, en el sitemap y en las variantes `.md`;
   - `llms.txt` y `/en/llms.txt`, más `llms-full.txt` con todo el contenido en Markdown;
   - `agents.md` en los dos idiomas.
4. **Fechas honestas:**
   - `lastmod` del sitemap y `dateModified` desde la fecha real de cambio del contenido (git), nunca la hora del build;
   - `<time datetime>` visible en los casos de estudio.
5. **`robots.txt` al día:**
   - añade `Content-Signal: search=yes, ai-input=yes, ai-train=yes`, la misma decisión que en claude-skills;
   - quita `Host:`, que no es estándar;
   - añade `DuckAssistBot` y `MistralAI-User`;
   - mantiene la lista actual de bots de IA y el sitemap.
6. **Enlazado:**
   - enlace visible y recíproco con **skills.sgomez.dev** (paso L2.4 del lanzamiento de claude-skills) y con blog.sgomez.dev;
   - los casos de estudio enlazan su stack y su proyecto open source relacionado;
   - cada caso de estudio recibe al menos 3 enlaces internos.
7. **Rendimiento como SEO:** los presupuestos del §7. El LCP es texto o retrato servido en el HTML, nunca el 3D.
8. **Descubrimiento activo, tras el lanzamiento:**
   - IndexNow (fichero de clave en `public/` y envío de las URLs cambiadas en cada despliegue, desde CI);
   - pasos manuales para Santiago en Google Search Console, Bing Webmaster (AI Performance) y Brave;
   - comprobación de que Vercel no bloquea a los bots de IA (con curl de cada user agent, esperando 200).
9. **Imágenes OG** por página e idioma, con el titular y el retrato, y `og:image:alt`.
10. **Tests:**
    - `@graph` válido y con los tipos esperados en cada página;
    - `hreflang` recíproco;
    - `llms.txt` por debajo de 100 KB y con la estructura de llmstxt.org;
    - `robots.txt` con Content-Signal y sin `Host`;
    - cada página tiene su frase de respuesta visible sin JS.

## 9. Pruebas y verificación

- **Unitarias (vitest):**
  - las existentes;
  - que no falte ninguna traducción en `data.ts` ni en los diccionarios;
  - que las cifras salgan de los datos;
  - que `/lab` redirija;
  - que la API mantenga su forma por defecto y acepte `lang`.
- **E2E (Playwright), nuevas:**
  - todo el texto de cada capítulo es visible con JS desactivado;
  - no hay scroll horizontal a 375 px;
  - `prefers-reduced-motion` desactiva las secuencias y el cristal;
  - axe sin violaciones;
  - el presupuesto de JS;
  - los tres caminos de contacto generan el `mailto` correcto;
  - `hreflang` y redirección de `/`.
- **Lighthouse CI** con los presupuestos del §7 contra la preview de Vercel de cada PR. Se mide con Chromium de Playwright y no con el Chrome del equipo, porque el filtro SSL de ESET invalida el LCP.
- **Pasada real en navegador** al final de cada fase, antes de darla por terminada: escritorio y móvil, capturas de cada capítulo en estado inicial, intermedio y final.

## 10. Fases

1. **Cimientos:** tokens, fuentes, `[lang]` e i18n, datos bilingües, nav y footer, eliminación de `/lab`, páginas en su estado estático final. Ya se puede publicar en este punto: es la web nueva sin el movimiento avanzado.
2. **Movimiento del DOM:** primitivas de `motion/` y los capítulos 02, 04, 06, 08 y 09.
3. **3D en vivo:** `GlassScene` en el hero y el contacto, con sus reservas.
4. **Taller Remotion:** `BuildSequence`, `SkyQuetzMonogram`, `HeroLoop`, los reels y `ScrollSequence` (capítulos 03, 05 y 07).
5. **Casos de estudio, contacto por intención, SEO/GEO y lanzamiento.**

Cada fase va en su propio PR contra `main`, con preview de Vercel y Lighthouse CI. `main` exige PR.

## 11. Dependencias de contenido (las aporta Santiago)

- Retrato nuevo (§2).
- Para cada caso de estudio: `problem`, `role` y `outcome`, más capturas o grabaciones para su reel.
- Revisión de las traducciones al inglés.

## 12. Fuera de alcance

Blog propio (se sigue leyendo de blog.sgomez.dev), formularios con backend, analítica de pago, CMS y el onboarding o las demos de claude-skills.
