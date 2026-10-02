# sgomez.dev v3, fase 3: 3D en vivo. Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que el cristal de la marca esté vivo en el hero y en el contacto del escritorio: un cristal iridiscente entero que flota, sigue al ratón y toma el relevo del póster sin que nadie note el cambio. Todo sin tocar el LCP, sin pasar de 200 ms de TBT en escritorio y con una versión estática completa para móvil, movimiento reducido, Save-Data, equipos modestos y visitas sin JS. La fase cierra además tres deudas: el nombre del hero «escrito con luz» (E3), los dos defectos del relevo vídeo→3D del 404 y las fuentes autoalojadas.

**Architecture:** El 3D vive **fuera del hilo principal**. En el 404 el coste real no fue three.js sino el enlazado del shader de `MeshPhysicalMaterial` en ANGLE, que bloquea el hilo que tiene el contexto y no se puede trocear (`compileAsync` no lo evitó: ~9 s de TBT en móvil, ~1,6 s en escritorio). Si el contexto vive en un worker con `OffscreenCanvas`, ese bloqueo cae en el worker y el hilo principal solo hace `transferControlToOffscreen()` y `postMessage`. Por eso:
1. **Póster primero, siempre.** El HTML del servidor trae el `GlassPoster` SVG de hoy. Es el estado final para quien no pasa la puerta y la base sobre la que entra el lienzo. El canvas no es candidato a LCP; el LCP sigue siendo el titular o el retrato.
2. **Una puerta única** (`src/lib/three/gate.ts`), compartida con el 404: escritorio (≥ `lg`, 64rem), `data-motion-state="on"` (que ya cubre movimiento reducido y Save-Data), WebGL2 por hardware, `hardwareConcurrency ≥ 4`, `deviceMemory ≥ 4` cuando se sabe y `OffscreenCanvas` con `transferControlToOffscreen`. Quien no la pasa se queda con el póster.
3. **Un worker de three.js sin React** (`src/three/glass.worker.ts`) que pinta el cristal entero (el mismo `GLASS`, `GLASS_MATERIAL` y `GLASS_ENV` de `shards.ts`, ahora sin romper) en uno o varios lienzos: el hero y el contacto comparten worker. Las piezas de construcción del 404 (entorno PMREM, fondo de refracción, material, geometría) salen de `ConstellationScene.tsx` a `src/three/glass-kit.ts`, sin DOM, y las usan los dos.
4. **Un componente cliente diminuto** (`src/components/GlassStage.tsx`) que, tras `load` y un hueco ocioso, importa el cliente del worker (`glass-client.ts`, perezoso), le pasa el lienzo y funde el lienzo sobre el póster cuando el worker avisa de su primer fotograma.

**Decisión sobre R3F.** La spec §4 nombra React Three Fiber + drei para `three/`. R3F no puede vivir en un worker sin una dependencia nueva (`@react-three/offscreen`) y el hero no necesita React dentro de la escena (un objeto, sin enlaces que seguir). Este plan pinta el hero y el contacto con three.js directo en el worker. La Task 9 lleva también el 404 al worker; si se hace, `@react-three/fiber` deja de usarse y se retira. drei no está instalado y no entra. (Pregunta abierta 1 para Santiago.)

**Tech Stack:** Next.js 16.2.6 (App Router, Turbopack, `new Worker(new URL(…, import.meta.url))`), React 19.2, TypeScript strict, three 0.186.1, `next/font/local`, Tailwind CSS 4, Vitest 3, Playwright + `@axe-core/playwright`, `@lhci/cli`, GitHub Actions en `ubuntu-24.04`.

**Spec:** `docs/superpowers/specs/2026-09-30-sgomez-redesign-design.md` (esta fase = §10.3; con §2 dirección visual y contraste, §3.3 capítulos 01 y 09, §4 arquitectura y puerta, §6 movimiento y accesibilidad, §7 presupuestos, §9 pruebas). La spec del 404 (`docs/superpowers/specs/2026-10-01-sgomez-404-experiencia-design.md`, §7 y §7.1) fija la fuente única de la geometría y la regla de 3D solo en escritorio. Las enmiendas de la fase 2 (`docs/superpowers/plans/2026-10-01-redesign-fase-2-motion-enmiendas.md`) siguen vigentes, en especial E3 (el nombre escrito con luz llega aquí) y E5 (el CSS de movimiento es estático, en `motion.css`).

**Directorio de trabajo:** la app está en `sgomez/` dentro del repo (`C:\Users\santiago.gomez\Desktop\Repos\sgomez-v3\sgomez`). Todos los comandos `npm` y `npx` se ejecutan ahí. La rama es `feat/redesign-v3`.

## Global Constraints

- **El contenido nunca depende de la animación** (spec §6). El SSR trae el póster y el texto en su estado final; nada usa `opacity: 0` ni `visibility: hidden` en el HTML del servidor. Sin JS se ve todo, con el póster.
- **El LCP nunca es el 3D** (spec §7 y §8.7). El `<h1>` del hero y el retrato se pintan en su estado final en el primer fotograma y su nodo de texto o imagen no se sustituye después. Nada del 3D empieza antes de `load` más un hueco ocioso.
- **3D solo en escritorio** (spec 404 §7.1): por debajo de `(min-width: 64rem)` no hay sonda WebGL, ni chunk de three, ni worker, ni lienzo. Móvil y horizontal corto ven el póster con su barrido de luz CSS. Cruzar a móvil tras la puerta desmonta el lienzo y devuelve el póster; no se vuelve a montar en esa visita.
- **La versión estática** es la de movimiento reducido, sin JS, Save-Data, `hardwareConcurrency < 4`, `deviceMemory < 4`, WebGL por software, sin WebGL2, sin `OffscreenCanvas` y cualquier fallo del worker. Todas acaban en el mismo póster, sin botón de pausa y sin errores de consola.
- **Presupuestos:**
  - JS inicial ≤ 170 KB gzip en todas las rutas de `npm run budget` (hoy 148,7 a 154,1 KB). `GlassStage` y lo que importa de forma estática suman ≤ 3 KB gzip.
  - Cliente perezoso del worker (`glass-client.ts`) ≤ 4 KB gzip. Worker con three ≤ 250 KB gzip (spec §7, el chunk 3D).
  - TBT < 200 ms en Lighthouse de escritorio con el cristal vivo (`/`, `/en`; tras la Task 9 también `/en/no-existe`). TBT < 200 ms en móvil, donde no hay 3D.
  - Hilo principal: ninguna tarea larga (> 50 ms) entre las marcas `glass:start:<id>` y `glass:ready:<id>`; hueco máximo entre `requestAnimationFrame` del hilo principal durante el arranque del worker ≤ 100 ms en un escritorio con GPU.
  - CLS < 0,05. El lienzo ocupa exactamente la caja del póster, que ya tiene `aspect-square`.
- **Contraste AA en todos los estados** (spec §2): el cristal nunca pasa por detrás de un bloque de texto (tiene su columna) y el barrido del nombre solo usa colores que dan ≥ 4,5:1 sobre `--bg`. `opacity` solo en capas decorativas con `aria-hidden="true"`.
- **Pausa** (spec §6): todo movimiento que dure más de 5 s tiene control de pausa. El cristal vivo lleva un botón `aria-pressed` de 44 px, compartido entre hero y contacto (pausar uno pausa los dos). El barrido del nombre y el del póster duran menos de 5 s y no lo necesitan.
- **Puntero:** el cristal sigue al ratón solo con `(hover: hover) and (pointer: fine)`. Nunca se oculta el cursor del sistema.
- **Responsive** de 320 a 1920 px y en horizontal (844×390): 320, 375, 414, 768, 1024, 1280, 1366, 1440 y 1920, sin scroll horizontal en ningún estado.
- **Bilingüe ES/EN** por `src/i18n/dictionaries/{es,en}.ts`, mismas claves en los dos (`tests/i18n.test.ts`).
- **Texto para personas:** sin raya (—), semirraya (–) ni doble guion (--), y sin dos puntos retóricos. `tests/no-dashes.test.tsx` cubre diccionarios y capítulos.
- **El nombre** es «Santiago Gómez de la Torre Romero» o, en corto, «Santiago Gómez de la Torre». Nunca «Santiago Gómez» a secas: tampoco al partir el titular en spans para el barrido de luz.
- **Sin APIs de pago ni servicios externos.** Las fuentes salen del propio repo; el CI usa solo GitHub Actions. Sin dependencias nuevas en `dependencies` (las fuentes se copian una vez, no se instalan).
- `<Link>` siempre con `prefetch={false}` (`tests/links.test.ts`). No se pasan funciones a componentes `'use client'`: `GlassStage` recibe cadenas e hijos del servidor.
- **Commits** con el autor del `git config` del repo y **sin** `Co-Authored-By` ni ningún otro trailer. El push de la rama sí se hace (la Task 2 lo necesita para el CI); **el PR se abre solo cuando estén todas las fases**.

## Review Focus

1. **Cruzar `lg` con el cristal vivo.** Pasar de 1280×800 a 800×800 con el hero vivo desmonta el lienzo, termina el worker si no queda otro lienzo, devuelve el póster sin hueco y no deja el botón de pausa; volver a 1280 no lo remonta. Se fija en la Task 5 con un e2e que cambia el viewport a mitad.
2. **Movimiento reducido o Save-Data a mitad de visita.** Al pasar `data-motion-state` a `off`, el lienzo se va, el póster vuelve y el worker se termina en menos de un fotograma de espera; no quedan oyentes de `pointermove`. Se fija en la Task 5 con `page.emulateMedia` a mitad del test.
3. **El worker falla de cualquier forma.** Chunk del worker bloqueado, WebGL por software sin forzar, contexto perdido y `OffscreenCanvas` ausente: póster completo, sin botón, `data-glass="off"` y cero errores de consola. Se fija en la Task 5 (chunk bloqueado, sin `OffscreenCanvas`) y en la Task 4 (contexto perdido y software, en el protocolo).
4. **Navegación de cliente ida y vuelta.** `/` → `/about` → atrás, y el cambio de idioma: nunca hay más de un worker vivo, ni lienzos duplicados, ni pausa desincronizada entre hero y contacto. Se fija en la Task 6 con el contador `__GLASS_LIVE_WORKERS__`.
5. **Aterrizar en `/#contact` o recargar a mitad de página.** El contacto toma el relevo en cuanto está a menos de un viewport y el hero, fuera de pantalla, no pinta fotogramas; el hilo principal sigue sin tareas largas. Se fija en la Task 6.

---

## Mapa de ficheros

| Fichero | Responsabilidad |
|---|---|
| `src/app/fonts/*.woff2`, `src/app/fonts/OFL.txt`, `src/app/fonts.ts` | Inter Tight 400/500/600 e Instrument Serif 400 normal e itálica, latín, autoalojadas con `next/font/local` |
| `scripts/lcp-report-lib.mjs`, `scripts/lcp-report.mjs`, `../.github/workflows/lcp-probe.yml` | lectura de los LHR (elemento LCP, fases, FCP y LCP observados, scripts más caros) y sonda de Lighthouse en el CI de Linux |
| `src/lib/lost/shards.ts` | gana `slabOutlinePoints()`: el contorno del cristal entero, el mismo que usan el vídeo y `bake-geometry.mjs` |
| `src/chapters/lost/media.ts` | `Gate` gana `deviceMemory`; `gatingPasses` lo respeta |
| `src/lib/three/gate.ts` | `probeWebGL2`, `readGate` (salen de `LostExperience.tsx`), `readGlassEnv`, `glassGatePasses` |
| `src/three/glass-kit.ts` | piezas de three sin DOM: entorno PMREM, fondo de refracción, material por perfil, geometría de fragmento y de cristal entero, luces, liberación |
| `src/three/protocol.ts` | mensajes entre hilo principal y worker, colocaciones, utilidades puras |
| `src/three/GlassScene.ts` | `createGlassScene()`: la escena del cristal entero, sin DOM, para un lienzo |
| `src/three/glass.worker.ts` | el worker: contextos, sonda de software, bucle a 30 fps, visibilidad, pausa, fallos |
| `src/three/glass-client.ts` | cliente perezoso del hilo principal: un worker compartido, montajes, pausa compartida, puntero |
| `src/components/GlassStage.tsx` | componente cliente: puerta, arranque tras idle, lienzo sobre el póster, relevo, pausa, desmontaje |
| `src/three/ConstellationScene.tsx` | usa `glass-kit.ts` (Task 3); en la Task 9 pasa a `ConstellationScene.ts` dentro del worker |
| `src/chapters/{Hero,Contact}.tsx` | envuelven el póster con `GlassStage` |
| `src/components/ui/Display.tsx` | prop `light`: envuelve el nombre para el barrido de luz |
| `src/motion/motion.css` | barrido del nombre, barrido del póster, relevo póster→lienzo |
| `src/chapters/lost/{LostStage,LostExperience}.tsx`, `src/app/globals.css` | relevo vídeo→3D del 404 sin salto de capa y sin apagón de líneas |
| `scripts/js-budget-lib.mjs`, `scripts/js-budget.mjs` | `chunkGraph()`; presupuesto del cliente del worker y del worker |
| `lighthouserc.desktop.json` | el 404 entra en el escritorio tras la Task 9 |
| `e2e/glass-*.spec.ts`, `e2e/light-write.spec.ts`, `e2e/lost-handoff.spec.ts`, `e2e/fonts.spec.ts` | e2e de cada pieza y el barrido transversal |
| `tests/fonts.test.ts`, `tests/lcp-report.test.ts`, `tests/glass-*.test.ts(x)`, `tests/light-write.test.tsx`, `tests/lost-lines.test.tsx` | unitarias |

Tareas de núcleo (revisión con opus en su momento): **3, 4 y 5**. La 4 y la 5 son el camino del que dependen la 6 y la 9; la 3 reescribe la puerta y la construcción que usa el 404. La 9 no es de núcleo pero es de riesgo alto y se recomienda opus también.

---

### Task 1: Fuentes autoalojadas con `next/font/local`

Los builds del CI fallaron al descargar Google Fonts. Las dos familias son OFL (spec §2) y se copian una vez al repo desde los paquetes de Fontsource, que publican los mismos ficheros latinos que Google.

**Files:**
- Create: `src/app/fonts/inter-tight-latin-400-normal.woff2`, `…-500-normal.woff2`, `…-600-normal.woff2`, `src/app/fonts/instrument-serif-latin-400-normal.woff2`, `…-400-italic.woff2`, `src/app/fonts/OFL.txt`, `src/app/fonts.ts`
- Modify: `src/app/[lang]/layout.tsx:2,15-16`
- Test: `tests/fonts.test.ts`, `e2e/fonts.spec.ts`

**Interfaces:**
- Produces: `sans` y `serif` (objetos de `next/font/local`) con las mismas variables CSS de hoy, `--font-inter-tight` y `--font-instrument-serif`. `tokens.css` no cambia.

- [ ] **Step 1: Write the failing test**

```ts
// tests/fonts.test.ts
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const SRC = join(process.cwd(), "src");
const FONTS = join(SRC, "app", "fonts");
const FILES = [
  "inter-tight-latin-400-normal.woff2",
  "inter-tight-latin-500-normal.woff2",
  "inter-tight-latin-600-normal.woff2",
  "instrument-serif-latin-400-normal.woff2",
  "instrument-serif-latin-400-italic.woff2",
];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

describe("fuentes autoalojadas", () => {
  it("ningún fichero de src importa next/font/google", () => {
    const hits = walk(SRC).filter((f) => /\.(ts|tsx)$/.test(f) && readFileSync(f, "utf8").includes("next/font/google"));
    expect(hits).toEqual([]);
  });
  it("están los cinco woff2 y la licencia OFL", () => {
    for (const f of FILES) expect(statSync(join(FONTS, f)).size, f).toBeGreaterThan(5_000);
    expect(readFileSync(join(FONTS, "OFL.txt"), "utf8")).toMatch(/SIL OPEN FONT LICENSE/i);
  });
  it("fonts.ts declara las dos variables de siempre", () => {
    const src = readFileSync(join(SRC, "app", "fonts.ts"), "utf8");
    expect(src).toContain('"--font-inter-tight"');
    expect(src).toContain('"--font-instrument-serif"');
    expect(existsSync(join(SRC, "app", "fonts.ts"))).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/fonts.test.ts`
Expected: FAIL; `layout.tsx` importa `next/font/google` y no existe `src/app/fonts/`.

- [ ] **Step 3: Copy the font files once**

Run (Git Bash, desde `sgomez/`):

```bash
tmp="$(mktemp -d)" && (cd "$tmp" && npm pack @fontsource/inter-tight@5 @fontsource/instrument-serif@5 >/dev/null && for t in *.tgz; do tar -xzf "$t" && mv package "${t%.tgz}"; done)
mkdir -p src/app/fonts
for w in 400 500 600; do cp "$tmp"/fontsource-inter-tight-*/files/inter-tight-latin-$w-normal.woff2 src/app/fonts/; done
for s in normal italic; do cp "$tmp"/fontsource-instrument-serif-*/files/instrument-serif-latin-400-$s.woff2 src/app/fonts/; done
cp "$tmp"/fontsource-inter-tight-*/LICENSE src/app/fonts/OFL.txt
ls -la src/app/fonts
```

Expected: cinco `.woff2` de 15 a 50 KB y `OFL.txt`. Si el `LICENSE` de Fontsource no es el texto OFL (debe empezar por «SIL OPEN FONT LICENSE»), copia el de `fontsource-instrument-serif-*`; si ninguno lo trae, descarga el texto oficial de `https://openfontlicense.org` y añade una línea por familia con su copyright (Inter Tight: The Inter Tight Project Authors; Instrument Serif: The Instrument Serif Project Authors). `npm pack` no toca `package.json`.

- [ ] **Step 4: Implement**

```ts
// src/app/fonts.ts
import localFont from "next/font/local";

/**
 * Fuentes autoalojadas (OFL, ver fonts/OFL.txt). Antes venían de next/font/google y
 * el build del CI fallaba cuando no podía descargarlas. Mismos pesos, mismo subconjunto
 * latino y mismas variables CSS: tokens.css no cambia.
 */
export const sans = localFont({
  src: [
    { path: "./fonts/inter-tight-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/inter-tight-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/inter-tight-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-inter-tight",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: "Arial",
});

export const serif = localFont({
  src: [
    { path: "./fonts/instrument-serif-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/instrument-serif-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-instrument-serif",
  display: "swap",
  fallback: ["Georgia", "serif"],
  adjustFontFallback: "Times New Roman",
});
```

En `src/app/[lang]/layout.tsx`, borra la línea 2 (`import { Inter_Tight, Instrument_Serif } from "next/font/google";`) y las líneas 15 y 16 (`const sans = …`, `const serif = …`), y añade `import { sans, serif } from "../fonts";`. El `className={`${sans.variable} ${serif.variable}`}` del `<html>` se queda igual.

- [ ] **Step 5: Write the e2e**

```ts
// e2e/fonts.spec.ts
import { test, expect } from "./fixtures";

test("las fuentes salen del propio sitio y se precargan", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (r) => {
    if (/fonts\.(googleapis|gstatic)\.com/.test(r.url())) external.push(r.url());
  });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  expect(external).toEqual([]);
  const preloads = await page.locator('link[rel="preload"][as="font"]').evaluateAll((ls) => ls.map((l) => (l as HTMLLinkElement).href));
  expect(preloads.length).toBeGreaterThanOrEqual(2);
  expect(preloads.every((h) => h.includes("/_next/static/media/"))).toBe(true);
  const loaded = await page.evaluate(() => [...document.fonts].filter((f) => f.status === "loaded").map((f) => `${f.weight} ${f.style}`));
  expect(loaded).toEqual(expect.arrayContaining(["600 normal", "400 italic"]));
});
```

- [ ] **Step 6: Run the tests**

Run: `npx vitest run tests/fonts.test.ts && npm run build && npx playwright test e2e/fonts.spec.ts e2e/head-and-copy.spec.ts e2e/a11y.spec.ts --project=desktop --project=mobile`
Expected: PASS. Compara una captura del hero a 1280 y 375 con la de antes (`git stash` no hace falta: la fase 2 dejó capturas en `../.superpowers/verify/fase-2/`); el titular tiene que medir lo mismo al píxel. Si cambia la métrica, revisa `adjustFontFallback`.

- [ ] **Step 7: Commit**

```bash
git add src/app/fonts src/app/fonts.ts "src/app/[lang]/layout.tsx" tests/fonts.test.ts e2e/fonts.spec.ts
git commit -m "feat(fonts): Inter Tight e Instrument Serif autoalojadas con next/font/local; el build ya no descarga Google Fonts"
```

---

### Task 2: Investigación del LCP móvil (≈ 10 s simulado) en el CI de Linux

Lighthouse móvil da ≈ 10 s de LCP simulado en la home desde antes de la fase 2. Los LHR que hay en `sgomez/.lighthouseci/` (build de la fase 2, Windows) ya dicen bastante:

| Ruta | LCP simulado | Elemento | Render delay | FCP observado | LCP observado | `load` observado |
|---|---|---|---|---|---|---|
| `/` | 9 976 a 10 000 ms | `<h1 data-motion="text-reveal">` | ≈ 9 530 ms | 1 161 ms | 1 161 ms | 500 ms |
| `/about` | ≈ 8 400 ms | `<p>` del texto | ≈ 7 950 ms | | | |
| `/en/no-existe` | ≈ 8 710 ms | `<p data-answer>` | ≈ 8 255 ms | | | |

Lectura: el LCP es texto, no tiene tiempo de carga y todo es «render delay». El primer pintado observado llega **después** de `load`, y FCP y LCP coinciden, así que lo que pinta tarde es la página entera, no el titular. Lantern construye el LCP con el grafo de lo que había antes del LCP observado, y ahí entra toda la evaluación de scripts con la CPU 4×. Hipótesis, de más a menos probable:
- **H1.** El primer pintado espera a que acabe la evaluación de los chunks iniciales (en local llegan antes del primer fotograma). Lo apoya que `bootup-time` señala un único chunk (`10u3y4bw1ayzs.js` en esa build) con ≈ 943 ms de scripting estimado.
- **H2.** El cálculo de estilos y layout antes del primer pintado (`styleLayout` ≈ 824 ms estimados) por el CSS ligado al scroll de `motion.css`.
- **H3.** Las fuentes (la Task 1 ya las autoaloja y precarga).
- **H4.** Artefacto de la máquina (ESET filtra el tráfico local). El CI de Linux lo descarta o lo confirma.

Esta tarea mide en Linux, prueba las hipótesis sin tocar código de producto y solo arregla si la causa está en el código. El resultado va a un informe.

**Files:**
- Create: `scripts/lcp-report-lib.mjs`, `scripts/lcp-report.mjs`, `../.github/workflows/lcp-probe.yml`, `docs/superpowers/progress/2026-10-02-fase-3-lcp.md` (informe; ruta relativa a la raíz del repo)
- Modify: `package.json` (script `lcp:report`), `.gitignore` de `sgomez/` si hace falta para `.lighthouseci-probe*`
- Test: `tests/lcp-report.test.ts`

**Interfaces:**
- Produces: `summarize(lhr): { url, lcp, tbt, fcp, element, phases: Record<string, number>, observed: { fcp, lcp, dcl, load }, bootup: [string, number][], mainThread: [string, number][] }`; `npm run lcp:report -- <dir>` imprime una fila por LHR y una tabla Markdown para el resumen del job.

- [ ] **Step 1: Write the failing test**

```ts
// tests/lcp-report.test.ts
import { describe, expect, it } from "vitest";
// @ts-expect-error módulo .mjs sin tipos
import { summarize, markdownTable } from "../scripts/lcp-report-lib.mjs";

const LHR = {
  finalDisplayedUrl: "http://localhost:3000/",
  audits: {
    "largest-contentful-paint": { numericValue: 9976 },
    "total-blocking-time": { numericValue: 993 },
    "first-contentful-paint": { numericValue: 2877 },
    "largest-contentful-paint-element": {
      details: { items: [{ items: [{ node: { snippet: '<h1 data-motion="text-reveal" class="x">' } }] }, { items: [{ phase: "TTFB", timing: 451 }, { phase: "Render Delay", timing: 9526 }] }] },
    },
    metrics: { details: { items: [{ observedFirstContentfulPaint: 1161, observedLargestContentfulPaint: 1161, observedDomContentLoaded: 165, observedLoad: 500 }] } },
    "bootup-time": { details: { items: [{ url: "http://localhost:3000/_next/static/chunks/a.js", total: 991, scripting: 943 }] } },
    "mainthread-work-breakdown": { details: { items: [{ group: "styleLayout", duration: 824 }] } },
  },
};

describe("informe de LCP", () => {
  it("resume el LHR", () => {
    const s = summarize(LHR);
    expect(s.element).toMatch(/^<h1/);
    expect(s.phases["Render Delay"]).toBe(9526);
    expect(s.observed).toEqual({ fcp: 1161, lcp: 1161, dcl: 165, load: 500 });
    expect(s.bootup[0]).toEqual(["/_next/static/chunks/a.js", 943]);
  });
  it("la tabla Markdown lleva una fila por LHR", () => {
    expect(markdownTable([summarize(LHR), summarize(LHR)]).trim().split("\n")).toHaveLength(4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lcp-report.test.ts`
Expected: FAIL, `Cannot find module '../scripts/lcp-report-lib.mjs'`.

- [ ] **Step 3: Implement**

```js
// scripts/lcp-report-lib.mjs
const num = (a) => Math.round(a?.numericValue ?? NaN);

export function summarize(lhr) {
  const a = lhr.audits;
  const el = a["largest-contentful-paint-element"]?.details?.items ?? [];
  const m = a.metrics?.details?.items?.[0] ?? {};
  return {
    url: lhr.finalDisplayedUrl,
    lcp: num(a["largest-contentful-paint"]),
    tbt: num(a["total-blocking-time"]),
    fcp: num(a["first-contentful-paint"]),
    element: el[0]?.items?.[0]?.node?.snippet ?? "",
    phases: Object.fromEntries((el[1]?.items ?? []).map((p) => [p.phase, Math.round(p.timing)])),
    observed: { fcp: m.observedFirstContentfulPaint, lcp: m.observedLargestContentfulPaint, dcl: m.observedDomContentLoaded, load: m.observedLoad },
    bootup: (a["bootup-time"]?.details?.items ?? []).slice(0, 5).map((i) => [i.url.replace(/^https?:\/\/[^/]+/, ""), Math.round(i.scripting)]),
    mainThread: (a["mainthread-work-breakdown"]?.details?.items ?? []).map((i) => [i.group, Math.round(i.duration)]),
  };
}

export function markdownTable(rows) {
  const head = "| URL | LCP | TBT | FCP | elemento | render delay | FCP obs. | LCP obs. | load obs. | script más caro |\n|---|---|---|---|---|---|---|---|---|---|";
  const body = rows.map((r) =>
    `| ${r.url} | ${r.lcp} | ${r.tbt} | ${r.fcp} | \`${r.element.slice(0, 40).replace(/\|/g, "/")}\` | ${r.phases["Render Delay"] ?? ""} | ${r.observed.fcp} | ${r.observed.lcp} | ${r.observed.load} | ${r.bootup[0]?.join(" ") ?? ""} |`,
  );
  return [head, ...body].join("\n") + "\n";
}
```

```js
// scripts/lcp-report.mjs
// Uso: npm run lcp:report -- .lighthouseci [otra carpeta…]. Lee los lhr-*.json y resume el LCP.
import { readFileSync, readdirSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { summarize, markdownTable } from "./lcp-report-lib.mjs";

const dirs = process.argv.slice(2);
for (const dir of dirs.length ? dirs : [".lighthouseci"]) {
  const rows = readdirSync(dir).filter((f) => /^lhr-.*\.json$/.test(f)).map((f) => summarize(JSON.parse(readFileSync(join(dir, f), "utf8"))));
  const md = `\n### ${dir}\n\n${markdownTable(rows)}`;
  console.log(md);
  for (const r of rows) console.log(r.url, "main thread:", JSON.stringify(r.mainThread), "bootup:", JSON.stringify(r.bootup));
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
}
```

In `package.json`: `"lcp:report": "node scripts/lcp-report.mjs"`.

- [ ] **Step 4: Run tests and the local reading**

Run: `npx vitest run tests/lcp-report.test.ts && npm run lcp:report -- .lighthouseci`
Expected: PASS y la tabla de arriba reproducida desde los LHR locales.

- [ ] **Step 5: Write the CI probe**

`ci.yml` solo corre en `pull_request` y el PR no se abre hasta el final; esta sonda corre en cada push a la rama y a mano. No es un servicio de pago: usa los minutos de Actions de la cuenta.

```yaml
# .github/workflows/lcp-probe.yml
name: LCP probe

on:
  push:
    branches: [feat/redesign-v3]
    paths: ["sgomez/**", ".github/workflows/lcp-probe.yml"]
  workflow_dispatch:

permissions:
  contents: read

jobs:
  probe:
    runs-on: ubuntu-24.04
    timeout-minutes: 30
    defaults:
      run:
        working-directory: sgomez
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: sgomez/package-lock.json
      - run: npm ci
      - name: Install Playwright Chromium
        run: npx playwright install --with-deps chromium
      - name: Allow Chromium's sandbox (AppArmor)
        run: sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0
      - name: Production build
        run: npm run build
      - name: Lighthouse, four variants
        run: |
          export CHROME_PATH="$(node -e 'console.log(require("@playwright/test").chromium.executablePath())')"
          npx next start -p 3000 &
          for i in $(seq 1 60); do curl -fs http://localhost:3000/ >/dev/null && break; sleep 1; done
          URLS="--collect.url=http://localhost:3000/ --collect.url=http://localhost:3000/about --collect.url=http://localhost:3000/developers"
          BASE="--collect.numberOfRuns=5 --collect.settings.skipAudits=robots-txt"
          # A: lo mismo que el CI (simulado)
          npx lhci collect $URLS $BASE --collect.settings.chromeFlags="--no-sandbox --headless=new" && mv .lighthouseci .lighthouseci-probe-simulate
          # B: estrangulado de verdad (devtools): si aquí el LCP baja de 2,5 s, el 10 s es el grafo de Lantern
          npx lhci collect $URLS $BASE --collect.settings.throttlingMethod=devtools --collect.settings.chromeFlags="--no-sandbox --headless=new" && mv .lighthouseci .lighthouseci-probe-devtools
          # C: H2, sin movimiento (el script del head pone data-motion-state=off y no aplica motion.css)
          npx lhci collect $URLS $BASE --collect.settings.chromeFlags="--no-sandbox --headless=new --force-prefers-reduced-motion" && mv .lighthouseci .lighthouseci-probe-reduced
          # D: H1, sin JS
          npx lhci collect $URLS $BASE --collect.settings.disableJavaScript=true --collect.settings.chromeFlags="--no-sandbox --headless=new" && mv .lighthouseci .lighthouseci-probe-nojs
          npm run lcp:report -- .lighthouseci-probe-simulate .lighthouseci-probe-devtools .lighthouseci-probe-reduced .lighthouseci-probe-nojs
      - uses: actions/upload-artifact@v4
        with:
          name: lcp-probe
          path: sgomez/.lighthouseci-probe-*
          retention-days: 14
```

Si `lhci collect` no acepta `disableJavaScript` por la línea de órdenes en la versión instalada, pásalo con un fichero `lighthouserc.probe-nojs.json` (`"settings": { "disableJavaScript": true }`) y `--config`.

- [ ] **Step 6: Commit, push and read the probe**

```bash
git add scripts/lcp-report-lib.mjs scripts/lcp-report.mjs tests/lcp-report.test.ts package.json ../.github/workflows/lcp-probe.yml
git commit -m "ci(site): sonda de LCP en Linux con cuatro variantes de Lighthouse y su informe"
git push
gh run watch "$(gh run list --workflow=lcp-probe.yml --branch feat/redesign-v3 --limit 1 --json databaseId -q '.[0].databaseId')"
gh run download --name lcp-probe --dir ../.superpowers/lcp-probe
```

- [ ] **Step 7: Decide with the numbers**

Lee el resumen del job y aplica la primera regla que se cumpla:
1. **D (sin JS) da LCP < 2,5 s y A no**: H1 confirmada. Identifica el chunk caro (`grep -l` de una cadena de su código en `.next/static/chunks/` y busca qué módulo de `src/` lo genera: `grep -rn "<cadena>" src`). Si es código del sitio que no hace falta antes del primer pintado, pásalo a `import()` tras idle o a un componente de servidor, y repite la sonda. Si es el runtime de React o de Next, no hay arreglo en el código: pasa a la regla 4.
2. **C (reducido) da LCP < 2,5 s y A no**: H2 confirmada. Mide qué reglas de `motion.css` cuestan (quita bloques uno a uno en una rama local y repite C y A). El arreglo probable es acotar los selectores de `animation-timeline` al capítulo y no a la página. Se hace en esta tarea solo si no cambia el movimiento visible; si lo cambia, se anota para Santiago.
3. **B (devtools) da LCP < 2,5 s y A ≈ 10 s**: el LCP real con estrangulado verdadero cumple; el 10 s es el grafo de Lantern sobre un primer pintado que espera a scripts locales. No se toca código; pasa a la regla 4.
4. **Ninguna mejora, o la causa no está en el código del sitio**: el LCP móvil de `lighthouserc.ci.json` queda como `error` (lo está) y se propone a Santiago una de dos, con las cifras: medir el LCP móvil con `throttlingMethod: devtools` en el CI o mantener simulado y aceptar el incumplimiento como deuda conocida. Pregunta abierta 2.

- [ ] **Step 8: Report and commit**

Escribe `docs/superpowers/progress/2026-10-02-fase-3-lcp.md` con las cuatro tablas, la regla aplicada, el arreglo si lo hubo (con la sonda repetida) y la propuesta para Santiago. Sin rayas ni dos puntos retóricos en el texto.

```bash
git add ../docs/superpowers/progress/2026-10-02-fase-3-lcp.md
git commit -m "docs(progress): sonda del LCP móvil en Linux y decisión"
```

---

### Task 3: Piezas compartidas del cristal y puerta única (núcleo)

Antes de escribir una sola escena nueva, lo que el 404 ya resolvió sale de sus ficheros y se comparte: la construcción de three (sin DOM, para que funcione en un worker) y la lectura de la puerta. El 404 sigue igual por fuera; sus e2e son la red.

**Files:**
- Create: `src/three/glass-kit.ts`, `src/lib/three/gate.ts`
- Modify: `src/three/ConstellationScene.tsx` (usa `glass-kit`), `src/chapters/lost/LostExperience.tsx:46-75` (usa `gate.ts`), `src/chapters/lost/media.ts` (`deviceMemory`), `src/lib/lost/shards.ts` (`slabOutlinePoints`)
- Test: `tests/glass-gate.test.ts`, `tests/glass-kit.test.ts`

**Interfaces:**
- Consumes: `GLASS`, `GLASS_MATERIAL`, `GLASS_ENV`, `mulberry32`, `type Shard` de `shards.ts`; `gatingPasses`, `isSoftwareRenderer`, `type Gate` de `media.ts`.
- Produces:
  - `slabOutlinePoints(): [number, number][]` en `shards.ts` (unidades de mundo, antihorario, `GLASS.slabOutline.n` puntos).
  - `media.ts`: `Gate.deviceMemory?: number`; `gatingPasses` exige `deviceMemory >= 4` cuando se sabe.
  - `gate.ts`: `probeWebGL2(): { ok: boolean; software: boolean }`, `readGate(): Gate` (el de `LostExperience`, más `deviceMemory`), `type GlassEnv`, `readGlassEnv(): GlassEnv`, `glassGatePasses(e: GlassEnv): boolean`, `LG_QUERY = "(min-width: 64rem)"`.
  - `glass-kit.ts`: `type Make2D = (w: number, h: number) => HTMLCanvasElement | OffscreenCanvas`, `type GlassProfile = "full" | "lite"`, `buildEnv(gl: THREE.WebGLRenderer): THREE.Texture`, `buildBackdrop(make2d: Make2D): THREE.MeshBasicMaterial`, `backdropMesh(mat): THREE.Mesh`, `addLights(scene: THREE.Object3D): void`, `shardGeometry(s: Shard): THREE.ExtrudeGeometry`, `slabGeometry(): THREE.ExtrudeGeometry`, `glassMaterial(env: THREE.Texture, profile?: GlassProfile, glow?: string): THREE.MeshPhysicalMaterial`, `materialParams(profile: GlassProfile)`.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/glass-gate.test.ts
import { describe, expect, it } from "vitest";
import { gatingPasses } from "@/chapters/lost/media";
import { glassGatePasses, type GlassEnv } from "@/lib/three/gate";
import { slabOutlinePoints, GLASS } from "@/lib/lost/shards";

const OK: GlassEnv = { lg: true, offscreen: true, motionOn: true, reducedMotion: false, saveData: false, cores: 8, deviceMemory: 8, forced: false };

describe("puerta del cristal", () => {
  it("pasa en un escritorio capaz", () => expect(glassGatePasses(OK)).toBe(true));
  for (const [k, v] of [["lg", false], ["offscreen", false], ["motionOn", false], ["reducedMotion", true], ["saveData", true], ["cores", 2], ["deviceMemory", 2]] as const) {
    it(`falla con ${k}=${String(v)}`, () => expect(glassGatePasses({ ...OK, [k]: v })).toBe(false));
  }
  it("deviceMemory y cores desconocidos no cierran la puerta", () => expect(glassGatePasses({ ...OK, cores: undefined, deviceMemory: undefined })).toBe(true));
  it("forzar (solo pruebas) no salta lg ni movimiento", () => {
    expect(glassGatePasses({ ...OK, lg: false, forced: true })).toBe(false);
    expect(glassGatePasses({ ...OK, motionOn: false, forced: true })).toBe(false);
  });
  it("el 404 también respeta deviceMemory", () => {
    expect(gatingPasses({ webgl2: true, reducedMotion: false, saveData: false, cores: 8, deviceMemory: 2 })).toBe(false);
    expect(gatingPasses({ webgl2: true, reducedMotion: false, saveData: false, cores: 8 })).toBe(true);
  });
});

describe("contorno del cristal entero", () => {
  it("tiene n puntos, cerrado alrededor del origen, en el radio de GLASS", () => {
    const pts = slabOutlinePoints();
    expect(pts).toHaveLength(GLASS.slabOutline.n);
    const r = pts.map(([x, y]) => Math.hypot(x, y));
    expect(Math.min(...r)).toBeGreaterThan(GLASS.slabRadius * 0.85);
    expect(Math.max(...r)).toBeLessThan(GLASS.slabRadius * 1.15);
  });
});
```

```ts
// tests/glass-kit.test.ts
import { describe, expect, it } from "vitest";
import { materialParams, slabGeometry, shardGeometry } from "@/three/glass-kit";
import { GLASS_MATERIAL, SHARDS } from "@/lib/lost/shards";

describe("glass-kit", () => {
  it("el perfil full es el material del 404 tal cual", () => {
    const p = materialParams("full");
    expect(p.transmission).toBe(GLASS_MATERIAL.transmission);
    expect(p.dispersion).toBe(GLASS_MATERIAL.dispersion);
  });
  it("el perfil lite quita la transmisión (sin pase de transmisión ni su shader)", () => {
    const p = materialParams("lite");
    expect(p.transmission).toBe(0);
    expect(p.dispersion).toBe(0);
    expect(p.iridescence).toBe(GLASS_MATERIAL.iridescence);
    expect(p.clearcoat).toBe(GLASS_MATERIAL.clearcoat);
  });
  it("las geometrías se construyen sin DOM", () => {
    const slab = slabGeometry();
    expect(slab.attributes.position!.count).toBeGreaterThan(100);
    expect(shardGeometry(SHARDS[0]!).attributes.position!.count).toBeGreaterThan(10);
    slab.dispose();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/glass-gate.test.ts tests/glass-kit.test.ts`
Expected: FAIL; no existen `@/lib/three/gate`, `@/three/glass-kit` ni `slabOutlinePoints`.

- [ ] **Step 3: Implement `shards.ts` and `media.ts`**

Añade al final de `src/lib/lost/shards.ts` (el fichero sigue sin imports):

```ts
/** Contorno del cristal entero (el de antes de romperse), en unidades de mundo. Mismo cálculo que `slabOutline()` de `video/scripts/bake-geometry.mjs`. */
export function slabOutlinePoints(): [number, number][] {
  const { n, waves } = GLASS.slabOutline;
  const out: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    let k = 1;
    for (const [freq, amp, phase] of waves) k += amp * Math.sin(freq * t + phase);
    const r = GLASS.slabRadius * k;
    out.push([Math.cos(t) * r, Math.sin(t) * r]);
  }
  return out;
}
```

En `src/chapters/lost/media.ts`, añade a `Gate` el campo `/** GB de RAM (navigator.deviceMemory), si el navegador lo dice. */ deviceMemory?: number;` y cambia `gatingPasses`:

```ts
/** WebGL2 por hardware, sin `prefers-reduced-motion`, sin Save-Data, 4 núcleos o más y 4 GB o más (si se saben). */
export function gatingPasses(g: Gate): boolean {
  return (
    g.webgl2 && !g.software && !g.reducedMotion && !g.saveData &&
    (g.cores === undefined || g.cores >= 4) &&
    (g.deviceMemory === undefined || g.deviceMemory >= 4)
  );
}
```

- [ ] **Step 4: Implement `gate.ts`**

```ts
// src/lib/three/gate.ts
import { gatingPasses, isSoftwareRenderer, type Gate } from "@/chapters/lost/media";
import { MOTION_ATTR } from "@/motion/boot";

/** El 3D solo existe desde aquí (spec del 404, §7.1). */
export const LG_QUERY = "(min-width: 64rem)";

type NavigatorExtras = Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };

/** Sonda de WebGL2 en el hilo principal. Solo la usa el 404 mientras su escena viva aquí (la Task 9 la lleva al worker). */
export function probeWebGL2(): { ok: boolean; software: boolean } {
  try {
    const c = document.createElement("canvas");
    const g = c.getContext("webgl2");
    if (!g) return { ok: false, software: false };
    const info = g.getExtension("WEBGL_debug_renderer_info");
    const name = info ? String(g.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    g.getExtension("WEBGL_lose_context")?.loseContext();
    return { ok: true, software: isSoftwareRenderer(name) };
  } catch {
    return { ok: false, software: false };
  }
}

const num = (v: unknown) => (typeof v === "number" && v > 0 ? v : undefined);

/** La puerta del 404, tal cual estaba en LostExperience, más deviceMemory. */
export function readGate(): Gate {
  const nav = navigator as NavigatorExtras;
  const gl = probeWebGL2();
  // Solo para pruebas: un init-script pone este indicador para ejercitar la ruta 3D aunque el Chromium de CI pinte por software.
  const forced = (window as { __LOST_FORCE_GATE__?: boolean }).__LOST_FORCE_GATE__ === true;
  return {
    webgl2: gl.ok,
    software: forced ? false : gl.software,
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: nav.connection?.saveData === true,
    cores: num(nav.hardwareConcurrency),
    deviceMemory: num(nav.deviceMemory),
  };
}

/** Lo que el hilo principal sabe del cristal SIN crear un contexto WebGL (la sonda de WebGL2 y de software la hace el worker). */
export type GlassEnv = {
  lg: boolean;
  offscreen: boolean;
  /** `data-motion-state="on"`: ya incluye movimiento reducido y Save-Data (ver motion/boot.ts). */
  motionOn: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  cores?: number;
  deviceMemory?: number;
  /** Solo pruebas: el worker no descarta el renderizador por software. */
  forced: boolean;
};

export function readGlassEnv(): GlassEnv {
  const nav = navigator as NavigatorExtras;
  return {
    lg: matchMedia(LG_QUERY).matches,
    offscreen: typeof HTMLCanvasElement !== "undefined" && "transferControlToOffscreen" in HTMLCanvasElement.prototype && typeof Worker !== "undefined",
    motionOn: document.documentElement.getAttribute(MOTION_ATTR) === "on",
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: nav.connection?.saveData === true,
    cores: num(nav.hardwareConcurrency),
    deviceMemory: num(nav.deviceMemory),
    forced: (window as { __GLASS_FORCE_GATE__?: boolean }).__GLASS_FORCE_GATE__ === true,
  };
}

/** Escritorio, movimiento permitido, OffscreenCanvas y un equipo capaz. WebGL2 y software los decide el worker. */
export function glassGatePasses(e: GlassEnv): boolean {
  return e.lg && e.offscreen && e.motionOn && gatingPasses({ webgl2: true, software: false, reducedMotion: e.reducedMotion, saveData: e.saveData, cores: e.cores, deviceMemory: e.deviceMemory });
}
```

En `LostExperience.tsx`, borra `probeWebGL2`, `NavigatorExtras` y `readGate` (líneas 46 a 75), importa `readGate` y `LG_QUERY` de `@/lib/three/gate` y usa `LG_QUERY` en lugar de la constante `LG`. El resto no cambia.

- [ ] **Step 5: Implement `glass-kit.ts` and slim `ConstellationScene.tsx`**

Mueve a `src/three/glass-kit.ts`, sin cambiar su cuerpo salvo lo indicado: `buildEnv` (líneas 39 a 80 de `ConstellationScene.tsx`), `buildBackdrop` (82 a 120; `document.createElement("canvas")` pasa a `make2d(B.size, B.size)` y el contexto se pide con `getContext("2d") as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D`), `shardGeometry` (122 a 137) y `glassMaterial` (139 a 152, ahora sobre `materialParams`). Añade lo nuevo:

```ts
// src/three/glass-kit.ts (cabecera y lo nuevo; los cuerpos movidos van debajo)
/* eslint-disable react-hooks/immutability -- objetos de three.js, imperativos */
import * as THREE from "three";
import { GLASS, GLASS_ENV, GLASS_MATERIAL, mulberry32, slabOutlinePoints, type Shard } from "@/lib/lost/shards";

/**
 * Piezas del cristal para cualquier escena: el 404 (fragmentos) y el hero y el
 * contacto (cristal entero). SIN DOM: corre igual en el hilo principal y en un
 * worker con OffscreenCanvas. Todo sale de shards.ts.
 */
export type Make2D = (w: number, h: number) => HTMLCanvasElement | OffscreenCanvas;
export type GlassProfile = "full" | "lite";

/**
 * full: el material del 404 tal cual (transmisión, dispersión, iridiscencia, clearcoat).
 * lite: sin transmisión ni dispersión. Three omite USE_TRANSMISSION, el pase de
 * transmisión y la parte más cara del shader; queda iridiscencia, clearcoat y entorno.
 */
export function materialParams(profile: GlassProfile) {
  const { attenuationColor, iridescenceThicknessRange, ...rest } = GLASS_MATERIAL;
  const base = { ...rest, iridescenceThicknessRange: [...iridescenceThicknessRange] as [number, number], attenuationColor };
  return profile === "full" ? base : { ...base, transmission: 0, dispersion: 0, thickness: 0 };
}

export function glassMaterial(env: THREE.Texture, profile: GlassProfile = "full", glow = "#9FB6FF"): THREE.MeshPhysicalMaterial {
  const { attenuationColor, ...p } = materialParams(profile);
  const m = new THREE.MeshPhysicalMaterial({ ...p, attenuationColor: new THREE.Color(attenuationColor), emissive: new THREE.Color(glow), emissiveIntensity: 0 });
  if (profile === "lite") {
    m.transparent = true;
    m.opacity = 0.9;
  }
  m.envMap = env;
  return m;
}

/** El cristal entero, antes de romperse: mismo grosor y bisel que un fragmento, a escala del cristal. */
export function slabGeometry(): THREE.ExtrudeGeometry {
  const k = GLASS.slabRadius;
  const B = GLASS.bevel;
  const shape = new THREE.Shape(slabOutlinePoints().map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: GLASS.depth * k,
    bevelEnabled: true,
    bevelThickness: B.thickness * k,
    bevelSize: B.size * k,
    bevelOffset: B.offset * k,
    bevelSegments: B.segments + 2,
    curveSegments: 1,
  });
  g.translate(0, 0, (-GLASS.depth * k) / 2);
  g.computeVertexNormals();
  return g;
}

/** El fondo de refracción solo se pinta en el pase de transmisión (ver ConstellationScene). */
export function backdropMesh(mat: THREE.MeshBasicMaterial): THREE.Mesh {
  const P = GLASS_ENV.backdrop.plane;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
  mesh.position.set(...P.pos);
  mesh.scale.set(P.scale, P.scale, 1);
  mesh.onBeforeRender = (renderer) => {
    const inTransmission = renderer.getRenderTarget() !== null;
    mat.colorWrite = inTransmission;
    mat.depthWrite = inTransmission;
  };
  return mesh;
}

export function addLights(scene: THREE.Object3D): void {
  for (const l of GLASS_ENV.lights) {
    const color = new THREE.Color(l.color);
    const light =
      l.type === "ambient" ? new THREE.AmbientLight(color, l.intensity)
      : l.type === "directional" ? new THREE.DirectionalLight(color, l.intensity)
      : new THREE.PointLight(color, l.intensity, 0, 2);
    if (l.pos) light.position.set(...l.pos);
    scene.add(light);
  }
}
```

En `ConstellationScene.tsx`, borra las funciones movidas e importa `buildEnv`, `buildBackdrop`, `shardGeometry`, `glassMaterial` de `./glass-kit`. Las llamadas cambian solo en `buildBackdrop((w, h) => Object.assign(document.createElement("canvas"), { width: w, height: h }))`. El JSX del fondo y las luces se queda como está (R3F); la Task 9 lo sustituye por `backdropMesh` y `addLights`.

- [ ] **Step 6: Run the unit tests and the 404 net**

Run: `npx vitest run && npx tsc --noEmit && npm run lint && npm run build && npx playwright test e2e/lost-experience.spec.ts e2e/lost.spec.ts --project=desktop --project=mobile && npm run budget`
Expected: todo PASS; el JS inicial del molde del 404 no sube más de 0,2 KB (solo se movió código).

- [ ] **Step 7: Commit**

```bash
git add src/three src/lib/three src/lib/lost/shards.ts src/chapters/lost tests/glass-gate.test.ts tests/glass-kit.test.ts
git commit -m "refactor(three): piezas del cristal sin DOM en glass-kit, puerta única con deviceMemory y contorno del cristal entero en shards.ts"
```

---

### Task 4: La escena del cristal en un worker (núcleo)

**Files:**
- Create: `src/three/protocol.ts`, `src/three/GlassScene.ts`, `src/three/glass.worker.ts`, `src/three/glass-client.ts`
- Modify: `scripts/js-budget-lib.mjs` (`chunkGraph`), `scripts/js-budget.mjs` (presupuestos del cliente y del worker), `e2e/experience.spec.ts:146-154` (el chunk 3D del 404 deja fuera el worker)
- Test: `tests/glass-protocol.test.ts`, `tests/js-budget.test.ts` (casos de `chunkGraph`)

**Interfaces:**
- Consumes: todo `glass-kit.ts` (Task 3), `CAMERA`, `unproject` de `shards.ts`, `isSoftwareRenderer` de `media.ts`.
- Produces:
  - `protocol.ts`: `type GlassId = "hero" | "contact"`; `type ToWorker = { type: "init"; id: GlassId; canvas: OffscreenCanvas; width: number; height: number; dpr: number; profile: GlassProfile; force: boolean } | { type: "resize"; id: GlassId; width: number; height: number; dpr: number } | { type: "visible"; id: GlassId; visible: boolean } | { type: "pointer"; x: number; y: number } | { type: "pause"; paused: boolean } | { type: "dispose"; id: GlassId }`; `type FailReason = "no-webgl2" | "software" | "context-lost" | "error" | "worker"`; `type FromWorker = { type: "ready"; id: GlassId; ms: number } | { type: "fail"; id: GlassId | "*"; reason: FailReason }`; `FRAME_MS = 33`; `PLACEMENTS: Record<"hero" | "contact", Placement>`; `type Placement = { left: number; top: number; z: number; scale: number; rest: { rx: number; ry: number; rz: number } }`; `pointerTarget(clientX, clientY, w, h): { x: number; y: number }`; `GLASS_PROFILE: GlassProfile`.
  - `GlassScene.ts`: `createGlassScene(canvas: OffscreenCanvas | HTMLCanvasElement, gl: WebGL2RenderingContext, o: { width: number; height: number; dpr: number; profile: GlassProfile; placement: Placement; make2d: Make2D }): Promise<GlassSceneHandle>`; `type GlassSceneHandle = { frame(dt: number, input: { x: number; y: number }, paused: boolean): void; resize(w: number, h: number, dpr: number): void; dispose(): void }`.
  - `glass.worker.ts`: `GLASS_WORKER_MARKER = "sgomez-glass-worker"`.
  - `glass-client.ts`: `GLASS_CLIENT_MARKER = "sgomez-glass-client"`; `mountGlass(canvas: HTMLCanvasElement, o: { id: GlassId; width: number; height: number; dpr: number; force: boolean }, on: (m: FromWorker) => void): { resize(w: number, h: number, dpr: number): void; visible(v: boolean): void; dispose(): void }`; `setPaused(p: boolean): void`; `isPaused(): boolean`; `onPaused(cb: (p: boolean) => void): () => void`. Ventana, solo pruebas: `__GLASS_LIVE_WORKERS__: number`.
  - `js-budget-lib.mjs`: `chunkGraph(files: string[], seeds: string[], read: (f: string) => string, exclude?: Set<string>): Set<string>`.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/glass-protocol.test.ts
import { describe, expect, it } from "vitest";
import { FRAME_MS, PLACEMENTS, pointerTarget } from "@/three/protocol";

describe("protocolo del cristal", () => {
  it("30 fps como máximo", () => expect(FRAME_MS).toBe(33));
  it("el puntero se normaliza a -1..1 y se recorta", () => {
    expect(pointerTarget(0, 0, 1000, 800)).toEqual({ x: -1, y: -1 });
    expect(pointerTarget(500, 400, 1000, 800)).toEqual({ x: 0, y: 0 });
    expect(pointerTarget(5000, -50, 1000, 800)).toEqual({ x: 1, y: -1 });
  });
  it("el cristal del hero se coloca donde el póster pinta el suyo", () => {
    // GlassPoster: translate(238 166) sobre una caja de 400
    expect(PLACEMENTS.hero.left).toBeCloseTo(59.5, 1);
    expect(PLACEMENTS.hero.top).toBeCloseTo(41.5, 1);
    expect(PLACEMENTS.contact.left).toBeCloseTo(59.5, 1);
  });
});
```

Añade a `tests/js-budget.test.ts`:

```ts
// @ts-expect-error módulo .mjs sin tipos
import { chunkGraph } from "../scripts/js-budget-lib.mjs";

describe("presupuesto: grafo de chunks", () => {
  const FILES: Record<string, string> = { "w.js": 'importScripts("static/chunks/t.js")', "t.js": "three", "i.js": "inicial", "x.js": "nadie" };
  it("sigue las referencias por nombre desde las semillas y salta lo excluido", () => {
    const g = chunkGraph(Object.keys(FILES), ["w.js"], (f: string) => FILES[f]!, new Set(["i.js"]));
    expect([...g].sort()).toEqual(["t.js", "w.js"]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/glass-protocol.test.ts tests/js-budget.test.ts`
Expected: FAIL, no existen `@/three/protocol` ni `chunkGraph`.

- [ ] **Step 3: Implement `protocol.ts`**

```ts
// src/three/protocol.ts
import type { GlassProfile } from "./glass-kit";

/** Mensajes entre el hilo principal y el worker del cristal. Sin imports de valor: lo importan los dos lados. */
export type GlassId = "hero" | "contact";
export type FailReason = "no-webgl2" | "software" | "context-lost" | "error" | "worker";

export type ToWorker =
  | { type: "init"; id: GlassId; canvas: OffscreenCanvas; width: number; height: number; dpr: number; profile: GlassProfile; force: boolean }
  | { type: "resize"; id: GlassId; width: number; height: number; dpr: number }
  | { type: "visible"; id: GlassId; visible: boolean }
  | { type: "pointer"; x: number; y: number }
  | { type: "pause"; paused: boolean }
  | { type: "dispose"; id: GlassId };

export type FromWorker = { type: "ready"; id: GlassId; ms: number } | { type: "fail"; id: GlassId | "*"; reason: FailReason };

/** Tope de 30 fps, como el 404. */
export const FRAME_MS = 33;

/**
 * Perfil de material. Lo fija la Task 4 (Step 8) con lo medido: "full" si el primer
 * fotograma llega en ≤ 1500 ms y el hilo principal no pierde fotogramas de más de 100 ms;
 * si no, "lite".
 */
export const GLASS_PROFILE: GlassProfile = "full";

/** Centro del cristal en % de su caja (el mismo sitio que el blob de GlassPoster), profundidad, escala y pose de reposo. */
export type Placement = { left: number; top: number; z: number; scale: number; rest: { rx: number; ry: number; rz: number } };

/** Solo el cristal entero (hero y contacto); el 404 de la Task 9 tiene su propia escena. */
export const PLACEMENTS: Record<"hero" | "contact", Placement> = {
  hero: { left: 59.5, top: 41.5, z: 0, scale: 0.95, rest: { rx: -0.32, ry: 0.42, rz: 0.12 } },
  contact: { left: 59.5, top: 41.5, z: 0, scale: 0.9, rest: { rx: 0.28, ry: -0.5, rz: -0.18 } },
};

const clamp = (v: number) => Math.min(1, Math.max(-1, v));
export function pointerTarget(clientX: number, clientY: number, w: number, h: number): { x: number; y: number } {
  return { x: clamp((clientX / Math.max(1, w) - 0.5) * 2), y: clamp((clientY / Math.max(1, h) - 0.5) * 2) };
}
```

- [ ] **Step 4: Implement `GlassScene.ts`**

```ts
// src/three/GlassScene.ts
/* eslint-disable react-hooks/immutability -- objetos de three.js, imperativos */
import * as THREE from "three";
import { CAMERA, unproject } from "@/lib/lost/shards";
import { addLights, backdropMesh, buildBackdrop, buildEnv, glassMaterial, slabGeometry, type GlassProfile, type Make2D } from "./glass-kit";
import type { Placement } from "./protocol";

/**
 * El cristal entero de la marca, vivo: flota, gira muy despacio y se inclina hacia
 * el puntero. Sin DOM: corre en el worker sobre un OffscreenCanvas. Mismo material,
 * entorno, luces y cámara que el 404 (todo de shards.ts vía glass-kit).
 */
export type GlassSceneHandle = {
  frame(dt: number, input: { x: number; y: number }, paused: boolean): void;
  resize(w: number, h: number, dpr: number): void;
  dispose(): void;
};

const DEG = Math.PI / 180;
const TILT = 9 * DEG;
const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export async function createGlassScene(
  canvas: OffscreenCanvas | HTMLCanvasElement,
  gl: WebGL2RenderingContext,
  o: { width: number; height: number; dpr: number; profile: GlassProfile; placement: Placement; make2d: Make2D },
  step: () => Promise<void> = () => new Promise((r) => setTimeout(r, 0)),
): Promise<GlassSceneHandle> {
  const renderer = new THREE.WebGLRenderer({ canvas, context: gl, antialias: true, alpha: true });
  // Lo que R3F pone por defecto en el 404: mismo aspecto.
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(o.dpr, 1.25));
  renderer.setSize(o.width, o.height, false);

  const camera = new THREE.PerspectiveCamera(CAMERA.fov, o.width / Math.max(1, o.height), 0.1, 60);
  camera.position.set(...CAMERA.position);
  const scene = new THREE.Scene();

  await step();
  const env = buildEnv(renderer);
  await step();
  const backdrop = o.profile === "full" ? buildBackdrop(o.make2d) : null;
  if (backdrop) scene.add(backdropMesh(backdrop));
  addLights(scene);
  await step();
  const geo = slabGeometry();
  const mat = glassMaterial(env, o.profile);
  const group = new THREE.Group();
  group.add(new THREE.Mesh(geo, mat));
  scene.add(group);

  const P = o.placement;
  const restQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(P.rest.rx, P.rest.ry, P.rest.rz, "XYZ"));
  const qa = new THREE.Quaternion();
  const qb = new THREE.Quaternion();
  const ex = new THREE.Euler();
  const inp = { x: 0, y: 0 };
  let t = 0;
  let aspect = o.width / Math.max(1, o.height);

  // El enlazado del shader ocurre aquí, en el hilo del worker. El hilo principal no lo ve.
  renderer.compile(scene, camera);

  const place = () => {
    const base = unproject(P.left, P.top, P.z, aspect);
    return base;
  };
  let base = place();

  return {
    frame(dt, input, paused) {
      if (!paused) {
        t += dt;
        const k = 1 - Math.exp(-dt * 4);
        inp.x += (input.x - inp.x) * k;
        inp.y += (input.y - inp.y) * k;
      }
      // Entrada estilo keynote: llega 18° girado y se asienta en 1,6 s.
      const intro = smooth(clamp01(t / 1.6));
      const float = Math.sin(t * 0.6) * 0.06 * intro;
      group.position.set(base.x + inp.x * 0.12 * intro, base.y + float - inp.y * 0.08 * intro, P.z);
      ex.set(inp.y * TILT * intro, inp.x * TILT * intro + (1 - intro) * 18 * DEG, 0, "XYZ");
      qa.setFromEuler(ex);
      ex.set(Math.sin(t * 0.35) * 0.05, t * 0.08, Math.cos(t * 0.3) * 0.03, "XYZ");
      qb.setFromEuler(ex);
      group.quaternion.copy(qa).multiply(restQ).multiply(qb);
      group.scale.setScalar(P.scale * (0.94 + 0.06 * intro));
      renderer.render(scene, camera);
    },
    resize(w, h, dpr) {
      aspect = w / Math.max(1, h);
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(dpr, 1.25));
      renderer.setSize(w, h, false);
      base = place();
    },
    dispose() {
      geo.dispose();
      mat.dispose();
      env.dispose();
      backdrop?.map?.dispose();
      backdrop?.dispose();
      renderer.dispose();
    },
  };
}
```

- [ ] **Step 5: Implement the worker**

```ts
// src/three/glass.worker.ts
import { isSoftwareRenderer } from "@/chapters/lost/media";
import { createGlassScene, type GlassSceneHandle } from "./GlassScene";
import { FRAME_MS, PLACEMENTS, type FailReason, type FromWorker, type GlassId, type ToWorker } from "./protocol";

/** Lo busca `npm run budget` para localizar este chunk. No lo quites. */
export const GLASS_WORKER_MARKER = "sgomez-glass-worker";

type Scope = {
  postMessage(m: FromWorker): void;
  onmessage: ((e: MessageEvent<ToWorker>) => void) | null;
  requestAnimationFrame?: (cb: (t: number) => void) => number;
};
const ctx = self as unknown as Scope;
const post = (m: FromWorker) => ctx.postMessage(m);
const raf = (cb: (t: number) => void) => (ctx.requestAnimationFrame ? ctx.requestAnimationFrame(cb) : setTimeout(() => cb(performance.now()), FRAME_MS));

type Slot = { scene: GlassSceneHandle | null; visible: boolean; frames: number; t0: number };
const slots = new Map<GlassId, Slot>();
const input = { x: 0, y: 0 };
let paused = false;
let running = false;
let last = 0;

function loop(t: number) {
  running = false;
  let any = false;
  const dt = last ? Math.min((t - last) / 1000, 0.05) : 0;
  if (!last || t - last >= FRAME_MS) {
    last = t;
    for (const [id, s] of slots) {
      if (!s.scene || !s.visible) continue;
      s.scene.frame(dt, input, paused);
      s.frames++;
      // el primer fotograma ya está en el lienzo cuando llega el siguiente rAF: avisar entonces
      if (s.frames === 2) post({ type: "ready", id, ms: Math.round(performance.now() - s.t0) });
    }
  }
  for (const s of slots.values()) if (s.scene && s.visible && (!paused || s.frames < 2)) any = true;
  if (any) kick();
}
function kick() {
  if (running) return;
  running = true;
  raf(loop);
}

ctx.onmessage = async (e) => {
  const m = e.data;
  switch (m.type) {
    case "init": {
      const slot: Slot = { scene: null, visible: true, frames: 0, t0: performance.now() };
      slots.set(m.id, slot);
      try {
        const gl = m.canvas.getContext("webgl2", { alpha: true, antialias: true, powerPreference: "high-performance" }) as WebGL2RenderingContext | null;
        if (!gl) return fail(m.id, "no-webgl2");
        const info = gl.getExtension("WEBGL_debug_renderer_info");
        const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
        if (!m.force && isSoftwareRenderer(name)) return fail(m.id, "software");
        m.canvas.addEventListener("webglcontextlost", (ev) => {
          ev.preventDefault();
          fail(m.id, "context-lost");
        });
        const scene = await createGlassScene(m.canvas, gl, {
          width: m.width,
          height: m.height,
          dpr: m.dpr,
          profile: m.profile,
          placement: PLACEMENTS[m.id as "hero" | "contact"],
          make2d: (w, h) => new OffscreenCanvas(w, h),
        });
        if (slots.get(m.id) !== slot) return scene.dispose();
        slot.scene = scene;
        kick();
      } catch {
        fail(m.id, "error");
      }
      return;
    }
    case "resize":
      slots.get(m.id)?.scene?.resize(m.width, m.height, m.dpr);
      if (paused) {
        const s = slots.get(m.id);
        s?.scene?.frame(0, input, true);
      }
      return;
    case "visible": {
      const s = slots.get(m.id);
      if (s) s.visible = m.visible;
      kick();
      return;
    }
    case "pointer":
      input.x = m.x;
      input.y = m.y;
      return;
    case "pause":
      paused = m.paused;
      kick();
      return;
    case "dispose": {
      slots.get(m.id)?.scene?.dispose();
      slots.delete(m.id);
      return;
    }
  }
};

function fail(id: GlassId, reason: FailReason) {
  slots.get(id)?.scene?.dispose();
  slots.delete(id);
  post({ type: "fail", id, reason });
}
```

- [ ] **Step 6: Implement the client**

```ts
// src/three/glass-client.ts
import { GLASS_PROFILE, pointerTarget, type FromWorker, type GlassId, type ToWorker } from "./protocol";

/** Lo busca `npm run budget`. No lo quites. */
export const GLASS_CLIENT_MARKER = "sgomez-glass-client";

/**
 * Lado del hilo principal: UN worker para todos los lienzos, creado al primer
 * montaje y terminado al último desmontaje. Aquí solo hay postMessage: nada de
 * WebGL en este hilo.
 */
type Listener = (m: FromWorker) => void;
let worker: Worker | null = null;
const listeners = new Map<GlassId, Listener>();
let paused = false;
const pauseSubs = new Set<(p: boolean) => void>();
let offPointer: (() => void) | null = null;

type Hooks = { __GLASS_LIVE_WORKERS__?: number };
const live = (d: number) => {
  const w = window as Hooks;
  w.__GLASS_LIVE_WORKERS__ = (w.__GLASS_LIVE_WORKERS__ ?? 0) + d;
};

function send(m: ToWorker, transfer: Transferable[] = []) {
  worker?.postMessage(m, transfer);
}

function getWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL("./glass.worker.ts", import.meta.url), { type: "module", name: "glass" });
  live(1);
  worker.onmessage = (e: MessageEvent<FromWorker>) => {
    const m = e.data;
    if (m.id === "*") listeners.forEach((l) => l(m));
    else listeners.get(m.id)?.(m);
  };
  worker.onerror = (ev) => {
    ev.preventDefault();
    listeners.forEach((l, id) => l({ type: "fail", id, reason: "worker" }));
  };
  if (paused) send({ type: "pause", paused });
  return worker;
}

function startPointer() {
  if (offPointer || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  let raf = 0;
  let x = 0;
  let y = 0;
  const move = (e: PointerEvent) => {
    x = e.clientX;
    y = e.clientY;
    if (!raf) raf = requestAnimationFrame(() => {
      raf = 0;
      send({ type: "pointer", ...pointerTarget(x, y, innerWidth, innerHeight) });
    });
  };
  const leave = () => send({ type: "pointer", x: 0, y: 0 });
  addEventListener("pointermove", move, { passive: true });
  document.documentElement.addEventListener("pointerleave", leave);
  offPointer = () => {
    removeEventListener("pointermove", move);
    document.documentElement.removeEventListener("pointerleave", leave);
    if (raf) cancelAnimationFrame(raf);
    offPointer = null;
  };
}

export function mountGlass(canvas: HTMLCanvasElement, o: { id: GlassId; width: number; height: number; dpr: number; force: boolean }, on: Listener) {
  const w = getWorker();
  listeners.set(o.id, on);
  const off = canvas.transferControlToOffscreen();
  w.postMessage({ type: "init", id: o.id, canvas: off, width: o.width, height: o.height, dpr: o.dpr, profile: GLASS_PROFILE, force: o.force } satisfies ToWorker, [off]);
  startPointer();
  let gone = false;
  return {
    resize: (width: number, height: number, dpr: number) => !gone && send({ type: "resize", id: o.id, width, height, dpr }),
    visible: (v: boolean) => !gone && send({ type: "visible", id: o.id, visible: v }),
    dispose() {
      if (gone) return;
      gone = true;
      send({ type: "dispose", id: o.id });
      listeners.delete(o.id);
      if (listeners.size === 0) {
        offPointer?.();
        worker?.terminate();
        worker = null;
        live(-1);
      }
    },
  };
}

export const isPaused = () => paused;
export function setPaused(p: boolean) {
  paused = p;
  send({ type: "pause", paused: p });
  pauseSubs.forEach((cb) => cb(p));
}
export function onPaused(cb: (p: boolean) => void) {
  pauseSubs.add(cb);
  return () => void pauseSubs.delete(cb);
}
```

- [ ] **Step 7: Budget the new chunks**

Añade a `scripts/js-budget-lib.mjs`:

```js
/** Desde las semillas, todos los chunks que se nombran unos a otros (por nombre de fichero), sin los excluidos. */
export function chunkGraph(files, seeds, read, exclude = new Set()) {
  const graph = new Set();
  const queue = [...seeds];
  while (queue.length) {
    const f = queue.pop();
    if (graph.has(f) || exclude.has(f)) continue;
    graph.add(f);
    const text = read(f);
    for (const g of files) if (g !== f && text.includes(g)) queue.push(g);
  }
  return graph;
}
```

En `scripts/js-budget.mjs`: sustituye el bucle `while (queue.length)` del runtime por `chunkGraph(files, queue, (f) => readFileSync(join(chunks, f), "utf8"), initialAll)`; añade a `BUDGET` `glassClientKB: 4` y `glassWorkerKB: 250`; y al final, antes del CSS:

```js
// Cristal: el cliente perezoso y el worker (three). El worker puede salir fuera de static/chunks: se busca en todo static/.
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
const allJs = walk(join(NEXT, "static")).filter((f) => f.endsWith(".js"));
const rel = (f) => f.slice(join(NEXT, "static").length + 1).replace(/\\/g, "/");
const byName = new Map(allJs.map((f) => [rel(f).split("/").pop(), f]));
for (const [label, marker, limit] of [["cliente del cristal", "sgomez-glass-client", BUDGET.glassClientKB], ["worker del cristal", "sgomez-glass-worker", BUDGET.glassWorkerKB]]) {
  const seeds = [...byName].filter(([, f]) => readFileSync(f, "utf8").includes(marker)).map(([n]) => n);
  if (seeds.length === 0) { console.log(`${label}: todavia no existe`); continue; }
  const exclude = new Set([...initialAll, ...(label.startsWith("cliente") ? [...byName.keys()].filter((n) => readFileSync(byName.get(n), "utf8").includes("sgomez-glass-worker")) : [])]);
  const g = chunkGraph([...byName.keys()], seeds, (n) => readFileSync(byName.get(n), "utf8"), exclude);
  const kb = [...g].reduce((s, n) => s + gz(byName.get(n)), 0);
  console.log(`${label}: ${kb.toFixed(1)} KB gzip en ${g.size} chunks`);
  if (kb > limit) { failed = true; console.error(`  SE PASA de ${limit} KB`); }
}
```

En `e2e/experience.spec.ts`, en el test del chunk 3D (línea 148), añade `.filter((f) => !readFileSync(join(dir, f), "utf8").includes("sgomez-glass-worker"))` al listado: el worker tiene su propio presupuesto en `npm run budget`.

- [ ] **Step 8: Run, build and measure the profile**

Run: `npx vitest run && npx tsc --noEmit && npm run lint && npm run build && npm run budget`
Expected: PASS; el worker del cristal aparece con ≤ 250 KB y el cliente con ≤ 4 KB. Si `npm run budget` dice «worker del cristal: todavia no existe», el cliente aún no lo importa nadie: es lo esperado hasta la Task 5; repite esta medida allí.

Si Turbopack no emite el worker con `new Worker(new URL("./glass.worker.ts", import.meta.url), { type: "module" })` (el build falla o el chunk no aparece en la Task 5), para y repórtalo: no se cambia a un worker en `public/` sin hablarlo, porque saldría del grafo del build y de su hash.

La medida del perfil (`GLASS_PROFILE`) se hace en la Task 5, Step 7, cuando hay página donde montarlo.

- [ ] **Step 9: Commit**

```bash
git add src/three scripts/js-budget-lib.mjs scripts/js-budget.mjs tests/glass-protocol.test.ts tests/js-budget.test.ts e2e/experience.spec.ts
git commit -m "feat(three): cristal entero en un worker con OffscreenCanvas, protocolo, cliente compartido y presupuesto del worker"
```

---

### Task 5: `GlassStage` en el hero, con sus reservas (núcleo)

**Files:**
- Create: `src/components/GlassStage.tsx`, `e2e/glass-hero.spec.ts`, `e2e/glass-utils.ts`
- Modify: `src/chapters/Hero.tsx:20-23`, `src/motion/motion.css` (relevo póster→lienzo), `src/i18n/dictionaries/{es,en}.ts` (`glass.pause`), `src/three/protocol.ts` (`GLASS_PROFILE` medido)
- Test: `tests/glass-stage.test.tsx`

**Interfaces:**
- Consumes: `readGlassEnv`, `glassGatePasses`, `LG_QUERY` (Task 3); `mountGlass`, `setPaused`, `isPaused`, `onPaused` (Task 4) por `import()`.
- Produces: `<GlassStage id="hero" | "contact" pauseLabel={string} className?={string}>{poster}</GlassStage>`; atributo `data-glass="poster" | "loading" | "live" | "off"` en su raíz; marcas `glass:start:<id>` y `glass:ready:<id>`; clave de diccionario `glass.pause`.

- [ ] **Step 1: Write the failing tests**

```tsx
// tests/glass-stage.test.tsx
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Hero from "@/chapters/Hero";
import { getDictionary } from "@/i18n";

describe("GlassStage en el HTML del servidor", () => {
  for (const lang of ["es", "en"] as const) {
    const html = renderToStaticMarkup(<Hero lang={lang} />);
    it(`${lang}: el póster está, sin lienzo, sin botón y en estado poster`, () => {
      expect(html).toMatch(/data-glass="poster"/);
      expect(html).toMatch(/data-motion="glass"/);
      expect(html).not.toMatch(/<canvas/);
      expect(html).not.toMatch(/aria-pressed/);
      expect(html).not.toMatch(/(opacity: ?0|visibility: ?hidden)/);
    });
    it(`${lang}: el nombre del h1 sigue entero`, () => expect(html).toMatch(/<h1[^>]*>.*Santiago Gómez de la Torre\./s));
  }
  it("la etiqueta de pausa existe en los dos idiomas", () => {
    expect(getDictionary("es").glass.pause).toBe("Pausar el cristal");
    expect(getDictionary("en").glass.pause).toBe("Pause the glass");
  });
});
```

```ts
// e2e/glass-utils.ts
import type { Page } from "@playwright/test";

/** El Chromium de CI pinta WebGL por software: el worker lo descartaría. Esto lo fuerza, como __LOST_FORCE_GATE__ en el 404. */
export async function forceGlass(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __GLASS_FORCE_GATE__: boolean }).__GLASS_FORCE_GATE__ = true;
  });
}

/** Tareas largas del hilo principal desde el inicio de la carga. */
export async function watchLongTasks(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __lt: { start: number; d: number }[] };
    w.__lt = [];
    new PerformanceObserver((l) => l.getEntries().forEach((e) => w.__lt.push({ start: e.startTime, d: e.duration }))).observe({ type: "longtask", buffered: true });
  });
}

/** Tareas largas entre glass:start:<id> y glass:ready:<id>. */
export async function longTasksDuringGlass(page: Page, id: string) {
  return page.evaluate((id) => {
    const s = performance.getEntriesByName(`glass:start:${id}`)[0]?.startTime ?? Infinity;
    const r = performance.getEntriesByName(`glass:ready:${id}`)[0]?.startTime ?? -Infinity;
    return (window as unknown as { __lt: { start: number; d: number }[] }).__lt.filter((t) => t.start + t.d > s && t.start < r).map((t) => Math.round(t.d));
  }, id);
}

/** Bloquea el worker del cristal por su contenido (el nombre cambia en cada build). */
export async function blockGlassWorker(page: Page) {
  const state = { aborted: false };
  await page.context().route("**/_next/static/**/*.js", async (route) => {
    const res = await route.fetch();
    const body = await res.text();
    if (body.includes("sgomez-glass-worker")) {
      state.aborted = true;
      await route.abort();
    } else await route.fulfill({ response: res, body });
  });
  return state;
}
```

```ts
// e2e/glass-hero.spec.ts
import { test, expect } from "./fixtures";
import { blockGlassWorker, forceGlass, longTasksDuringGlass, watchLongTasks } from "./glass-utils";

const HERO = '#top [data-glass]';

test.describe("cristal vivo del hero (escritorio)", () => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name !== "desktop", "solo escritorio");
    test.setTimeout(90_000);
  });

  test("toma el relevo del póster, sin tareas largas en el hilo principal y sin tocar el LCP", async ({ page }) => {
    await watchLongTasks(page);
    await forceGlass(page);
    await page.goto("/");
    await expect(page.locator(HERO)).toHaveAttribute("data-glass", "live", { timeout: 45_000 });
    await expect(page.locator(`${HERO} canvas`)).toHaveCSS("opacity", "1");
    expect(await longTasksDuringGlass(page, "hero")).toEqual([]);
    const lcp = await page.evaluate(() => {
      const e = performance.getEntriesByType("largest-contentful-paint").at(-1) as (PerformanceEntry & { element?: Element }) | undefined;
      return { tag: e?.element?.tagName ?? "", t: e?.startTime ?? 0, start: performance.getEntriesByName("glass:start:hero")[0]?.startTime ?? 0 };
    });
    expect(["H1", "IMG"]).toContain(lcp.tag);
    expect(lcp.t).toBeLessThan(lcp.start);
  });

  test("pausa con aria-pressed y teclado", async ({ page }) => {
    await forceGlass(page);
    await page.goto("/");
    await expect(page.locator(HERO)).toHaveAttribute("data-glass", "live", { timeout: 45_000 });
    const pause = page.locator(`${HERO} button[aria-pressed]`);
    await expect(pause).toHaveAttribute("aria-pressed", "false");
    await pause.focus();
    await page.keyboard.press("Enter");
    await expect(pause).toHaveAttribute("aria-pressed", "true");
    const box = await pause.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test("Review Focus 1: cruzar lg desmonta el lienzo y no vuelve", async ({ page }) => {
    await forceGlass(page);
    await page.goto("/");
    await expect(page.locator(HERO)).toHaveAttribute("data-glass", "live", { timeout: 45_000 });
    await page.setViewportSize({ width: 800, height: 800 });
    await expect(page.locator(HERO)).toHaveAttribute("data-glass", "off");
    await expect(page.locator(`${HERO} canvas`)).toHaveCount(0);
    await expect(page.locator(`${HERO} button[aria-pressed]`)).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => (window as unknown as { __GLASS_LIVE_WORKERS__?: number }).__GLASS_LIVE_WORKERS__ ?? 0)).toBe(0);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(1500);
    await expect(page.locator(`${HERO} canvas`)).toHaveCount(0);
  });

  test("Review Focus 2: movimiento reducido a mitad de visita devuelve el póster", async ({ page }) => {
    await forceGlass(page);
    await page.goto("/");
    await expect(page.locator(HERO)).toHaveAttribute("data-glass", "live", { timeout: 45_000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator(HERO)).toHaveAttribute("data-glass", "off");
    await expect(page.locator(`${HERO} [data-motion="glass"]`)).toHaveCSS("opacity", "1");
    await expect.poll(() => page.evaluate(() => (window as unknown as { __GLASS_LIVE_WORKERS__?: number }).__GLASS_LIVE_WORKERS__ ?? 0)).toBe(0);
  });

  test("Review Focus 3: worker bloqueado, póster completo y sin errores", async ({ page, consoleErrors }) => {
    await forceGlass(page);
    const state = await blockGlassWorker(page);
    await page.goto("/");
    await expect(page.locator(HERO)).toHaveAttribute("data-glass", "off", { timeout: 30_000 });
    expect(state.aborted).toBe(true);
    await expect(page.locator(`${HERO} [data-motion="glass"]`)).toBeVisible();
    // el aborto deja su propio mensaje de red: se filtra solo ese
    consoleErrors.splice(0, consoleErrors.length, ...consoleErrors.filter((e) => !/ERR_FAILED/.test(e)));
  });

  test("Review Focus 3: sin OffscreenCanvas no se pide el worker", async ({ page }) => {
    await forceGlass(page);
    await page.addInitScript(() => {
      delete (HTMLCanvasElement.prototype as unknown as { transferControlToOffscreen?: unknown }).transferControlToOffscreen;
    });
    const asked: string[] = [];
    page.on("request", (r) => r.url().includes("/_next/") && r.resourceType() === "script" && asked.push(r.url()));
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(3500);
    await expect(page.locator(HERO)).toHaveAttribute("data-glass", "poster");
    expect(await page.evaluate(() => (window as unknown as { __GLASS_LIVE_WORKERS__?: number }).__GLASS_LIVE_WORKERS__ ?? 0)).toBe(0);
  });

  test("Save-Data: nunca hay worker", async ({ page }) => {
    await forceGlass(page);
    await page.addInitScript(() => Object.defineProperty(navigator, "connection", { value: { saveData: true } }));
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(3500);
    await expect(page.locator(HERO)).toHaveAttribute("data-glass", "poster");
  });

  test("equipo modesto (2 núcleos): póster", async ({ page }) => {
    await forceGlass(page);
    await page.addInitScript(() => Object.defineProperty(navigator, "hardwareConcurrency", { value: 2 }));
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(3500);
    await expect(page.locator(HERO)).toHaveAttribute("data-glass", "poster");
  });
});

test("móvil y horizontal: nunca hay lienzo ni worker", async ({ page }, info) => {
  test.skip(!["mobile", "landscape", "small", "tablet"].includes(info.project.name), "solo por debajo de lg");
  await forceGlass(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(3500);
  await expect(page.locator(HERO)).toHaveAttribute("data-glass", "poster");
  await expect(page.locator(`${HERO} canvas`)).toHaveCount(0);
});

test("sin JS: póster en su sitio", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator(`${HERO} [data-motion="glass"]`)).toBeVisible();
  await ctx.close();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/glass-stage.test.tsx`
Expected: FAIL, no hay `data-glass` ni `glass.pause`.

- [ ] **Step 3: Implement `GlassStage.tsx`**

```tsx
// src/components/GlassStage.tsx
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { LG_QUERY, glassGatePasses, readGlassEnv } from "@/lib/three/gate";
import { MOTION_ATTR } from "@/motion/boot";
import type { GlassId } from "@/three/protocol";

type State = "poster" | "loading" | "live" | "off";
type Idle = (cb: () => void, o?: { timeout: number }) => number;

/**
 * El póster del servidor (children) y, en un escritorio que pasa la puerta, el
 * cristal vivo encima. Recibe solo cadenas e hijos del servidor. La decisión se
 * toma UNA vez por visita: si algo la tumba (cruzar lg, movimiento reducido,
 * fallo del worker) vuelve el póster y ya no se reintenta.
 */
export default function GlassStage({ id, pauseLabel, className = "", children }: { id: GlassId; pauseLabel: string; className?: string; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<State>("poster");
  const [paused, setPausedState] = useState(false);
  const client = useRef<typeof import("@/three/glass-client") | null>(null);

  // 1. Puerta y arranque: tras load y un hueco ocioso; el contacto además espera a estar a menos de un viewport.
  useEffect(() => {
    const env = readGlassEnv();
    if (!glassGatePasses(env)) return;
    let cancelled = false;
    let idle = 0;
    let io: IntersectionObserver | null = null;
    const go = () => {
      if (cancelled) return;
      performance.mark(`glass:start:${id}`);
      setState("loading");
    };
    const near = () => {
      if (id === "hero") return go();
      io = new IntersectionObserver(([e]) => {
        if (e?.isIntersecting) {
          io?.disconnect();
          go();
        }
      }, { rootMargin: "100% 0px" });
      if (box.current) io.observe(box.current);
    };
    const w = window as unknown as { requestIdleCallback?: Idle; cancelIdleCallback?: (h: number) => void };
    const schedule = () => (idle = w.requestIdleCallback ? w.requestIdleCallback(near, { timeout: 3000 }) : window.setTimeout(near, 300));
    if (document.readyState === "complete") schedule();
    else addEventListener("load", schedule, { once: true });
    return () => {
      cancelled = true;
      removeEventListener("load", schedule);
      io?.disconnect();
      if (w.cancelIdleCallback) w.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, [id]);

  // 2. Montaje en el worker cuando el <canvas> existe.
  useEffect(() => {
    if (state !== "loading") return;
    const el = canvas.current;
    const root = box.current;
    if (!el || !root) return;
    let handle: { resize(w: number, h: number, dpr: number): void; visible(v: boolean): void; dispose(): void } | null = null;
    let alive = true;
    const off = () => {
      handle?.dispose();
      handle = null;
      if (alive) setState("off");
    };
    import("@/three/glass-client")
      .then((c) => {
        if (!alive) return;
        client.current = c;
        setPausedState(c.isPaused());
        const r = root.getBoundingClientRect();
        handle = c.mountGlass(el, { id, width: Math.round(r.width), height: Math.round(r.height), dpr: devicePixelRatio, force: readGlassEnv().forced }, (m) => {
          if (m.type === "ready") {
            performance.mark(`glass:ready:${id}`);
            setState("live");
          } else off();
        });
      })
      .catch(off);

    const ro = new ResizeObserver(([e]) => e && handle?.resize(Math.round(e.contentRect.width), Math.round(e.contentRect.height), devicePixelRatio));
    ro.observe(root);
    const io = new IntersectionObserver(([e]) => handle?.visible(!!e?.isIntersecting));
    io.observe(root);
    const lg = matchMedia(LG_QUERY);
    const onLg = () => !lg.matches && off();
    lg.addEventListener("change", onLg);
    const html = document.documentElement;
    const mo = new MutationObserver(() => html.getAttribute(MOTION_ATTR) !== "on" && off());
    mo.observe(html, { attributes: true, attributeFilter: [MOTION_ATTR] });
    return () => {
      alive = false;
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      lg.removeEventListener("change", onLg);
      handle?.dispose();
    };
  }, [state === "loading" || state === "live", id]); // eslint-disable-line react-hooks/exhaustive-deps

  // 3. Pausa compartida entre hero y contacto.
  useEffect(() => {
    if (state !== "live" || !client.current) return;
    return client.current.onPaused(setPausedState);
  }, [state]);

  const mounted = state === "loading" || state === "live";
  return (
    <div ref={box} data-glass={state} className={`relative ${className}`}>
      {children}
      {mounted ? <canvas ref={canvas} aria-hidden="true" data-glass-canvas="" className="absolute inset-0 h-full w-full" /> : null}
      {state === "live" ? (
        <button
          type="button"
          aria-pressed={paused}
          onClick={() => client.current?.setPaused(!paused)}
          className="absolute right-2 top-2 z-10 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/[0.16] bg-[rgba(11,13,20,0.8)] px-4 py-2 text-[length:var(--step--1)] font-medium text-[color:var(--text)] transition-colors hover:border-[color:var(--light-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--light-1)]"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14" className="mr-2 fill-current">
            {paused ? <path d="M4 2.5v11l9-5.5z" /> : <path d="M3.5 2h3v12h-3zm6 0h3v12h-3z" />}
          </svg>
          {pauseLabel}
        </button>
      ) : null}
    </div>
  );
}
```

El `eslint-disable` de la dependencia booleana es a propósito: el montaje debe sobrevivir al paso de `loading` a `live` sin desmontarse. Si el linter del repo no lo acepta así, saca `const active = state === "loading" || state === "live";` antes del efecto y usa `[active, id]`.

- [ ] **Step 4: Wire it into the hero, the CSS and the dictionaries**

En `src/chapters/Hero.tsx`, sustituye la línea del póster:

```tsx
<GlassStage id="hero" pauseLabel={d.glass.pause} className="absolute inset-0 -z-10">
  <GlassPoster className="h-full w-full" />
</GlassStage>
```

e importa `GlassStage` de `@/components/GlassStage`. El botón de pausa queda arriba a la derecha de la caja, donde el retrato (abajo a la izquierda, 70 %) no llega.

En los diccionarios, al nivel de `lost`: `glass: { pause: "Pausar el cristal" }` en `es.ts` y `glass: { pause: "Pause the glass" }` en `en.ts`.

En `src/motion/motion.css`, fuera de los bloques de scroll (no depende de `animation-timeline`):

```css
/* Relevo póster → cristal vivo (Task 5). Solo capas decorativas con aria-hidden. */
[data-glass] > [data-glass-canvas] { opacity: 0; transition: opacity 700ms var(--mo-ease-out); }
[data-glass="live"] > [data-glass-canvas] { opacity: 1; }
[data-glass] > [data-motion="glass"] { transition: opacity 700ms var(--mo-ease-out) 200ms; }
[data-glass="live"] > [data-motion="glass"] { opacity: 0; }
```

El lienzo transparente deja ver el póster mientras entra; el póster se va 200 ms después, cuando el cristal 3D ya lo tapa.

- [ ] **Step 5: Run the tests**

Run: `npx vitest run && npx tsc --noEmit && npm run lint && npm run build && npm run budget && npx playwright test e2e/glass-hero.spec.ts`
Expected: PASS; `npm run budget` lista ahora el cliente (≤ 4 KB) y el worker (≤ 250 KB), y el JS inicial de `/` sube ≤ 3 KB sobre la línea base de la Task 1.

- [ ] **Step 6: Check the 404 is untouched**

Run: `npx playwright test e2e/lost-experience.spec.ts e2e/lost.spec.ts e2e/experience.spec.ts`
Expected: PASS.

- [ ] **Step 7: Measure and fix the material profile**

En el escritorio del dueño (con GPU; Chromium de Playwright, no el Chrome del sistema, por ESET), contra `npm run start`:

```bash
node -e '
const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({ headless: false, args: ["--use-angle=d3d11", "--enable-gpu"] });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.addInitScript(() => { const w = window; w.__gap = 0; let last = performance.now(); const f = (t) => { w.__gap = Math.max(w.__gap, t - last); last = t; requestAnimationFrame(f); }; requestAnimationFrame(f); });
  const ms = [];
  for (let i = 0; i < 5; i++) {
    await p.goto("http://localhost:3000/");
    await p.waitForSelector("#top [data-glass=live]", { timeout: 60000 });
    ms.push(await p.evaluate(() => ({ ready: Math.round(performance.getEntriesByName("glass:ready:hero")[0].startTime - performance.getEntriesByName("glass:start:hero")[0].startTime), gap: Math.round(window.__gap) })));
  }
  console.log(JSON.stringify(ms));
  await b.close();
})();'
```

Regla: con la mediana de cinco cargas, si `ready ≤ 1500` y `gap ≤ 100`, `GLASS_PROFILE = "full"`. Si no, cambia a `"lite"` en `protocol.ts`, repite la medida y anota las dos en el informe. El primer `gap` de la página incluye la carga inicial: mide `gap` solo desde `glass:start:hero` si sale > 100 en las dos variantes (reinicia `__gap = 0` con `performance.mark` observado, o con un `page.evaluate` justo antes del `waitForSelector`).

- [ ] **Step 8: Commit**

```bash
git add src/components/GlassStage.tsx src/chapters/Hero.tsx src/motion/motion.css src/i18n/dictionaries src/three/protocol.ts e2e/glass-hero.spec.ts e2e/glass-utils.ts tests/glass-stage.test.tsx
git commit -m "feat(hero): cristal vivo en el worker tras idle, relevo sobre el póster, pausa compartida y reservas para móvil, movimiento reducido, Save-Data y equipos modestos"
```

---

### Task 6: El cristal vuelve en el contacto

**Files:**
- Modify: `src/chapters/Contact.tsx:85-87`
- Create: `e2e/glass-contact.spec.ts`
- Test: `tests/glass-stage.test.tsx` (caso del contacto)

**Interfaces:**
- Consumes: `GlassStage` (Task 5) con `id="contact"`. El worker y la pausa son los mismos.

- [ ] **Step 1: Write the failing tests**

Añade a `tests/glass-stage.test.tsx`:

```tsx
import Contact from "@/chapters/Contact";

describe("GlassStage en el contacto", () => {
  it("el póster del contacto va dentro de un GlassStage y sigue oculto por debajo de lg", () => {
    const html = renderToStaticMarkup(<Contact lang="es" />);
    expect(html).toMatch(/hidden[^"]*lg:block[^>]*>\s*<div[^>]*data-glass="poster"/);
  });
});
```

```ts
// e2e/glass-contact.spec.ts
import { test, expect } from "./fixtures";
import { forceGlass, longTasksDuringGlass, watchLongTasks } from "./glass-utils";

const live = (page: import("@playwright/test").Page) => page.evaluate(() => (window as unknown as { __GLASS_LIVE_WORKERS__?: number }).__GLASS_LIVE_WORKERS__ ?? 0);

test.describe("cristal del contacto (escritorio)", () => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name !== "desktop", "solo escritorio");
    test.setTimeout(120_000);
  });

  test("se monta al acercarse, comparte worker con el hero y la pausa es una sola", async ({ page }) => {
    await forceGlass(page);
    await page.goto("/");
    await expect(page.locator("#top [data-glass]")).toHaveAttribute("data-glass", "live", { timeout: 45_000 });
    await expect(page.locator("#contact [data-glass]")).toHaveAttribute("data-glass", "poster");
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await expect(page.locator("#contact [data-glass]")).toHaveAttribute("data-glass", "live", { timeout: 45_000 });
    expect(await live(page)).toBe(1);
    await page.locator("#contact button[aria-pressed]").click();
    await expect(page.locator("#top button[aria-pressed]")).toHaveAttribute("aria-pressed", "true");
  });

  test("Review Focus 5: aterrizar en /#contact", async ({ page }) => {
    await watchLongTasks(page);
    await forceGlass(page);
    await page.goto("/#contact");
    await expect(page.locator("#contact [data-glass]")).toHaveAttribute("data-glass", "live", { timeout: 45_000 });
    expect(await longTasksDuringGlass(page, "contact")).toEqual([]);
  });

  test("Review Focus 4: ida y vuelta por navegación de cliente y cambio de idioma, un solo worker", async ({ page }) => {
    await forceGlass(page);
    await page.goto("/");
    await expect(page.locator("#top [data-glass]")).toHaveAttribute("data-glass", "live", { timeout: 45_000 });
    await page.locator('footer a[href="/about"]').first().click();
    await expect(page).toHaveURL(/\/about$/);
    await expect.poll(() => live(page)).toBe(0);
    await page.goBack();
    await expect(page.locator("#top [data-glass]")).toHaveAttribute("data-glass", "live", { timeout: 45_000 });
    expect(await live(page)).toBe(1);
    await expect(page.locator("#top canvas")).toHaveCount(1);
    await page.locator('nav a[hreflang="en"], nav a[lang="en"]').first().click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("#top [data-glass]")).toHaveAttribute("data-glass", "live", { timeout: 45_000 });
    expect(await live(page)).toBe(1);
  });
});
```

El selector del cambio de idioma tiene que ser el que usa `LangSwitch.tsx`; ábrelo y ajústalo antes de correr el test.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/glass-stage.test.tsx`
Expected: FAIL, el contacto aún no tiene `data-glass`.

- [ ] **Step 3: Implement**

En `src/chapters/Contact.tsx` (`Contact` es un componente de servidor y ya tiene `d`):

```tsx
<div className="relative isolate mx-auto hidden aspect-square w-full max-w-[420px] lg:block">
  <GlassStage id="contact" pauseLabel={d.glass.pause} className="absolute inset-0">
    <GlassPoster className="h-full w-full" />
  </GlassStage>
</div>
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run && npm run build && npx playwright test e2e/glass-contact.spec.ts e2e/glass-hero.spec.ts e2e/motion-proof-contact.spec.ts`
Expected: PASS. Si el imán del correo (`data-motion="magnetic"`) o las intenciones dejan de pasar, el `GlassStage` está tapando algo: no debería, porque vive en la columna derecha.

- [ ] **Step 5: Commit**

```bash
git add src/chapters/Contact.tsx e2e/glass-contact.spec.ts tests/glass-stage.test.tsx
git commit -m "feat(contact): el cristal vuelve en el contacto con el mismo worker, al acercarse, y con la pausa compartida"
```

---

### Task 7: El nombre escrito con luz (E3) y la versión estática con luz

El nombre del `<h1>` es el LCP. Regla: su texto se pinta blanco y entero en el primer fotograma y **nunca** se oculta, se recorta ni se sustituye. La luz es una capa decorativa encima: un pseudo-elemento con un degradado en `mix-blend-mode: multiply`. Sobre el texto blanco, multiplicar por blanco no cambia nada y multiplicar por la banda de luz tiñe las letras de `--light-1` y `--light-2`; sobre el fondo casi negro, el resultado sigue siendo fondo. La banda recorre el nombre una vez, de izquierda a derecha, en 1,8 s. Los degradados CSS no son candidatos a LCP. El mismo barrido, más lento, pasa una vez por el póster: es lo que ve el móvil, la pantalla horizontal y cualquiera que no pase la puerta.

**Files:**
- Modify: `src/components/ui/Display.tsx` (prop `light`), `src/chapters/Hero.tsx` (`light` en el `Display` del h1), `src/components/GlassPoster.tsx` (marca de la capa de brillo), `src/motion/motion.css`
- Create: `e2e/light-write.spec.ts`
- Test: `tests/light-write.test.tsx`

**Interfaces:**
- Produces: `Display` acepta `light?: boolean`; con `light`, `lead` va en `<span data-light-write="">`. `GlassPoster` marca su degradado de brillo con `data-glass-sheen`.

- [ ] **Step 1: Write the failing tests**

```tsx
// tests/light-write.test.tsx
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import Hero from "@/chapters/Hero";
import { contrastRatio } from "@/lib/design/contrast";

const css = readFileSync(join(process.cwd(), "src", "motion", "motion.css"), "utf8");

describe("nombre escrito con luz", () => {
  for (const lang of ["es", "en"] as const) {
    const html = renderToStaticMarkup(<Hero lang={lang} />);
    it(`${lang}: el nombre entero va en un solo span, sin partir el apellido`, () => {
      expect(html).toMatch(/<span data-light-write="">Santiago Gómez de la Torre\.<\/span>/);
    });
    it(`${lang}: el h1 no lleva estado previo en el HTML`, () => expect(html).not.toMatch(/<h1[^>]*style=/));
  }
  it("la animación solo existe con movimiento permitido y sin tocar color, opacidad ni clip del texto", () => {
    const block = css.slice(css.indexOf("/* Nombre escrito con luz"), css.indexOf("/* Fin nombre escrito con luz */"));
    expect(block).toMatch(/prefers-reduced-motion: no-preference/);
    expect(block).toMatch(/data-motion-state="on"/);
    expect(block).toMatch(/\[data-light-write\]::after/);
    expect(block).not.toMatch(/\[data-light-write\]\s*\{[^}]*(opacity|clip-path|color\s*:)/);
  });
  it("los colores de la banda cumplen AA sobre el fondo", () => {
    for (const c of ["#8FA8FF", "#6EF0DC"]) expect(contrastRatio(c, "#05060A")).toBeGreaterThanOrEqual(4.5);
  });
});
```

```ts
// e2e/light-write.spec.ts
import { test, expect } from "./fixtures";

test("el nombre se ve entero en el primer fotograma y la luz no cambia su caja ni el LCP", async ({ page }) => {
  await page.goto("/");
  const span = page.locator("h1 [data-light-write]");
  await expect(span).toHaveText("Santiago Gómez de la Torre.");
  const color = await span.evaluate((el) => getComputedStyle(el).color);
  expect(color).toBe("rgb(244, 246, 251)");
  const before = await page.locator("h1").boundingBox();
  await page.waitForTimeout(2500);
  expect(await page.locator("h1").boundingBox()).toEqual(before);
  const lcpTag = await page.evaluate(() => ((performance.getEntriesByType("largest-contentful-paint").at(-1) as unknown as { element?: Element })?.element?.tagName ?? ""));
  expect(["H1", "IMG", "SPAN"]).toContain(lcpTag);
});

test("movimiento reducido: no hay animación en el nombre ni en el póster", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(await page.evaluate(() => document.getAnimations().filter((a) => (a as CSSAnimation).animationName?.startsWith("mo-light")).length)).toBe(0);
});

test("axe a mitad del barrido", async ({ page }) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  await page.goto("/");
  await page.waitForTimeout(1200);
  const r = await new AxeBuilder({ page }).include("#top").withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(r.violations).toEqual([]);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/light-write.test.tsx`
Expected: FAIL, no hay `data-light-write`.

- [ ] **Step 3: Implement**

En `Display.tsx`, añade `light?: boolean` a las props (con el comentario `/** Envuelve \`lead\` para el barrido de luz del hero (E3). Solo decorativo. */`) y sustituye `{lead}` por `{light ? <span data-light-write="">{lead}</span> : lead}`. En `Hero.tsx`, añade `light` al `Display` del `<h1>`.

En `GlassPoster.tsx`, añade `data-glass-sheen=""` al `<path>` que pinta `url(#${sheen})`.

En `src/motion/motion.css`:

```css
/* Nombre escrito con luz (E3). El texto del h1 es el LCP: no se toca. La luz es un
   pseudo-elemento decorativo en multiply: blanco fuera de la banda (no cambia nada),
   --light-1 y --light-2 dentro (tiñe solo las letras). Una vez, 1,8 s. */
@keyframes mo-light-write {
  from { background-position: 100% 0; }
  to { background-position: 0% 0; }
}
@keyframes mo-light-sheen {
  from { transform: translate(-30%, -20%); }
  to { transform: translate(18%, 14%); }
}
@media (prefers-reduced-motion: no-preference) {
  :root[data-motion-state="on"] [data-light-write] {
    position: relative;
    isolation: isolate;
    display: inline;
  }
  :root[data-motion-state="on"] [data-light-write]::after {
    content: "";
    position: absolute;
    inset: -0.05em -0.1em;
    pointer-events: none;
    mix-blend-mode: multiply;
    background: linear-gradient(100deg, #fff 0 38%, var(--light-1) 46%, var(--light-2) 50%, var(--light-1) 54%, #fff 62% 100%);
    background-size: 300% 100%;
    background-position: 100% 0;
    animation: mo-light-write 1.8s var(--mo-ease) 350ms 1 both;
  }
  /* El póster (móvil, horizontal y quien no pasa la puerta): el brillo cruza una vez. */
  :root[data-motion-state="on"] [data-motion="glass"] [data-glass-sheen] {
    transform-box: fill-box;
    animation: mo-light-sheen 2.4s var(--mo-ease) 500ms 1 both;
  }
}
/* Fin nombre escrito con luz */
```

`display: inline` mantiene el corte de línea del titular igual que sin el span. Si en 320 px el nombre parte en dos líneas y el `::after` (que cubre la caja del inline entero, no cada línea) deja la segunda sin luz o tiñe el hueco entre líneas, añade `box-decoration-break: clone; -webkit-box-decoration-break: clone;` al span y mira la captura otra vez. El texto lo sigue pintando siempre su `color`: nada de `background-clip: text` sobre el propio nombre. Si aun así no queda bien, para y pregunta a Santiago antes de partir el nombre en más spans.

- [ ] **Step 4: Run the tests**

Run: `npx vitest run && npm run build && npx playwright test e2e/light-write.spec.ts e2e/glass-hero.spec.ts e2e/a11y.spec.ts e2e/responsive.spec.ts`
Expected: PASS en todos los proyectos. Mira a mano una captura a 320, 375, 1280 y 1920 a los 1,2 s: la banda pasa por las letras y el fondo no cambia.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Display.tsx src/chapters/Hero.tsx src/components/GlassPoster.tsx src/motion/motion.css tests/light-write.test.tsx e2e/light-write.spec.ts
git commit -m "feat(hero): el nombre escrito con luz sin tocar el LCP y el brillo del póster para móvil y la versión estática (E3)"
```

---

### Task 8: El relevo vídeo→3D del 404, sin salto de capa y sin apagón de líneas

Dos defectos pendientes del 404 en escritorio:
- **Las líneas se apagan al empezar el vídeo.** Causa leída en el código: las dos `<svg>` de líneas de `LostStage.tsx` llevan `data-lost-static`, y `globals.css:71` pone `opacity: 0` en 120 ms a todo `[data-lost-static]` en cuanto hay `data-lost-cover` (también `video`). El vídeo no lleva líneas (spec 404 §7: «las líneas solo las dibuja el SVG»), así que desaparecen de golpe y no vuelven hasta que la escena las sube en 0,9 s (`lineRamp`), con un segundo hueco en el relevo.
- **El salto de capa en el relevo.** El vídeo y el lienzo viven en `[data-lost-layer]`, colocada con márgenes negativos (sin transform, por la mezcla de Safari), mientras el escenario con el póster, las líneas y los enlaces se coloca con `-translate-x-1/2 -translate-y-1/2`. El transform no se redondea al píxel y el margen sí: las dos cajas pueden diferir en una fracción de píxel según el ancho, y en el relevo el ojo ve saltar el cristal respecto a las líneas y las etiquetas. Se confirma midiendo antes de tocar nada.

**Files:**
- Modify: `src/chapters/lost/LostStage.tsx` (marca de las líneas; caja del escenario con la misma geometría que la capa), `src/chapters/lost/LostExperience.tsx` (fase de líneas; la escena entra con las líneas ya encendidas tras el vídeo), `src/three/ConstellationScene.tsx` (prop `linesOn`), `src/app/globals.css:71-90`
- Create: `e2e/lost-handoff.spec.ts`
- Test: `tests/lost-lines.test.tsx`

**Interfaces:**
- Produces: las `<svg>` de líneas llevan `data-lost-lines` (y ya no `data-lost-static`); `data-lost-lines="out" | "in"` en el escenario; `SceneProps.linesOn: boolean` (true: la escena pinta sus líneas a 0,28 desde el primer fotograma).

- [ ] **Step 1: Reproduce and measure**

```ts
// e2e/lost-handoff.spec.ts
import { test, expect } from "./fixtures";

test.beforeEach(({}, info) => {
  test.skip(info.project.name !== "desktop", "solo escritorio");
  test.setTimeout(90_000);
});

const force = (page: import("@playwright/test").Page) =>
  page.addInitScript(() => ((window as unknown as { __LOST_FORCE_GATE__: boolean }).__LOST_FORCE_GATE__ = true));

for (const width of [1024, 1280, 1366, 1440, 1600, 1920, 1111]) {
  test(`la capa del vídeo y el escenario son la misma caja a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/en/no-existe");
    const rects = await page.evaluate(() => {
      const r = (el: Element | null) => el!.getBoundingClientRect();
      const layer = r(document.querySelector("[data-lost-layer]"));
      const stage = r(document.querySelector("[data-lost-static]")!.closest("div.pointer-events-none")!);
      return { layer: [layer.x, layer.y, layer.width, layer.height], stage: [stage.x, stage.y, stage.width, stage.height] };
    });
    rects.layer.forEach((v, i) => expect(Math.abs(v - rects.stage[i]!), `${width} ${i}`).toBeLessThanOrEqual(0.5));
  });
}

test("las líneas no se apagan durante el vídeo ni en el relevo", async ({ page }) => {
  await force(page);
  await page.addInitScript(() => {
    const w = window as unknown as { __lines: number[] };
    w.__lines = [];
    const tick = () => {
      const svg = document.querySelector<SVGElement>('[data-stage="lost"] svg[data-lost-lines]:not(.lg\\:hidden)');
      const canvasOn = document.querySelector('[data-stage="lost"]')?.getAttribute("data-lost-cover") === "scene";
      w.__lines.push(canvasOn ? 1 : svg ? Number(getComputedStyle(svg).opacity) : 1);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.goto("/en/no-existe");
  await expect(page.locator('[data-stage="lost"]')).toHaveAttribute("data-lost-phase", "idle", { timeout: 60_000 });
  const lines = await page.evaluate(() => (window as unknown as { __lines: number[] }).__lines);
  // Durante el estallido las líneas se van con un fundido (no de golpe) y vuelven antes del relevo.
  const drops = lines.map((v, i) => (i ? lines[i - 1]! - v : 0));
  expect(Math.max(...drops), "ninguna caída de opacidad en un solo fotograma").toBeLessThan(0.34);
  expect(lines.at(-1)).toBe(1);
});
```

Run: `npm run build && npx playwright test e2e/lost-handoff.spec.ts`
Expected: FAIL en el test de las líneas (caída de 1 a 0 en uno o dos fotogramas) y, probablemente, en alguno de los anchos (diferencia de 0,5 a 1 px). Anota qué anchos fallan y por cuánto. Si **ningún** ancho falla, el salto no viene de la caja: graba el relevo (`page.video` del contexto, o capturas por `requestVideoFrameCallback` del último fotograma y el primer `onReady`) y compara la posición de un fragmento en las dos imágenes antes de seguir; repórtalo y pregunta a Santiago qué vio (pregunta abierta 4).

- [ ] **Step 2: Write the unit test for the markup**

```tsx
// tests/lost-lines.test.tsx
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import LostStage from "@/chapters/lost/LostStage";

describe("líneas del 404", () => {
  const html = renderToStaticMarkup(<LostStage lang="en" />);
  it("las dos svg de líneas tienen su propia marca y no la de lo estático", () => {
    expect(html.match(/<svg[^>]*data-lost-lines=""/g)).toHaveLength(2);
    expect(html).not.toMatch(/<svg[^>]*data-lost-static[^>]*viewBox="0 0 100 100"/);
  });
  it("la caja del escenario de escritorio no usa translate (la misma geometría que la capa)", () => {
    expect(html).not.toMatch(/lg:-translate-x-1\/2 lg:-translate-y-1\/2/);
  });
});
```

Run: `npx vitest run tests/lost-lines.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Fix the box**

En `LostStage.tsx`, la caja del escenario de escritorio pasa a la misma geometría que `[data-lost-layer]`. Sustituye en su `className` `lg:left-1/2 lg:top-1/2 … lg:-translate-x-1/2 lg:-translate-y-1/2` por `lg:left-1/2 lg:top-1/2 lg:ml-[calc(min(100%,1440px)*-0.5)] lg:mt-[calc(min(100%,1440px)*-0.28125)]`, manteniendo `lg:absolute lg:z-20 lg:aspect-video lg:h-auto lg:w-[min(100%,1440px)] lg:mx-0`. Cuidado: `lg:mx-0` anula `ml`; quítalo y deja solo `lg:mr-0` si hace falta para el `mx-auto` de móvil. Los porcentajes de margen se calculan sobre el ancho del bloque contenedor en las dos cajas, así que coinciden por construcción.

- [ ] **Step 4: Fix the lines**

1. En `LostStage.tsx`, en las dos `<svg>` de líneas, cambia `data-lost-static=""` por `data-lost-lines=""`.
2. En `globals.css`, añade debajo de la regla de `[data-lost-static]`:

```css
/* Líneas (Task 8). Se van con el estallido en 300 ms, vuelven en los últimos 400 ms
   del vídeo y se retiran en el mismo fotograma en que la escena ya pinta las suyas. */
[data-stage="lost"] [data-lost-lines] { transition: opacity 300ms ease-out; }
[data-stage="lost"][data-lost-lines="out"] [data-lost-lines] { opacity: 0; }
[data-stage="lost"][data-lost-lines="in"] [data-lost-lines] { opacity: 1; transition-duration: 400ms; }
[data-stage="lost"][data-lost-cover="scene"] [data-lost-lines] { opacity: 0; transition: none; }
```

3. En `LostExperience.tsx`, pon la fase de líneas en el escenario. Dentro del `useLayoutEffect` que ya escribe `lostPhase` y `lostCover`:

```ts
if (videoState === "playing") el.dataset.lostLines = linesBack ? "in" : "out";
else delete el.dataset.lostLines;
```

con `const [linesBack, setLinesBack] = useState(false);` y, en el `<video>`, `onTimeUpdate={(e) => { const v = e.currentTarget; if (v.duration - v.currentTime <= 0.45) setLinesBack(true); }}`. Añade `linesBack` y `videoState` a las dependencias del efecto.

4. En `ConstellationScene.tsx`, añade a `SceneProps` `/** La escena entra tras el vídeo: sus líneas empiezan ya encendidas. */ linesOn: boolean;` y cambia `const lineRamp = live ? smooth(clamp(c.live / 0.9, 0, 1)) : 0;` por `const lineRamp = linesOn ? 1 : live ? smooth(clamp(c.live / 0.9, 0, 1)) : 0;`. En `LostExperience.tsx` pasa `linesOn={fromVideo}`; como `fromVideo` se decide en el mismo efecto que `setCoverScene(true)`, la escena pinta sus líneas en el mismo commit en que el CSS retira las del SVG.

- [ ] **Step 5: Run the tests**

Run: `npx vitest run && npm run build && npx playwright test e2e/lost-handoff.spec.ts e2e/lost-experience.spec.ts e2e/lost.spec.ts e2e/responsive.spec.ts`
Expected: PASS. Mira a mano el relevo a 1366×768 y 1920×1080 en el escritorio con GPU (Chromium de Playwright, `headless: false`).

- [ ] **Step 6: Commit**

```bash
git add src/chapters/lost src/three/ConstellationScene.tsx src/app/globals.css e2e/lost-handoff.spec.ts tests/lost-lines.test.tsx
git commit -m "fix(404): el escenario y la capa del vídeo son la misma caja y las líneas se van y vuelven con el estallido, sin apagón en el relevo"
```

---

### Task 9: El 404 también en el worker (fuera de su 1,6 s de TBT)

En escritorio el 404 da ≈ 1,6 s de TBT: es el mismo enlazado del shader, ahora con doce fragmentos, en el hilo principal. Con el worker de la Task 4 ya hecho, la constelación se lleva allí y R3F deja de usarse. Lo que el 404 necesita y el hero no: los enlaces `<a>` siguen a sus fragmentos (el worker manda los desplazamientos), el brillo del fragmento señalado (el hilo principal manda el id), `live` tras el relevo y las líneas.

**Files:**
- Create: `src/three/ConstellationScene.ts` (sustituye a `ConstellationScene.tsx`, sin React)
- Modify: `src/three/protocol.ts` (`"lost"` y sus mensajes), `src/three/glass.worker.ts` (escena por tipo), `src/three/glass-client.ts` (`send` por montaje), `src/chapters/lost/LostExperience.tsx` (monta por `glass-client`, sin `Boundary`, sin `Scene` de React), `package.json` (retira `@react-three/fiber`), `e2e/lost-experience.spec.ts:24-36` (bloqueo por el marcador del worker), `e2e/experience.spec.ts` (el test del chunk 3D mide ya solo el worker), `lighthouserc.desktop.json` (añade `/en/no-existe`)
- Delete: `src/three/ConstellationScene.tsx`
- Test: `tests/glass-protocol.test.ts` (casos del 404)

**Interfaces:**
- Consumes: todo lo de las Tasks 3 y 4; la máquina de `sequence.ts` sin cambios.
- Produces:
  - `GlassId = "hero" | "contact" | "lost"`.
  - `ToWorker` gana `{ type: "lost"; live: boolean; highlightId: string; linesOn: boolean }`.
  - `FromWorker` gana `{ type: "project"; id: "lost"; offsets: Float32Array }`: pares `dx, dy` en px, en el orden de `SHARDS` filtrado por `target !== null`.
  - `PROJECTED_IDS: readonly string[]` en `protocol.ts` (ese orden).
  - `createConstellationScene(canvas, gl, o: { width; height; dpr; profile: GlassProfile; make2d: Make2D }): Promise<ConstellationHandle>`; `type ConstellationHandle = GlassSceneHandle & { set(s: { live: boolean; highlightId: string; linesOn: boolean }): void; offsets(): Float32Array }`.

- [ ] **Step 1: Write the failing test**

```ts
// en tests/glass-protocol.test.ts
import { PROJECTED_IDS } from "@/three/protocol";
import { SHARDS } from "@/lib/lost/shards";

describe("protocolo del 404", () => {
  it("los desplazamientos van en el orden de los fragmentos con enlace", () => {
    expect(PROJECTED_IDS).toEqual(SHARDS.filter((s) => s.target !== null).map((s) => s.id));
    expect(PROJECTED_IDS).toHaveLength(7);
  });
});
```

Run: `npx vitest run tests/glass-protocol.test.ts`
Expected: FAIL, no existe `PROJECTED_IDS`.

- [ ] **Step 2: Port the scene**

`src/three/ConstellationScene.ts` es el `Content` de hoy sin React:
- Construcción: lo que hacían los dos primeros `useEffect` (`buildEnv`, `buildBackdrop`, `buildAssets`) más `backdropMesh(backdrop)`, `addLights(scene)`, las doce `group` y `lineSegments`, y `renderer.compile(scene, camera)`. El renderer y la cámara como en `GlassScene.ts` (mismo `toneMapping`, mismo `dpr ≤ 1.25`).
- `frame(dt, input, paused)`: el cuerpo de `useFrame` con `layout` fijo a `"desktop"` (el 3D no existe por debajo de lg) y sin `onProject`: en su lugar escribe `offsets[2*i]`, `offsets[2*i+1]` para el i-ésimo id de `PROJECTED_IDS`.
- `set({ live, highlightId, linesOn })`: guarda el estado que antes llegaba por props.
- `dispose()`: `disposeAssets` más `lineGeo.dispose()` y `renderer.dispose()`.
- La inclinación por giroscopio desaparece: solo existía para móvil, donde ya no hay 3D.

En `glass.worker.ts`, `init` con `id === "lost"` crea `createConstellationScene` en lugar de `createGlassScene`; tras cada `frame` de `lost` hace `post({ type: "project", id: "lost", offsets: scene.offsets().slice() })` (copia transferible: `ctx.postMessage(m, [m.offsets.buffer])`). El mensaje `lost` llama a `scene.set(...)` y a `kick()`.

En `glass-client.ts`, `mountGlass` devuelve además `send(m: ToWorker)` para los mensajes propios del montaje.

- [ ] **Step 3: Rewire `LostExperience.tsx`**

- Quita `Scene`, `setScene`, `Boundary`, el `import("@/three/ConstellationScene")` y el `canvasEl` de React.
- El efecto 2 (carga tras idle) pasa a: `import("@/three/glass-client")`, crear el `<canvas>` (ya renderizado dentro de `data-lost-canvas` cuando `enabled`), `mountGlass(canvas, { id: "lost", … }, on)`. `on`: `ready` → `send("sceneReady")`; `fail` → `send("sceneFailed")`; `project` → para cada `i`, `anchors.current.get(PROJECTED_IDS[i])!.style.transform = translate3d(dx, dy, 0)`.
- Un efecto envía `{ type: "lost", live: scenePhase, highlightId: highlight, linesOn: fromVideo }` cuando cambian, y `setPaused(s.paused)` del cliente cuando cambia la pausa (la del 404 es la única de su página: compartir el estado global no molesta).
- `readGate()` deja de crear un contexto WebGL en el hilo principal: la puerta del 404 pasa a `glassGatePasses(readGlassEnv())` más `__LOST_FORCE_GATE__` como `force`; la sonda de WebGL2 y de software la hace el worker y su fallo llega como `fail`, que ya devuelve el escenario estático. `probeWebGL2` y `readGate` de `gate.ts` se quedan sin uso: bórralos.

- [ ] **Step 4: Remove R3F and update the nets**

Run: `npm uninstall @react-three/fiber && grep -rn "@react-three" src e2e tests` (no debe imprimir nada).

En `e2e/lost-experience.spec.ts`, `blockSceneChunk` busca ahora `sgomez-glass-worker` y usa `page.context().route` (las peticiones del worker pasan por el contexto). Si el aborto no llega a ocurrir (`state.aborted` sigue en `false`), el test lo dice y falla: no pases en vacío.

En `e2e/experience.spec.ts`, el test del chunk 3D mide solo los ficheros con `sgomez-glass-worker` y sus importados (o se borra, porque `npm run budget` ya lo mide; elige uno y dilo en el informe).

En `lighthouserc.desktop.json`, añade `"http://localhost:3000/en/no-existe"` a `collect.url` y `"ignoreStatusCode": true` a `settings`, con TBT como `error` igual que el resto.

- [ ] **Step 5: Run everything that touches the 404**

Run: `npx vitest run && npx tsc --noEmit && npm run lint && npm run build && npm run budget && npx playwright test e2e/lost-experience.spec.ts e2e/lost-handoff.spec.ts e2e/lost.spec.ts e2e/experience.spec.ts e2e/glass-hero.spec.ts`
Expected: PASS. Los enlaces siguen a sus fragmentos: en el escritorio con GPU, pasa el ratón por encima y mira que la etiqueta no se quede un fotograma por detrás del cristal de forma visible. Si se queda, prueba a mandar los desplazamientos en cada rAF del worker aunque no toque fotograma (sin renderizar) antes de abandonar; si sigue, revierte esta tarea entera (`git revert`) y anota el motivo: el 404 se queda con R3F y su TBT pasa a la lista de deuda.

- [ ] **Step 6: Commit**

```bash
git add -A src/three src/chapters/lost src/lib/three package.json package-lock.json e2e lighthouserc.desktop.json tests/glass-protocol.test.ts
git commit -m "perf(404): la constelación pasa al worker del cristal, el hilo principal ya no enlaza shaders y R3F se retira"
```

---

### Task 10: Verificación transversal del 3D

Las tareas anteriores prueban cada pieza. Esta prueba el conjunto con los presupuestos.

**Files:**
- Create: `e2e/glass-sweep.spec.ts`
- Modify: ninguno, salvo los arreglos que salgan (en el fichero dueño, no en el test)

- [ ] **Step 1: Write the sweep**

```ts
// e2e/glass-sweep.spec.ts
import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures";
import { forceGlass } from "./glass-utils";
import { layoutShiftDuring } from "./motion-utils";

const WIDTHS = [320, 375, 414, 768, 1024, 1280, 1366, 1440, 1920];

for (const path of ["/", "/en"]) {
  test.describe(`barrido del cristal ${path}`, () => {
    test.beforeEach(({}, info) => {
      test.skip(info.project.name !== "desktop", "el barrido cambia el viewport él mismo");
      test.setTimeout(180_000);
    });

    test("axe con el cristal vivo, en hero y contacto", async ({ page }) => {
      await forceGlass(page);
      await page.goto(path);
      await expect(page.locator("#top [data-glass]")).toHaveAttribute("data-glass", "live", { timeout: 45_000 });
      for (const id of ["#top", "#contact"]) {
        await page.locator(id).scrollIntoViewIfNeeded();
        const r = await new AxeBuilder({ page }).include(id).withTags(["wcag2a", "wcag2aa"]).analyze();
        expect(r.violations.map((v) => `${id} ${v.id}`)).toEqual([]);
      }
    });

    test("CLS del relevo póster→cristal", async ({ page }) => {
      await forceGlass(page);
      await page.goto(path);
      const cls = await layoutShiftDuring(page, async () => {
        await expect(page.locator("#top [data-glass]")).toHaveAttribute("data-glass", "live", { timeout: 45_000 });
      });
      expect(cls).toBeLessThan(0.05);
    });

    test("sin scroll horizontal en ningún ancho ni en horizontal, con el cristal en cualquier estado", async ({ page }) => {
      await forceGlass(page);
      await page.goto(path);
      for (const [w, h] of [...WIDTHS.map((w) => [w, 900]), [844, 390]] as [number, number][]) {
        await page.setViewportSize({ width: w, height: h });
        for (const id of ["#top", "#contact"]) {
          await page.locator(id).scrollIntoViewIfNeeded();
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${w}x${h} ${id}`).toBe(true);
        }
      }
    });
  });
}
```

- [ ] **Step 2: Run the whole suite and the budgets**

Run: `npx tsc --noEmit && npm run lint && npx vitest run && npm run e2e && npm run budget`
Expected: todo PASS. Cita los totales y la tabla del presupuesto (JS inicial por ruta, runtime de movimiento, cliente y worker del cristal, CSS).

- [ ] **Step 3: Lighthouse, both machines**

1. Local con GPU: `npm run lhci`. En los LHR de escritorio de `/` y `/en`, `network-requests` tiene que incluir el chunk del worker (prueba de que la puerta pasó de verdad, porque aquí no hay `__GLASS_FORCE_GATE__`). Expected: TBT < 200 ms en escritorio con el cristal vivo, CLS ≤ 0,05, a11y ≥ 0,95, SEO 1. Si el worker no aparece, la puerta falló en el Chromium de Lighthouse (software): dilo, no lo presentes como medido.
2. CI de Linux: push y lee la sonda de la Task 2 (`gh run watch`). Expected: el móvil sin cambios respecto a la Task 2 (aquí no hay 3D) y la decisión de la Task 2 aplicada.

- [ ] **Step 4: Commit**

```bash
git add e2e/glass-sweep.spec.ts
git commit -m "test(three): barrido de axe con el cristal vivo, CLS del relevo, desbordes en los nueve anchos y Lighthouse de escritorio con la puerta pasada"
```

---

### Task 11: Verificación final de la fase (controlador)

- [ ] Run the full suite: `npx tsc --noEmit && npm run lint && npx vitest run && npm run e2e && npm run budget`. Quote the totals and the budget table.
- [ ] Real browser pass with Playwright (Chromium de Playwright, no el Chrome del sistema) against `npm run start` (spec §9), **before** calling the phase done:
  - `/` and `/en` at 1920×1080, 1440×900, 1280×800 and 1024×768 with GPU (`headless: false`): the hero glass entering over the poster, following the mouse, pausing with mouse and keyboard; the contact glass entering as you scroll to it; screenshots of poster, mid crossfade and live;
  - the same pages at 375×812, 320×640 and 844×390: poster with its light sweep, no canvas;
  - `prefers-reduced-motion: reduce` and JS disabled: poster, name in white, nothing moving;
  - the name written with light at 320, 375, 1280 and 1920, frames at 0, 1,2 and 2,5 s;
  - `/en/no-existe` at 1366×768 and 1920×1080: the video→3D handoff frame by frame (no layer jump, lines never blink), links following their shards, pause;
  - a client navigation (footer to `/about` and back) and a language switch with the glass live;
  - screenshots to `../.superpowers/verify/fase-3/`.
- [ ] Opus review of the whole branch, tracing interactions between tasks: the shared worker between hero, contact and 404 (refcount, pause, termination), `GlassStage` versus the motion runtime and `MotionDirector` on client navigation, the `motion.css` cascade (light sweep, poster sheen, crossfade) versus the phase 2 rules, the 404 box change versus its links and mobile layout, the fonts versus the hero line breaks. Tasks 3, 4 and 5 are core and get their own opus review at task time; Task 9 is high risk and is recommended for opus too.
- [ ] Write `docs/superpowers/progress/<fecha del día>-fase-3.md` with the per-task reports, the profile measurement, the LCP decision and the Lighthouse numbers. Push the branch. **No PR**: it opens only when every phase is done.

---

## Preguntas abiertas para Santiago

1. **Sin R3F en el hero.** La spec §4 dice React Three Fiber + drei. El plan pinta el cristal con three.js directo en un worker para que el enlazado del shader no toque el hilo principal (la lección del 404). Si la Task 9 sale bien, R3F se retira del todo. ¿De acuerdo con desviarse de la spec en esto?
2. **Si el LCP móvil de 10 s resulta ser el grafo de Lantern** (regla 3 o 4 de la Task 2), ¿prefieres medir el LCP móvil del CI con estrangulado real (`devtools`) o mantener el simulado y aceptar el incumplimiento como deuda conocida?
3. **El cristal del hero es el cristal entero** (el mismo que se rompe en el 404) en lugar del blob del póster actual. Cuenta la historia (entero en la home, roto en el 404), pero cambia la silueta respecto al póster. ¿Lo quieres así, o el 3D debe imitar la forma del blob? Si es así, el póster nuevo se generaría desde la escena para que el relevo sea exacto.
4. **El salto de capa del 404.** El plan lo atribuye a la diferencia de redondeo entre la caja con transform y la capa con márgenes, y lo mide antes de tocar nada. Si al medir no aparece, ¿puedes describir qué ves en el relevo (qué se mueve, cuánto y en qué ancho de ventana)?
5. **La pausa** se llama «Pausar el cristal» / «Pause the glass» y es una sola para hero y contacto. ¿Te vale el texto, o prefieres el «Pausar movimiento» del 404?
