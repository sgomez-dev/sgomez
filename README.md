# sgomez.dev

Portfolio personal de **Santiago Gómez de la Torre Romero**, Full-Stack Engineer en Evenbytes y cofundador de [SkyQuetz Consulting](https://skyquetz.com) (Santander, España).

> Una web que cuenta quién soy y que también se puede leer sin ojos: la misma información sale en HTML para una persona y en markdown, JSON y OpenAPI para un agente.

**Producción:** [sgomez.dev](https://sgomez.dev) (español) y [sgomez.dev/en](https://sgomez.dev/en) (inglés).

---

## Stack

- **Next.js 16** (App Router, RSC, ISR) y **React 19**
- **TypeScript** estricto
- **Tailwind CSS 4** con tokens de diseño propios
- **Framer Motion** para el movimiento
- **Inter Tight** e **Instrument Serif** vía `next/font`, servidas desde el propio dominio

Deploy en **Vercel**.

---

## Estructura de la v3

El español va sin prefijo (`/`, `/about`) y el inglés bajo `/en` (`/en`, `/en/about`). Una sola ruta dinámica `[lang]` sirve los dos idiomas: el proxy reescribe `/about` a `/es/about` por dentro, `/es/*` redirige a la URL sin prefijo y `/lab` redirige a la home.

```
sgomez/
├── README.md               ← este archivo
└── sgomez/                 ← proyecto Next.js
    ├── src/
    │   ├── app/
    │   │   ├── [lang]/                 ← layout, home y páginas (about, contact, developers, privacy)
    │   │   ├── api/                    ← API pública v1 y OpenAPI
    │   │   ├── content/                ← datos de la web (experiencia, proyectos, recomendaciones)
    │   │   ├── styles/tokens.css       ← tokens de diseño
    │   │   ├── seo.ts                  ← identidad y grafo JSON-LD
    │   │   └── llms.txt/  agents.md/   ← ficheros para agentes
    │   ├── chapters/                   ← los capítulos de la home, uno por componente
    │   ├── components/                 ← nav, pie, selector de idioma, retrato
    │   ├── i18n/                       ← diccionarios es y en, y utilidades de idioma
    │   ├── lib/
    │   │   ├── api/  content/  machine/  markdown/  routing/  seo/
    │   │   └── site.ts                 ← catálogo de rutas y constantes canónicas
    │   └── proxy.ts                    ← idioma, reescritura y negociación Accept: text/markdown
    ├── tests/                          ← vitest
    ├── e2e/                            ← Playwright
    └── public/
```

### Capítulos

La home compone nueve capítulos, en este orden: `Hero`, `About`, `Build`, `Experience`, `Projects`, `OpenSource`, `SkyQuetz`, `Proof` (recomendaciones, certificaciones, formación y últimas entradas del blog) y `Contact`. Cada uno es un componente de servidor en `src/chapters/`. Todo el texto está en el HTML del servidor y se ve sin JavaScript.

### Idiomas

Cada texto visible existe en español y en inglés. Las cadenas de interfaz viven en `src/i18n/dictionaries/` (el tipo del inglés obliga a que no falte ninguna clave) y el contenido largo en `src/app/content/` y `src/lib/content/pages.ts`, siempre como pares `{ es, en }`. Las recomendaciones se muestran en español y, en la versión inglesa, con su traducción etiquetada y el original en un desplegable.

### Tokens de diseño

`src/app/styles/tokens.css` define los colores (fondo, texto, luz), la escala tipográfica fluida (`--step-*`), el espaciado y las zonas seguras (`--safe-*`). Los componentes usan los tokens y `clamp()` en lugar de tamaños fijos, y un test comprueba el contraste WCAG AA de las parejas de color.

### Superficies para agentes

| Superficie | Qué es |
|---|---|
| `/llms.txt` y `/en/llms.txt` | Resumen factual del sitio, con una sección **when to use this**. |
| `/llms-full.txt` y `/en/llms-full.txt` | Todo el contenido del sitio en markdown. |
| `/agents.md` y `/en/agents.md` | Instrucciones de uso: cuándo es esta la fuente correcta y cómo llamarla. |
| `/openapi.json`, `/api/openapi.yaml` | Especificación OpenAPI 3.1 de la API pública. |
| `/api/v1/*` | API REST de solo lectura, sin autenticación y con CORS abierto. En español por defecto; `?lang=en` o `Accept-Language: en` la sirven en inglés. |
| `/developers` y `/en/developers` | Portal: quickstart, tabla de endpoints, errores y versionado. |
| `Accept: text/markdown` | Cualquier página responde en markdown en su URL canónica. También sirve `/about.md` y `/en/about.md`, con sus `Link` hreflang. |

Las salidas se generan del mismo dato (`content/` y `seo.ts`), así que HTML, markdown y JSON-LD no pueden contradecirse. Todo enlace a un fichero de máquina pasa por `machineHref(path, lang)`, para que una página inglesa nunca mande al fichero español.

Tres decisiones que conviene no deshacer sin querer:

- **Los errores de `/api` son siempre JSON**, incluidos los 404 y los 405. El comodín `api/[...path]` existe para eso: sin él, un endpoint mal escrito devolvería una página HTML que un agente no sabe leer.
- **El 404 lleva cuerpo.** Publica el mapa del sitio (páginas, ficheros para máquinas y puntos de entrada de la API) en HTML y en markdown.
- **`Vary: Accept` en las páginas lo fija `vercel.json`, con una transformación de la respuesta.** Las páginas prerenderizadas salen de la caché de Vercel con el `Vary` que el builder guarda junto al HTML, y ese valor gana al proxy, a `headers()` de `next.config.ts` y a `headers` de `vercel.json`, incluso con `important`. Por eso `vercel.json` usa `routes` con `transforms` de tipo `response.headers` y `op: "set"`, lo único que lo sustituye en una preview real. Los tres sitios declaran el mismo valor, con los cuatro tokens de RSC dentro, y un test comprueba que no se separan. El workflow `post-deploy-smoke.yml` lo vuelve a comprobar con curl contra cada despliegue.

---

## Cómo arrancar

```bash
cd sgomez
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

| Comando | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | ESLint |
| `npm test` | Tests (vitest) |
| `npm run e2e` | Tests de navegador (Playwright); `E2E_PORT` fija el puerto |

---

## SEO

- `metadata` completa por página y por idioma, con canónica, hreflang (`es`, `en` y `x-default`), Open Graph y Twitter Card.
- Un solo `@graph` JSON-LD por página, con la persona, el sitio y la página.
- `sitemap.ts` con las dos versiones de cada URL.
- `robots.txt` propio.
- `/llms.txt` generado desde el mismo `IDENTITY` que el JSON-LD, para que las dos fuentes no divergan.

Detalle en `sgomez/src/app/seo.ts` y en `sgomez/src/lib/seo/`.

### Proyectos open source en el grafo

Cada proyecto propio es un nodo con su `@id`, y la persona lo firma con `author` y `creator`. Dos reglas que ya han hecho falta:

- **Un proyecto personal no cuelga de SkyQuetz.** La empresa `owns` Synentria y Packatrack porque son productos de la casa. Claude Canvas está bajo la cuenta personal, es MIT y no tiene cliente detrás. Si se colgara del nodo de la empresa, el grafo afirmaría que la consultora es su proveedora. Hay un test que lo impide.
- **Un fork se declara como fork.** El nodo de Claude Canvas lleva `isBasedOn` apuntando al repositorio de David Siegel, y `/llms.txt` y `/agents.md` lo repiten en prosa. Su README acredita el original en el primer párrafo y su LICENSE conserva el copyright, así que un grafo que se atribuyera la autoría entera contradiría a las dos fuentes que enlaza.

Los datos del proyecto viven una vez, en `CLAUDE_CANVAS` (`seo.ts`), y de ahí salen el JSON-LD, `/llms.txt`, la carta de la home y la entrada de `projects`.

### Relación con SkyQuetz

Son dos entidades distintas y el grafo las mantiene separadas. sgomez.dev es el perfil de una persona, y SkyQuetz Consulting es una empresa en la que esa persona es uno de cuatro socios fundadores. Entre las dos solo se declara la relación, nunca una identidad:

- `Person` (`#person`) es el desarrollador. Su `sameAs` lleva solo sus propias propiedades (nudaui.dev, el blog, GitHub, LinkedIn, npm). `skyquetz.com` no está ahí y no debe estarlo, porque `sameAs` significa "esto también es él".
- `Organization` (`#skyquetz-org`) es la empresa. Su `sameAs` apunta al `@id` que skyquetz.com usa para sí misma (`https://skyquetz.com/#org`), y eso solo dice que los dos nodos son la misma empresa.
- Entre las dos, `worksFor`, `memberOf` y `affiliation` en un sentido, y `founder` y `member` en el otro.

skyquetz.com declara a Santiago como cofundador con `sameAs: ["https://sgomez.dev"]`. Las dos mitades importan, porque una afirmación en un solo sentido está sin confirmar. Por eso los datos de `content/index.tsx` (fecha de fundación, número de socios, eslogan) tienen que ser los mismos que publica skyquetz.com.

Y por eso **"cofundador", nunca "fundador"**: son cuatro socios. `/llms.txt` lo dice tres veces a propósito, porque es el error que un modelo comete solo.

### El nombre

El nombre se escribe entero: **Santiago Gómez de la Torre Romero** (formal) o **Santiago Gómez de la Torre** (corto). "Gómez de la Torre" es un apellido compuesto, y abreviarlo a "Santiago Gómez" lo parte por la mitad. Varios tests lo vigilan.

---

## Estilo del texto

Ningún texto que lea una persona o un agente lleva raya larga, semirraya ni doble guion. Se escriben frases con comas, puntos, paréntesis o «·» como separador de etiquetas. Un test serializa los diccionarios, los grafos JSON-LD, los ficheros de máquina y el markdown de cada ruta, y falla si encuentra alguna. Las citas de las recomendaciones son palabras de sus autores y quedan fuera.
