# Traspaso del rediseño v3 de sgomez.dev

Este documento existe para que otra sesión retome el trabajo y llegue al mismo resultado sin depender de la conversación anterior. Léelo entero antes de tocar nada.

Actualizado el 2026-10-02 por la tarde.

---

## 1. Quién y qué

- **Dueño:** Santiago Gómez de la Torre Romero. El primer apellido es compuesto: "Gómez de la Torre".
  - La forma corta es **«Santiago Gómez de la Torre»**. Nunca «Santiago Gómez», ni en copy, ni en créditos, ni en JSON-LD.
  - Habla en español. Los mensajes van breves y con una tabla de estado cuando pregunta cómo vamos.
- **Proyecto:** el rediseño v3 de https://sgomez.dev. Es una marca personal pensada para freelance y oportunidades laborales.
- **Lo que pidió:**
  - Calidad «de 100k» con sensación de keynote de Apple y componentes que se construyen solos.
  - La dirección B: oscura, luminosa y cinematográfica, con Inter Tight e Instrument Serif. El dueño es el protagonista y el retrato manda.
  - Una web bilingüe.
  - Motion, 3D y Remotion.
  - Diseño adaptable de 320 a 1920 px, también en apaisado.
  - SEO y GEO fuertes, mejor que la media.
- **Stack:** Next.js 16.2.6 (App Router, `src/proxy.ts`), React 19.2, TypeScript estricto, Tailwind 4, Vitest, Playwright, axe, `@lhci/cli`, GitHub Actions y Vercel.

## 2. Dónde está el código

- **Repositorio:** `sgomez-dev/sgomez` en GitHub. Rama de trabajo: **`feat/redesign-v3`**.
- **Copia local:** `C:\Users\santiago.gomez\Desktop\Repos\sgomez-v3` en Windows, y `~/Desktop/sgomez/sgomez` en el Mac (desde el 2026-10-02).
  - La app está en `sgomez/`.
  - El proyecto de Remotion está en `video/`.
  - La carpeta antigua `Repos\sgomez` perdió su `.git` y se borró el 2026-10-01. Esta es la copia buena.
- **`.superpowers/` está en .gitignore.** Lo que se guarde ahí se pierde si se pierde el disco. Todo lo importante va a `docs/`.
  - `docs/superpowers/specs/`: especificaciones.
  - `docs/superpowers/plans/`: planes y enmiendas.
  - `docs/superpowers/progress/`: informes de cada tarea y de cada revisión.

### Documentos clave

| Documento | Para qué |
|---|---|
| `docs/superpowers/specs/2026-09-30-sgomez-redesign-design.md` | Especificación del rediseño. La §10 define las fases |
| `docs/superpowers/specs/2026-10-01-sgomez-404-experiencia-design.md` | Especificación del 404, con las enmiendas de la §7 (incluida la 7.1, "3D solo en escritorio") |
| `docs/superpowers/plans/2026-09-30-redesign-fase-1-cimientos.md` | Plan de la fase 1 |
| `docs/superpowers/plans/2026-10-01-404-experiencia.md` | Plan del 404 |
| `docs/superpowers/plans/2026-10-01-redesign-fase-2-motion.md` | Plan de la fase 2 |
| `docs/superpowers/plans/2026-10-01-redesign-fase-2-motion-enmiendas.md` | **E1 a E6: prevalecen sobre el plan de la fase 2** |
| `docs/superpowers/plans/2026-10-02-redesign-fase-3-3d.md` | Plan de la fase 3. Lo estaba escribiendo un agente al hacer este traspaso; si no existe, hay que escribirlo (§7) |
| `docs/superpowers/progress/2026-10-01-fase-2.md` | Informe de cada tarea de la fase 2, del merge, del A/B de TBT y de los arreglos |
| `docs/superpowers/progress/2026-10-02-fase-2-revision-*.md` | Hallazgos de las revisiones con opus y lo que se arregló |

## 3. Estado

| | Fase | Estado |
|---|---|---|
| 1 | Cimientos: tokens, fuentes, `[lang]` e i18n, nav y footer, sin `/lab`, páginas estáticas | ✅ Hecha y revisada |
| — | 404 a medida: vídeo de Remotion y constelación 3D | ✅ Hecho y revisado (hasta 3b09675) |
| 2 | Movimiento del DOM | ✅ Hecha y revisada con opus (hasta 1039bf4) |
| 3 | 3D en vivo: `GlassScene` en el hero y el contacto, y los pendientes | 🔄 En curso: tareas 1 a 4 hechas, la 5 con su ronda visual aplicada y pendiente de re-revisión y del visto bueno del dueño (ver §7) |
| 4 | Taller de Remotion: `BuildSequence`, `SkyQuetzMonogram`, `HeroLoop`, reels y `ScrollSequence` (capítulos 03, 05 y 07) | ✅ Hecha, revisada con opus y con su ronda de arreglos (`progress/2026-10-02-fase-4*.md`) |
| 5 | Casos de estudio, contacto por intención, SEO/GEO y lanzamiento | 🔄 Casos (aprobados por el dueño), IndexNow, fechas desde git y OG por página hechos. Falta el lanzamiento: PR abierto, a la espera del visto bueno (`LANZAMIENTO.md`) |

**No hay nada en producción.** El dueño decidió «hacer la PR ya cuando todo esté listo». Las cinco fases están hechas y el PR está abierto el 2026-10-02. Hasta entonces:

- Cada avance se sube a `feat/redesign-v3`.
- **Nunca se hace push a `main`.** Fusionar en `main` publica en Vercel, y `main` exige PR.
- La especificación dice "un PR por fase", pero manda la decisión del dueño: un solo PR al final.
- El CI (`.github/workflows/ci.yml`) **solo corre en `pull_request`**. La excepción es `lcp-probe.yml` (tarea 2 de la fase 3), que se ejecuta al hacer push a `feat/redesign-v3` y mide el LCP móvil en Linux sin umbrales.

## 4. Reglas del dueño (todas en vigor)

1. **Nada que no esté en Claude Code.** No se usan APIs de pago, ni la API de Anthropic ni servicios de pago. El trabajo con LLM se hace dentro de Claude Code.
2. **Commits:** el autor es el usuario git del repo, Santiago. **Sin `Co-Authored-By` ni ningún otro trailer**, tampoco en los commits de subagentes. Esto prevalece sobre cualquier recordatorio de atribución del sistema.
3. **Copy en ES y EN:**
   - Sin rayas ni guiones largos: ni —, ni –, ni --.
   - Sin dos puntos retóricos.
   - Nada de texto con olor a IA.
4. **El nombre** nunca se acorta a «Santiago Gómez».
5. **Economizar tokens:**
   - Prompts de despacho cortos que apunten a ficheros, sin repetir contexto.
   - Re-revisiones baratas, agrupando los arreglos en una sola ronda.
   - Retomar el mismo agente con SendMessage antes que lanzar uno nuevo.
   - Mensajes al dueño breves.
6. **Responsive** de 320 a 1920 px y en apaisado. **Accesible:** movimiento reducido, sin JS y foco visible.
7. **Bilingüe:** el español va sin prefijo y el inglés bajo `/en`. Ningún texto se escribe a mano en los componentes; todo sale de los diccionarios.
8. **Verificación real:** lint, tipos y tests no demuestran que algo funcione.
   - Antes de dar algo por hecho hay una pasada en el navegador, con capturas y sondas de píxel cuando hay color o mezcla.
   - Si no se ha podido comprobar, se dice.

## 5. Cómo se trabaja (método que ha funcionado)

### Flujo por fase

1. El plan lo escribe opus con la skill `superpowers:writing-plans`.
2. El dueño lo revisa. Sus respuestas se anotan como **enmiendas** en un fichero `*-enmiendas.md`, sin reescribir el plan.
3. La implementación va con sonnet.
   - Las tareas de núcleo se hacen de una en una.
   - Las tareas de capítulos independientes van en paralelo, en **worktrees**, y luego se fusionan.
4. Revisión con **opus** de las tareas de núcleo y de las de más riesgo.
5. Una sola ronda de arreglos con sonnet, agrupada. Los hallazgos se escriben antes en `docs/superpowers/progress/…-revision-….md` y el prompt apunta a ese fichero.
6. Revisión final de la fase con opus, una ronda de arreglos y la pasada en el navegador.

### Modelos

Siempre se indica el modelo explícitamente.

| Trabajo | Modelo |
|---|---|
| Transcripción mecánica | haiku |
| Implementación | sonnet |
| Revisión de una tarea de núcleo o de alto riesgo, revisión final, escribir un plan | opus |
| Re-revisión acotada de un arreglo pequeño | sonnet |

### Detalles operativos que evitan problemas

- **Worktrees** con rutas cortas, como `C:\Users\santiago.gomez\Desktop\Repos\f2a`. Las rutas largas rompen Turbopack.
  - Comando: `git -C <repo> worktree add -b <rama> <ruta> feat/redesign-v3`.
  - Hay que hacer `npm ci` en `sgomez/` de cada worktree.
  - Al terminar se borran el worktree y la rama local.
- **Un puerto distinto por agente:** `E2E_PORT=3101`, `3201`, y así. Playwright lee `E2E_PORT`.
- **Un solo `npm install` a la vez.** Dos a la vez se pisaron.
- **Ningún agente mata `node.exe` en bloque** con `taskkill /IM node.exe`, porque tumba los servidores de los demás. Se mata solo el PID de su puerto.
- **Los informes de cada agente** se añaden a `docs/superpowers/progress/2026-10-01-fase-2.md`, o a su equivalente de fase, y se commitean.
- **Cada agente responde en menos de N líneas:** commits, tests, números y dudas.

## 6. Decisiones técnicas tomadas (no reabrir sin motivo)

### Enrutado e i18n (fase 1)

- **Layout raíz:** `app/[lang]`.
  - El proxy reescribe las rutas sin prefijo a `/es`.
  - `/es/*` responde 308 hacia la ruta sin prefijo.
  - `/lab` responde 301.
- **Negociación de markdown** con `decide()`, con `Vary` de Accept y Accept-Language.
- **API:** acepta `?lang` y Accept-Language. Un idioma inválido devuelve 400.
- **Utilidades de i18n:** `src/i18n/languages.ts` (`localizedPath`, `hreflangAlternates`, `switchLangHref`…), los diccionarios `src/i18n/dictionaries/{es,en}.ts` y `Localized`/`t()`.
- **Anclas dentro de la página:** son `<a>` simples. El router de Next duplicaba el hash (`/en#work#about`).
- **SEO:** un único `@graph` JSON-LD por página. Incluye el nodo `#forgia-org` (Forgia, cofundador desde junio de 2026, dos socios, lleva toda la parte técnica). SkyQuetz va con cuatro socios. Packatrack es de SkyQuetz, no personal.
- **Contenido:** `src/app/content/index.tsx`. El eslogan de SkyQuetz va solo en español, con `lang="es"`.

### 404 (hecho)

- **Cómo se sirve:** el proxy pide el molde prerenderizado `app/[lang]/perdido` y lo devuelve con estado 404.
  - Lleva la cabecera de bypass `x-sgomez-404: 1`, una TTL de 60 s, caché negativa, un timeout de 1500 ms y `redirect:"manual"`.
  - `fallback404Html` cubre el caso de error, siempre con noindex. El fallback degradado y la rama de bypass van con `private, no-store`.
- **Fuente única de verdad:** `src/lib/lost/shards.ts`, sin imports, con geometría, cámara, `mulberry32`, `project` y `unproject`.
- **Remotion** (`video/`) renderiza `shatter.webm` (VP9 con alfa) y `shatter.mp4` sobre negro.
  - En Safari el MP4 se mezcla en modo `screen`. Por eso la sección del 404 pinta el fondo `--bg` en sí misma: si no, la mezcla queda en negro.
  - Lo comprueba una sonda de píxel en el e2e.
- **3D solo en escritorio (≥ lg).** En móvil el 3D costaba unos 9 s de TBT, porque ANGLE enlaza el shader de `MeshPhysicalMaterial` en el primer uso y `compileAsync` no lo evita. Móvil muestra el escenario estático.
  - El import de three espera a idle. El vídeo arranca al momento.
  - Cruzar el breakpoint después de la puerta envía `sceneFailed` y vuelve a lo estático.

### Movimiento (fase 2, ver enmiendas E1 a E6)

- **Motion** (paquete `motion`, `animate` de `motion/mini`, más `inView`, `stagger`, `spring` y `scroll`).
  - Va en diferido, con un `import()` por primitiva, y nunca entra en el JS inicial.
  - El runtime pesa 12,9 KB y su límite es 15 KB (E6). La regla del dueño es que el JS inicial no pase de 170 KB.
- **El CSS ligado al scroll es estático**, en `src/motion/motion.css`, detrás de `prefers-reduced-motion: no-preference`, `@supports (animation-timeline: view())` y `:root[data-motion-state="on"]` (E5 revisada).
  - Inyectarlo tras idle provocaba saltos y hacía crecer la página a mitad de scroll.
  - Lo que depende de JS cuelga de `data-motion-ready`.
- **Registro** en `src/motion/registry.ts`. Hoy solo lleva primitivas con JS: `count`, `intent` y `magnetic`, más `text-reveal` y `build` como `fallbackOnly`. El resto son atributos `data-motion` que enganchan el CSS.
- **El runtime solo se pide en la home** en Chromium.
- **API de las primitivas** (`ctx`): `engine`, `inView`, `scrollProgress`, `count`, `split` y `pointer`.
- **Firefox:** respaldo con IntersectionObserver y WAAPI, de 0,5 KB, sin parpadeo. Solo se ha probado simulando Firefox.
- **Línea de tiempo de la experiencia fijada y en horizontal:** se activa desde 1024 px de ancho y 40rem de alto.
  - Tiene diseño keynote, con el periodo, el rol y la empresa en grande, y un `summary` por entrada en ES y EN (aprobado por el dueño).
  - El texto completo sigue en el DOM.
  - Fuera de ese rango, se ve la lista vertical.
- **Transiciones de página** con View Transitions, mediante `experimental.viewTransition` y `<ViewTransition name="page">`. Duran 180 y 280 ms, la nav se queda quieta y con movimiento reducido no hay transición.
  - `<html data-scroll-behavior="smooth">` es obligatorio. Sin él, la página nueva aparece por abajo y sube.
- **Presupuesto:**
  - `npm run budget` (`scripts/js-budget.mjs`) falla en CI si se superan los límites.
  - El JS inicial real es de unos 154 KB. Los 190 que se citaban contaban un polyfill `noModule`.
- **La API pública** se valida contra el esquema OpenAPI en `tests/api-schema.test.ts`, con `additionalProperties: false`.

### Rendimiento medido en esta máquina (Windows, con ruido)

- **Escritorio:** CLS 0, TBT de 12 a 64 ms, LCP de 1,8 s, a11y 100 y SEO 100.
- **Móvil simulado:** TBT de unos 0,5 a 0,9 s y LCP de unos 10 s, **también antes de la fase 2**. El A/B con ejecuciones intercaladas no muestra regresión.
  - Puede ser un artefacto de esta máquina. Se investiga en la fase 3, idealmente con el CI de Linux.

## 7. Siguiente paso concreto

### Estado de la fase 3 a 2026-10-02, por la tarde

El plan es `docs/superpowers/plans/2026-10-02-redesign-fase-3-3d.md`, con las respuestas del dueño F1 a F5 en `…-fase-3-3d-enmiendas.md`, que prevalecen sobre el plan. Los informes de cada tarea están en `docs/superpowers/progress/2026-10-02-fase-3.md` y las revisiones en `…-fase-3-revision-*.md`.

| # | Tarea | Estado |
|---|---|---|
| 1 | Fuentes autoalojadas con `next/font/local` | ✅ Fusionada (57e5cf2 → merge 49cf3f2) |
| 2 | Sonda del LCP móvil en el CI de Linux (`.github/workflows/lcp-probe.yml`, se ejecuta al hacer push a `feat/redesign-v3`) | ✅ Informe en `progress/2026-10-02-fase-3-lcp.md`. En Linux el LCP es de unos 2,8 s simulado y unos 2,0 s con throttling real; los 10 s eran de la máquina de Windows. **Falta que el dueño elija** cómo medir el LCP móvil en el CI del PR (pregunta abierta 2) |
| 3 | `glass-kit` y una puerta única (núcleo) | ✅ Revisada con opus y arreglada |
| 4 | Escena en un worker con OffscreenCanvas (núcleo) | ✅ Revisada con opus y arreglada. Perfil "full" con `compileAsync`: listo en 1,2 s en frío y 0,3 s en caliente, huecos de rAF ≤17 ms, sin tareas largas |
| 5 | `GlassStage` en el hero (núcleo) | 🔄 Ronda visual aplicada (e374733): la silueta coincide al píxel, el brillo es equivalente, el halo se queda y el giro está acotado. Capturas en `progress/fase-3-task5-*`. Pendiente de la re-revisión con opus y del visto bueno del dueño sobre el matiz del color |
| 6 | El cristal en el contacto | ✅ Hecha, con la pose medida al píxel |
| 7 | El nombre escrito con luz | ✅ Hecha |
| 8 | Relevo del vídeo al 3D en el 404 | ✅ Diagnóstico y arreglo: sin salto de geometría; líneas sin apagón y fundido de 300 ms para el cambio de brillo (`fase-3-404-relevo.png`) |
| 9 | El 404 en el worker, R3F retirado | ✅ Revisada con opus, fusionable; TBT del 404 de 1166 ms a 0 |
| 10 | Verificación transversal | ✅ |
| 11 | Cierre | ✅ Pasada en navegador hecha; revisión final de la rama con opus |

### Pendiente inmediato (por este orden)

1. **El PR de `feat/redesign-v3` contra `main` está abierto.** Hay que revisar su CI y la preview de Vercel según `docs/superpowers/LANZAMIENTO.md` §1.
   - Los e2e de 3D (`glass-contact`, `glass-hero` y `lost-experience`) fallan a veces cuando corren en paralelo en una máquina cargada y pasan en serie. Si el CI los marca, se repiten antes de tocar código.
2. **Se fusiona solo con el visto bueno del dueño.** Después, §2 y §3 de `LANZAMIENTO.md`.
3. Deuda conocida:
   - HEVC con alfa para Safari (revisión de la fase 4, punto 10);
   - Firefox y Safari reales sin probar;
   - el margen del presupuesto de JS del e2e es de unos 5 KB;
   - `src/lib/image-props.ts` usa un módulo interno de Next (fijado a 16.2.6 y con test).
   - **TBT móvil simulado de la home en unos 200-250 ms** (presupuesto 200). En el CI es un aviso por decisión del dueño (2026-10-03) y en escritorio sigue siendo error. Para bajarlo hay que reducir la hidratación de la home (muchas islas de React) y el peso del payload RSC del HTML. La tarea larga de unos 170 ms es el chunk del framework hidratando y la de unos 220 ms es el análisis del documento.

### Lo que hizo falta saber en esta fase

- **`compileAsync` es obligatorio.** Aunque la escena vaya en un worker, `renderer.compile` + render enlaza el shader en el primer render y congela el proceso de GPU, que es compartido. Medido: un hueco de rAF de 833 ms en el hilo principal.
- **"lite" no es más rápido y se ve plano**, así que se descarta.
- **La costura horizontal del fondo** venía del tile con `RepeatWrapping`. Ahora `buildBackdrop` pinta copias envueltas para que no haya costura.
- **StrictMode.** `transferControlToOffscreen` solo se puede usar una vez por canvas, así que el canvas se crea dentro del efecto.
- **Codificación.** No edites ficheros de docs con `Get-Content`/`Set-Content` de PowerShell 5: estropean las tildes (mojibake). Usa la herramienta Edit/Write, o `[IO.File]` con UTF-8 explícito.

### Si hubiera que reconstruir el plan de la fase 3

Solo en el caso improbable de que `docs/superpowers/plans/2026-10-02-redesign-fase-3-3d.md` no existiera:
   - **Si no existe**, escríbelo con opus y la skill writing-plans. Usa la §10.3 de la especificación del rediseño e imita la estructura del plan de la fase 2.
   - Incorpora estas lecciones:
     - 3D solo en escritorio.
     - El enlace del shader fuera del camino crítico: arranque tras el LCP o en idle, un material más sencillo en el hero, o OffscreenCanvas si se justifica.
     - Presupuesto de TBT en escritorio, porque el 404 dio unos 1,6 s.
     - El JS inicial no pasa de 170 KB.
     - Una tarea que investigue el LCP móvil de unos 10 s.
     - Movimiento reducido, sin JS, Save-Data y equipos modestos ven la versión estática.
   - Incluye estos pendientes aplazados:
     - El nombre "escrito con luz" en el hero (E3), sin tocar el LCP.
     - El salto de capa en el relevo del vídeo al 3D del 404 y las líneas que parpadean al empezar el vídeo.
     - Fuentes servidas desde la web con `next/font/local`. Las builds fallaron al pedir Google Fonts.
2. **Pásale al dueño la lista de tareas y las dudas abiertas para que las apruebe.** Anota sus respuestas como enmiendas.
3. **Ejecuta la fase 3** con el flujo de la §5, y después las fases 4 y 5.
   - La fase 5 necesita del dueño el contenido de los casos de estudio: problema, qué hizo y resultados.
4. **Al terminar todo:**
   - Abre el PR de `feat/redesign-v3` contra `main`.
   - Revisa el CI de Linux, con Lighthouse, y el preview de Vercel.
   - Fusiona solo con el visto bueno del dueño.

### Pendientes conocidos sin fase asignada

- **Pasada en el navegador** de la fase 2 a cargo del controlador. El plugin de Playwright MCP estaba desconectado y la hicieron los agentes en Chromium. Si vuelve, conviene repasar `/`, `/en` y `/about` a 1440 y 375.
- **Pruebas en navegadores reales:** ni Firefox real ni Safari real se han probado.
- **Fechas de la experiencia:** los periodos usan " - " (guion simple con espacios) en rangos como «Junio 2026 - Actualidad». No es una raya ni `--`, pero conviene confirmarlo con el dueño si se toca el copy.
- **`motion.css`** se carga en todas las páginas, aunque en algunas no se use.

## 8. Otro repo de esta misma sesión: claude-skills

- **Repositorio:** `sgomez-dev/claude-skills`, copia local `C:\Users\santiago.gomez\Desktop\Repos\claude-skills`, rama `feat/skills-site`.
- **Contenido:** el sitio https://skills.sgomez.dev, Next 16 en Cloudflare, ya publicado. CI despliega al hacer push a `main`.
- **No hay trabajo abierto.**
- **Reglas:**
  - Mantener `site/wrangler.launch.jsonc` sin seguimiento en git.
  - No leer `external/.local`.
