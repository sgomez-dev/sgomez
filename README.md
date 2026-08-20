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
    │   └── app/
    │       ├── components/
    │       ├── content/
    │       ├── lab/
    │       ├── layout.tsx
    │       ├── page.tsx
    │       └── sitemap.ts
    ├── public/
    │   ├── CV_Santiago_Gómez_de_la_Torre_Romero.pdf
    │   ├── Santiago_Gómez_de_la_Torre_Romero.png
    │   ├── brand/                ← logotipo de SkyQuetz (copia del repo de la marca)
    │   ├── lab/
    │   └── robots.txt
    ├── next.config.ts
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

`seo.ts` declara un nodo `Organization` (`#skyquetz-org`) cuya `sameAs` apunta al
`@id` que skyquetz.com usa para sí misma (`https://skyquetz.com/#org`), más
`founder`/`member` de vuelta al `Person`. La otra mitad ya existía: skyquetz.com
declara a Santiago como cofundador con `sameAs: ["https://sgomez.dev"]`.

Las dos mitades importan. Una afirmación en un solo sentido es una afirmación sin
confirmar; con los dos dominios diciendo lo mismo y con los mismos
identificadores, deja de ser un enlace y pasa a ser una relación entre entidades.
Por eso los datos de `content/index.tsx` (fecha de fundación, número de socios,
eslogan) tienen que ser los MISMOS que publica skyquetz.com: si se contradicen,
el emparejamiento se rompe y no vale nada.

---

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
