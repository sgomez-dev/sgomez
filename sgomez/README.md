# sgomez, la web

Aplicación Next.js que sirve [sgomez.dev](https://sgomez.dev). El README general del repo está en [`../README.md`](../README.md).

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build |
| `npm run lint` | ESLint |
| `npm test` | Tests (vitest) |
| `npm run e2e` | Tests de navegador (Playwright); `E2E_PORT` fija el puerto |

El e2e levanta su propio servidor de producción con `BLOG_API_DISABLED=1`, para que las pruebas no dependan de blog.sgomez.dev.

## Stack

- Next.js 16 · React 19 · TypeScript
- Tailwind CSS 4 con tokens propios
- Framer Motion
- Inter Tight e Instrument Serif vía `next/font`

## Estructura

```
src/
├── app/
│   ├── [lang]/          ← layout, home y páginas; sirve es (sin prefijo) y en (/en)
│   ├── api/             ← API pública v1 y OpenAPI
│   ├── content/         ← datos de la web (experiencia, proyectos, recomendaciones)
│   ├── styles/          ← tokens.css, los tokens de diseño
│   ├── seo.ts           ← identidad y grafo JSON-LD
│   └── llms.txt/  agents.md/  openapi.json/   ← ficheros para agentes
├── chapters/            ← los nueve capítulos de la home
├── components/          ← nav, pie, selector de idioma, retrato
├── i18n/                ← diccionarios es y en
├── lib/                 ← api, content, machine, markdown, routing, seo
└── proxy.ts             ← idioma, reescritura y negociación de markdown

public/
├── CV_Santiago_Gómez_de_la_Torre_Romero.pdf
├── Santiago_Gómez_de_la_Torre_Romero.png
├── brand/
└── robots.txt
```

El español va sin prefijo y el inglés bajo `/en`. Los tokens de diseño (colores, escala fluida `--step-*`, zonas seguras) están en `src/app/styles/tokens.css`. Las superficies para agentes y las decisiones de SEO se explican en el README general.

## Deploy

Vercel. `main` despliega a producción automáticamente.
