# sgomez — landing

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

## Stack

- Next.js 16 · React 19 · TypeScript
- Tailwind CSS 4
- Framer Motion
- Fuentes Geist / Geist Mono via `next/font`

## Estructura

```
src/app/
├── components/      ← secciones y UI de la landing
├── content/         ← datos estáticos (experiencia, proyectos, etc.)
├── lab/             ← /lab — experimentos
├── layout.tsx       ← metadata global, JSON-LD Person
├── page.tsx         ← composición de la home
└── sitemap.ts

public/
├── CV_Santiago_Gómez_de_la_Torre_Romero.pdf
├── Santiago_Gómez_de_la_Torre_Romero.png
├── lab/
└── robots.txt
```

## Deploy

Vercel — `main` despliega a producción automáticamente.
