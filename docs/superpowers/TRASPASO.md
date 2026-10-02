# Traspaso del rediseÃ±o v3 de sgomez.dev

Este documento existe para que otra sesiÃ³n retome el trabajo y llegue al mismo resultado sin depender de la conversaciÃ³n anterior. LÃ©elo entero antes de tocar nada.

Actualizado el 2026-10-02.

---

## 1. QuiÃ©n y quÃ©

- **DueÃ±o:** Santiago GÃ³mez de la Torre Romero. El primer apellido es compuesto: "GÃ³mez de la Torre".
  - La forma corta es **Â«Santiago GÃ³mez de la TorreÂ»**. Nunca Â«Santiago GÃ³mezÂ», ni en copy, ni en crÃ©ditos, ni en JSON-LD.
  - Habla en espaÃ±ol. Los mensajes van breves y con una tabla de estado cuando pregunta cÃ³mo vamos.
- **Proyecto:** el rediseÃ±o v3 de https://sgomez.dev. Es una marca personal pensada para freelance y oportunidades laborales.
- **Lo que pidiÃ³:**
  - Calidad Â«de 100kÂ» con sensaciÃ³n de keynote de Apple y componentes que se construyen solos.
  - La direcciÃ³n B: oscura, luminosa y cinematogrÃ¡fica, con Inter Tight e Instrument Serif. El dueÃ±o es el protagonista y el retrato manda.
  - Una web bilingÃ¼e.
  - Motion, 3D y Remotion.
  - DiseÃ±o adaptable de 320 a 1920 px, tambiÃ©n en apaisado.
  - SEO y GEO fuertes, mejor que la media.
- **Stack:** Next.js 16.2.6 (App Router, `src/proxy.ts`), React 19.2, TypeScript estricto, Tailwind 4, Vitest, Playwright, axe, `@lhci/cli`, GitHub Actions y Vercel.

## 2. DÃ³nde estÃ¡ el cÃ³digo

- **Repositorio:** `sgomez-dev/sgomez` en GitHub. Rama de trabajo: **`feat/redesign-v3`**.
- **Copia local:** `C:\Users\santiago.gomez\Desktop\Repos\sgomez-v3`.
  - La app estÃ¡ en `sgomez/`.
  - El proyecto de Remotion estÃ¡ en `video/`.
  - La carpeta antigua `Repos\sgomez` perdiÃ³ su `.git` y se borrÃ³ el 2026-10-01. Esta es la copia buena.
- **`.superpowers/` estÃ¡ en .gitignore.** Lo que se guarde ahÃ­ se pierde si se pierde el disco. Todo lo importante va a `docs/`.
  - `docs/superpowers/specs/`: especificaciones.
  - `docs/superpowers/plans/`: planes y enmiendas.
  - `docs/superpowers/progress/`: informes de cada tarea y de cada revisiÃ³n.

### Documentos clave

| Documento | Para quÃ© |
|---|---|
| `docs/superpowers/specs/2026-09-30-sgomez-redesign-design.md` | EspecificaciÃ³n del rediseÃ±o. La Â§10 define las fases |
| `docs/superpowers/specs/2026-10-01-sgomez-404-experiencia-design.md` | EspecificaciÃ³n del 404, con las enmiendas de la Â§7 (incluida la 7.1, "3D solo en escritorio") |
| `docs/superpowers/plans/2026-09-30-redesign-fase-1-cimientos.md` | Plan de la fase 1 |
| `docs/superpowers/plans/2026-10-01-404-experiencia.md` | Plan del 404 |
| `docs/superpowers/plans/2026-10-01-redesign-fase-2-motion.md` | Plan de la fase 2 |
| `docs/superpowers/plans/2026-10-01-redesign-fase-2-motion-enmiendas.md` | **E1 a E6: prevalecen sobre el plan de la fase 2** |
| `docs/superpowers/plans/2026-10-02-redesign-fase-3-3d.md` | Plan de la fase 3. Lo estaba escribiendo un agente al hacer este traspaso; si no existe, hay que escribirlo (Â§7) |
| `docs/superpowers/progress/2026-10-01-fase-2.md` | Informe de cada tarea de la fase 2, del merge, del A/B de TBT y de los arreglos |
| `docs/superpowers/progress/2026-10-02-fase-2-revision-*.md` | Hallazgos de las revisiones con opus y lo que se arreglÃ³ |

## 3. Estado

| | Fase | Estado |
|---|---|---|
| 1 | Cimientos: tokens, fuentes, `[lang]` e i18n, nav y footer, sin `/lab`, pÃ¡ginas estÃ¡ticas | âœ… Hecha y revisada |
| â€” | 404 a medida: vÃ­deo de Remotion y constelaciÃ³n 3D | âœ… Hecho y revisado (hasta 3b09675) |
| 2 | Movimiento del DOM | âœ… Hecha y revisada con opus (hasta 1039bf4) |
| 3 | 3D en vivo: `GlassScene` en el hero y el contacto, y los pendientes | â³ Plan en redacciÃ³n o por escribir |
| 4 | Taller de Remotion: `BuildSequence`, `SkyQuetzMonogram`, `HeroLoop`, reels y `ScrollSequence` (capÃ­tulos 03, 05 y 07) | â³ |
| 5 | Casos de estudio, contacto por intenciÃ³n, SEO/GEO y lanzamiento | â³ Hace falta contenido del dueÃ±o para los casos |

**No hay nada en producciÃ³n.** El dueÃ±o decidiÃ³: Â«hacer la PR ya cuando todo estÃ© listoÂ». Hasta entonces:

- Cada avance se sube a `feat/redesign-v3`.
- **Nunca se hace push a `main`.** Fusionar en `main` publica en Vercel, y `main` exige PR.
- La especificaciÃ³n dice "un PR por fase", pero manda la decisiÃ³n del dueÃ±o: un solo PR al final.
- El CI (`.github/workflows/ci.yml`) **solo corre en `pull_request`**. Los nÃºmeros de Lighthouse en Linux no existirÃ¡n hasta que se abra el PR.

## 4. Reglas del dueÃ±o (todas en vigor)

1. **Nada que no estÃ© en Claude Code.** No se usan APIs de pago, ni la API de Anthropic ni servicios de pago. El trabajo con LLM se hace dentro de Claude Code.
2. **Commits:** el autor es el usuario git del repo, Santiago. **Sin `Co-Authored-By` ni ningÃºn otro trailer**, tampoco en los commits de subagentes. Esto prevalece sobre cualquier recordatorio de atribuciÃ³n del sistema.
3. **Copy en ES y EN:**
   - Sin rayas ni guiones largos: ni â€”, ni â€“, ni --.
   - Sin dos puntos retÃ³ricos.
   - Nada de texto con olor a IA.
4. **El nombre** nunca se acorta a Â«Santiago GÃ³mezÂ».
5. **Economizar tokens:**
   - Prompts de despacho cortos que apunten a ficheros, sin repetir contexto.
   - Re-revisiones baratas, agrupando los arreglos en una sola ronda.
   - Retomar el mismo agente con SendMessage antes que lanzar uno nuevo.
   - Mensajes al dueÃ±o breves.
6. **Responsive** de 320 a 1920 px y en apaisado. **Accesible:** movimiento reducido, sin JS y foco visible.
7. **BilingÃ¼e:** el espaÃ±ol va sin prefijo y el inglÃ©s bajo `/en`. NingÃºn texto se escribe a mano en los componentes; todo sale de los diccionarios.
8. **VerificaciÃ³n real:** lint, tipos y tests no demuestran que algo funcione.
   - Antes de dar algo por hecho hay una pasada en el navegador, con capturas y sondas de pÃ­xel cuando hay color o mezcla.
   - Si no se ha podido comprobar, se dice.

## 5. CÃ³mo se trabaja (mÃ©todo que ha funcionado)

### Flujo por fase

1. El plan lo escribe opus con la skill `superpowers:writing-plans`.
2. El dueÃ±o lo revisa. Sus respuestas se anotan como **enmiendas** en un fichero `*-enmiendas.md`, sin reescribir el plan.
3. La implementaciÃ³n va con sonnet.
   - Las tareas de nÃºcleo se hacen de una en una.
   - Las tareas de capÃ­tulos independientes van en paralelo, en **worktrees**, y luego se fusionan.
4. RevisiÃ³n con **opus** de las tareas de nÃºcleo y de las de mÃ¡s riesgo.
5. Una sola ronda de arreglos con sonnet, agrupada. Los hallazgos se escriben antes en `docs/superpowers/progress/â€¦-revision-â€¦.md` y el prompt apunta a ese fichero.
6. RevisiÃ³n final de la fase con opus, una ronda de arreglos y la pasada en el navegador.

### Modelos

Siempre se indica el modelo explÃ­citamente.

| Trabajo | Modelo |
|---|---|
| TranscripciÃ³n mecÃ¡nica | haiku |
| ImplementaciÃ³n | sonnet |
| RevisiÃ³n de una tarea de nÃºcleo o de alto riesgo, revisiÃ³n final, escribir un plan | opus |
| Re-revisiÃ³n acotada de un arreglo pequeÃ±o | sonnet |

### Detalles operativos que evitan problemas

- **Worktrees** con rutas cortas, como `C:\Users\santiago.gomez\Desktop\Repos\f2a`. Las rutas largas rompen Turbopack.
  - Comando: `git -C <repo> worktree add -b <rama> <ruta> feat/redesign-v3`.
  - Hay que hacer `npm ci` en `sgomez/` de cada worktree.
  - Al terminar se borran el worktree y la rama local.
- **Un puerto distinto por agente:** `E2E_PORT=3101`, `3201`, y asÃ­. Playwright lee `E2E_PORT`.
- **Un solo `npm install` a la vez.** Dos a la vez se pisaron.
- **NingÃºn agente mata `node.exe` en bloque** con `taskkill /IM node.exe`, porque tumba los servidores de los demÃ¡s. Se mata solo el PID de su puerto.
- **Los informes de cada agente** se aÃ±aden a `docs/superpowers/progress/2026-10-01-fase-2.md`, o a su equivalente de fase, y se commitean.
- **Cada agente responde en menos de N lÃ­neas:** commits, tests, nÃºmeros y dudas.

## 6. Decisiones tÃ©cnicas tomadas (no reabrir sin motivo)

### Enrutado e i18n (fase 1)

- **Layout raÃ­z:** `app/[lang]`.
  - El proxy reescribe las rutas sin prefijo a `/es`.
  - `/es/*` responde 308 hacia la ruta sin prefijo.
  - `/lab` responde 301.
- **NegociaciÃ³n de markdown** con `decide()`, con `Vary` de Accept y Accept-Language.
- **API:** acepta `?lang` y Accept-Language. Un idioma invÃ¡lido devuelve 400.
- **Utilidades de i18n:** `src/i18n/languages.ts` (`localizedPath`, `hreflangAlternates`, `switchLangHref`â€¦), los diccionarios `src/i18n/dictionaries/{es,en}.ts` y `Localized`/`t()`.
- **Anclas dentro de la pÃ¡gina:** son `<a>` simples. El router de Next duplicaba el hash (`/en#work#about`).
- **SEO:** un Ãºnico `@graph` JSON-LD por pÃ¡gina. Incluye el nodo `#forgia-org` (Forgia, cofundador desde junio de 2026, dos socios, lleva toda la parte tÃ©cnica). SkyQuetz va con cuatro socios. Packatrack es de SkyQuetz, no personal.
- **Contenido:** `src/app/content/index.tsx`. El eslogan de SkyQuetz va solo en espaÃ±ol, con `lang="es"`.

### 404 (hecho)

- **CÃ³mo se sirve:** el proxy pide el molde prerenderizado `app/[lang]/perdido` y lo devuelve con estado 404.
  - Lleva la cabecera de bypass `x-sgomez-404: 1`, una TTL de 60 s, cachÃ© negativa, un timeout de 1500 ms y `redirect:"manual"`.
  - `fallback404Html` cubre el caso de error, siempre con noindex. El fallback degradado y la rama de bypass van con `private, no-store`.
- **Fuente Ãºnica de verdad:** `src/lib/lost/shards.ts`, sin imports, con geometrÃ­a, cÃ¡mara, `mulberry32`, `project` y `unproject`.
- **Remotion** (`video/`) renderiza `shatter.webm` (VP9 con alfa) y `shatter.mp4` sobre negro.
  - En Safari el MP4 se mezcla en modo `screen`. Por eso la secciÃ³n del 404 pinta el fondo `--bg` en sÃ­ misma: si no, la mezcla queda en negro.
  - Lo comprueba una sonda de pÃ­xel en el e2e.
- **3D solo en escritorio (â‰¥ lg).** En mÃ³vil el 3D costaba unos 9 s de TBT, porque ANGLE enlaza el shader de `MeshPhysicalMaterial` en el primer uso y `compileAsync` no lo evita. MÃ³vil muestra el escenario estÃ¡tico.
  - El import de three espera a idle. El vÃ­deo arranca al momento.
  - Cruzar el breakpoint despuÃ©s de la puerta envÃ­a `sceneFailed` y vuelve a lo estÃ¡tico.

### Movimiento (fase 2, ver enmiendas E1 a E6)

- **Motion** (paquete `motion`, `animate` de `motion/mini`, mÃ¡s `inView`, `stagger`, `spring` y `scroll`).
  - Va en diferido, con un `import()` por primitiva, y nunca entra en el JS inicial.
  - El runtime pesa 12,9 KB y su lÃ­mite es 15 KB (E6). La regla del dueÃ±o es que el JS inicial no pase de 170 KB.
- **El CSS ligado al scroll es estÃ¡tico**, en `src/motion/motion.css`, detrÃ¡s de `prefers-reduced-motion: no-preference`, `@supports (animation-timeline: view())` y `:root[data-motion-state="on"]` (E5 revisada).
  - Inyectarlo tras idle provocaba saltos y hacÃ­a crecer la pÃ¡gina a mitad de scroll.
  - Lo que depende de JS cuelga de `data-motion-ready`.
- **Registro** en `src/motion/registry.ts`. Hoy solo lleva primitivas con JS: `count`, `intent` y `magnetic`, mÃ¡s `text-reveal` y `build` como `fallbackOnly`. El resto son atributos `data-motion` que enganchan el CSS.
- **El runtime solo se pide en la home** en Chromium.
- **API de las primitivas** (`ctx`): `engine`, `inView`, `scrollProgress`, `count`, `split` y `pointer`.
- **Firefox:** respaldo con IntersectionObserver y WAAPI, de 0,5 KB, sin parpadeo. Solo se ha probado simulando Firefox.
- **LÃ­nea de tiempo de la experiencia fijada y en horizontal:** se activa desde 1024 px de ancho y 40rem de alto.
  - Tiene diseÃ±o keynote, con el periodo, el rol y la empresa en grande, y un `summary` por entrada en ES y EN (aprobado por el dueÃ±o).
  - El texto completo sigue en el DOM.
  - Fuera de ese rango, se ve la lista vertical.
- **Transiciones de pÃ¡gina** con View Transitions, mediante `experimental.viewTransition` y `<ViewTransition name="page">`. Duran 180 y 280 ms, la nav se queda quieta y con movimiento reducido no hay transiciÃ³n.
  - `<html data-scroll-behavior="smooth">` es obligatorio. Sin Ã©l, la pÃ¡gina nueva aparece por abajo y sube.
- **Presupuesto:**
  - `npm run budget` (`scripts/js-budget.mjs`) falla en CI si se superan los lÃ­mites.
  - El JS inicial real es de unos 154 KB. Los 190 que se citaban contaban un polyfill `noModule`.
- **La API pÃºblica** se valida contra el esquema OpenAPI en `tests/api-schema.test.ts`, con `additionalProperties: false`.

### Rendimiento medido en esta mÃ¡quina (Windows, con ruido)

- **Escritorio:** CLS 0, TBT de 12 a 64 ms, LCP de 1,8 s, a11y 100 y SEO 100.
- **MÃ³vil simulado:** TBT de unos 0,5 a 0,9 s y LCP de unos 10 s, **tambiÃ©n antes de la fase 2**. El A/B con ejecuciones intercaladas no muestra regresiÃ³n.
  - Puede ser un artefacto de esta mÃ¡quina. Se investiga en la fase 3, idealmente con el CI de Linux.

## 7. Siguiente paso concreto

0. **El plan de la fase 3 ya existe** (commit en `feat/redesign-v3`). Tiene 11 tareas; las de nÃºcleo son la 3 (glass-kit y la puerta comÃºn), la 4 (escena en un Worker con OffscreenCanvas) y la 5 (GlassStage en el hero). La 9 mueve la constelaciÃ³n del 404 al worker y es de alto riesgo, asÃ­ que la revisa opus. **EstÃ¡ pendiente la aprobaciÃ³n del dueÃ±o**, con estas dudas abiertas:
   - **R3F:** quitarlo del hero, y del todo despuÃ©s de la tarea 9, se aparta de la Â§4 de la especificaciÃ³n. Â¿Le parece bien?
   - **LCP mÃ³vil:** si los 10 s resultan ser un artefacto de la simulaciÃ³n, Â¿se mide en CI con throttling real o se acepta como deuda conocida?
     - Dato ya medido: el elemento LCP es el h1, con unos 9,5 s de *render delay*, y el primer pintado llega despuÃ©s del load.
   - **Forma del cristal:** Â¿la losa entera que se rompe en el 404, o el blob del pÃ³ster?
   - **Salto en el 404:** si la mediciÃ³n no encuentra ningÃºn descuadre de cajas, Â¿quÃ© es exactamente lo que ve saltar?
   - **Etiqueta del botÃ³n de pausa:** Â¿Â«Pausar el cristalÂ» o Â«Pausar movimientoÂ», como en el 404?
1. **Si por algÃºn motivo no existiera `docs/superpowers/plans/2026-10-02-redesign-fase-3-3d.md`** (compruÃ©balo con `git log` y `git status`):
   - **Si no existe**, escrÃ­belo con opus y la skill writing-plans. Usa la Â§10.3 de la especificaciÃ³n del rediseÃ±o e imita la estructura del plan de la fase 2.
   - Incorpora estas lecciones:
     - 3D solo en escritorio.
     - El enlace del shader fuera del camino crÃ­tico: arranque tras el LCP o en idle, un material mÃ¡s sencillo en el hero, o OffscreenCanvas si se justifica.
     - Presupuesto de TBT en escritorio, porque el 404 dio unos 1,6 s.
     - El JS inicial no pasa de 170 KB.
     - Una tarea que investigue el LCP mÃ³vil de unos 10 s.
     - Movimiento reducido, sin JS, Save-Data y equipos modestos ven la versiÃ³n estÃ¡tica.
   - Incluye estos pendientes aplazados:
     - El nombre "escrito con luz" en el hero (E3), sin tocar el LCP.
     - El salto de capa en el relevo del vÃ­deo al 3D del 404 y las lÃ­neas que parpadean al empezar el vÃ­deo.
     - Fuentes servidas desde la web con `next/font/local`. Las builds fallaron al pedir Google Fonts.
2. **PÃ¡sale al dueÃ±o la lista de tareas y las dudas abiertas para que las apruebe.** Anota sus respuestas como enmiendas.
3. **Ejecuta la fase 3** con el flujo de la Â§5, y despuÃ©s las fases 4 y 5.
   - La fase 5 necesita del dueÃ±o el contenido de los casos de estudio: problema, quÃ© hizo y resultados.
4. **Al terminar todo:**
   - Abre el PR de `feat/redesign-v3` contra `main`.
   - Revisa el CI de Linux, con Lighthouse, y el preview de Vercel.
   - Fusiona solo con el visto bueno del dueÃ±o.

### Pendientes conocidos sin fase asignada

- **Pasada en el navegador** de la fase 2 a cargo del controlador. El plugin de Playwright MCP estaba desconectado y la hicieron los agentes en Chromium. Si vuelve, conviene repasar `/`, `/en` y `/about` a 1440 y 375.
- **Pruebas en navegadores reales:** ni Firefox real ni Safari real se han probado.
- **Fechas de la experiencia:** los periodos usan " - " (guion simple con espacios) en rangos como Â«Junio 2026 - ActualidadÂ». No es una raya ni `--`, pero conviene confirmarlo con el dueÃ±o si se toca el copy.
- **`motion.css`** se carga en todas las pÃ¡ginas, aunque en algunas no se use.

## 8. Otro repo de esta misma sesiÃ³n: claude-skills

- **Repositorio:** `sgomez-dev/claude-skills`, copia local `C:\Users\santiago.gomez\Desktop\Repos\claude-skills`, rama `feat/skills-site`.
- **Contenido:** el sitio https://skills.sgomez.dev, Next 16 en Cloudflare, ya publicado. CI despliega al hacer push a `main`.
- **No hay trabajo abierto.**
- **Reglas:**
  - Mantener `site/wrangler.launch.jsonc` sin seguimiento en git.
  - No leer `external/.local`.

