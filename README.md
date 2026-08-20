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
