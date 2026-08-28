# sgomez.dev

Portfolio personal de **Santiago Gómez de la Torre Romero** — Full-Stack Engineer en Evenbytes y cofundador de [SkyQuetz Consulting](https://skyquetz.com) (Santander, España).

> Una landing que de verdad muestra quién soy: experiencia, proyectos, stack, certificaciones y recomendaciones, con interludios estilo terminal y un /lab para experimentos.

**Producción:** [sgomez.dev](https://sgomez.dev)

---

## Stack

- **Next.js 16** (App Router, RSC, ISR)
- **React 19**
- **TypeScript** (strict)
- **Tailwind CSS 4**
- **Framer Motion** para animaciones
- **Geist** / **Geist Mono** (fuentes)

Deploy en **Vercel**.

---

## Secciones

La home compone, en orden:

- `HeroSection` — entrada con foto, rol y CTA.
- `AboutSection` — sobre mí.
- `MacInterlude` — bloque tipo terminal con `neofetch` (perfil) y `ls ~/projects` (proyectos).
- `ExperienceSection` — experiencia profesional.
- `SkyQuetzSection` — la consultora cofundada, con sus dos productos propios.
- `TechnologiesSection` — stack y herramientas.
- `ProjectsSection` — proyectos destacados con enlaces.
- `CertificationsSection` — 18+ certificaciones.
- `RecommendationsSection` — recomendaciones de compañeros y clientes.
- `EducationSection` — formación.
- `ContactSection` — contacto directo.

Componentes flotantes: `PlaygroundButton`, `BottomBar`, `DownloadCVButton`.

Y un **/lab** con experimentos visuales / prototipos.

---

## Estructura del repo

```
sgomez/
├── LICENSE
├── README.md               ← este archivo
└── sgomez/                 ← proyecto Next.js
    ├── src/
    │   ├── app/
    │   │   ├── about/  contact/  privacy/  developers/   ← páginas de contenido
    │   │   ├── api/                                      ← API pública v1 + OpenAPI
    │   │   ├── components/
    │   │   ├── content/
    │   │   ├── lab/
    │   │   ├── agents.md/  llms.txt/  openapi.json/      ← ficheros para agentes
    │   │   ├── layout.tsx
    │   │   ├── not-found.tsx
    │   │   ├── page.tsx
    │   │   └── sitemap.ts
    │   ├── lib/
    │   │   ├── api/          ← datos, respuestas, errores y especificación
    │   │   ├── content/      ← texto de las páginas, como datos
    │   │   ├── markdown/     ← negociación de contenido y render markdown
    │   │   └── site.ts       ← catálogo de rutas y constantes canónicas
    │   └── proxy.ts          ← negociación Accept: text/markdown
    ├── tests/                ← vitest
    ├── public/
    │   ├── CV_Santiago_Gómez_de_la_Torre_Romero.pdf
    │   ├── Santiago_Gómez_de_la_Torre_Romero.png
    │   ├── brand/                ← logotipo de SkyQuetz (copia del repo de la marca)
    │   ├── lab/
    │   └── robots.txt
    ├── next.config.ts
    ├── vercel.json
    ├── package.json
    └── tsconfig.json
```

---

## Cómo arrancar

```bash
cd sgomez
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Scripts disponibles:

| Comando | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | ESLint |
| `npm test` | Tests (vitest) |

---

## SEO

- `metadata` completa con OpenGraph y Twitter Card.
- JSON-LD `Person` con `sameAs` (LinkedIn, GitHub).
- `sitemap.ts` dinámico.
- `robots.txt` propio.
- `lang="es"` y `locale: "es_ES"`.
- `/llms.txt` generado desde el mismo `IDENTITY` que el JSON-LD, para que las dos
  fuentes no divergan.

Detalle en `sgomez/src/app/layout.tsx` y en `sgomez/src/app/seo.ts`.

### Relación con SkyQuetz

**Son dos entidades distintas y el grafo las mantiene separadas.** sgomez.dev es
el perfil de una persona; SkyQuetz Consulting es una empresa en la que esa
persona es uno de cuatro socios fundadores. Lo único que se declara entre las dos
es la relación, nunca una identidad:

- `Person` (`#person`) — el desarrollador. Su `sameAs` lleva **solo sus propias
  propiedades**: nudaui.dev, el blog, GitHub, LinkedIn, npm. `skyquetz.com` NO
  está ahí, y no debe estarlo: `sameAs` significa "esto también es él", y una
  empresa con tres socios más no es él.
- `Organization` (`#skyquetz-org`) — la empresa. Su `sameAs` apunta al `@id` que
  skyquetz.com usa para sí misma (`https://skyquetz.com/#org`). Eso es lo único
  que ese `sameAs` dice: que este nodo y ese nodo son la misma EMPRESA, no que
  los dos dominios sean lo mismo.
- Entre las dos, `worksFor` / `memberOf` / `affiliation` en un sentido y
  `founder` / `member` en el otro. Una relación laboral y de fundación, que es
  exactamente lo que hay.

La otra mitad ya existía: skyquetz.com declara a Santiago como cofundador con
`sameAs: ["https://sgomez.dev"]`. Las dos mitades importan, porque una afirmación
en un solo sentido es una afirmación sin confirmar. Por eso los datos de
`content/index.tsx` (fecha de fundación, número de socios, eslogan) tienen que
ser los MISMOS que publica skyquetz.com: si se contradicen, el emparejamiento de
la empresa se rompe.

Y por eso **"cofundador", nunca "fundador"**: son cuatro socios. `/llms.txt` lo
dice tres veces a propósito, porque es el error que un modelo comete solo.

---

## Para agentes

La web se publica dos veces: en HTML para una persona y en formato legible por
máquina para un agente. Las dos salidas se generan del MISMO dato (`content/` y
`seo.ts`), así que no pueden contradecirse.

| Superficie | Qué es |
|---|---|
| `/llms.txt` | Resumen factual del sitio, con una sección **when to use this**. |
| `/agents.md` | Instrucciones de uso: cuándo es esta la fuente correcta y cómo llamarla. |
| `/openapi.json`, `/api/openapi.yaml` | Especificación OpenAPI 3.1 de la API pública. |
| `/api/v1/*` | API REST de solo lectura, sin autenticación y con CORS abierto. |
| `/developers` | Portal: quickstart, tabla de endpoints, errores, versionado. |
| `Accept: text/markdown` | Cualquier página responde en markdown en su URL canónica. También sirve `/about.md`. |

Tres decisiones que conviene no deshacer sin querer:

- **Los errores de `/api` son siempre JSON**, incluidos los 404 y los 405. El
  comodín `api/[...path]` existe justo para eso: sin él, un endpoint mal
  escrito devolvería la página de error en HTML, que un agente no sabe leer.
- **El 404 lleva cuerpo.** Publica el mapa del sitio (páginas, ficheros para
  máquinas y puntos de entrada de la API) en HTML y en markdown. Un 404 vacío
  obliga al agente a adivinar la siguiente URL.
- **`Vary: Accept` en las páginas lo fija `vercel.json`.** Next 16 sobreescribe
  esa cabecera al final del pipeline, así que ni el proxy ni `headers()` de
  `next.config.ts` bastan. Los tres declaran el mismo valor —con los cuatro
  tokens de RSC dentro, o se rompe el prefetch— y hay un test que comprueba que
  no se separan.

## Ecosistema

Este repo es la **landing**. Otros proyectos relacionados:

- [`blog.sgomez.dev`](https://blog.sgomez.dev) — blog personal (repo independiente).
- [`skyquetz.com`](https://skyquetz.com) — la consultora cofundada (repo independiente),
  con [`synentria.skyquetz.com`](https://synentria.skyquetz.com) y
  [`packatrack.skyquetz.com`](https://packatrack.skyquetz.com) como productos propios.
- Otros proyectos enlazados desde la sección `Projects` de la home.

---

## Contacto

- Web: [sgomez.dev](https://sgomez.dev)
- GitHub: [@sgomez-dev](https://github.com/sgomez-dev)
- LinkedIn: [sgomez-dev](https://linkedin.com/in/sgomez-dev)

---

## Licencia

Ver [LICENSE](LICENSE).
