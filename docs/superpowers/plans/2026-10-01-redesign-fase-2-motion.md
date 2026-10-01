# sgomez.dev v3, fase 2: movimiento del DOM. Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que la home se recorra como una keynote: titulares que suben desde una máscara, la bio que se enciende palabra a palabra, cifras que cuentan, la experiencia que se desliza en horizontal al bajar, tarjetas de open source que se dibujan solas (plano, borde, relleno, contenido), un muro de insignias que se ensambla, un contacto magnético y transiciones de página. Todo sin pasar el presupuesto de JS, con `prefers-reduced-motion` completo y sin tocar el LCP.

**Architecture:** El movimiento es **mejora progresiva sobre el HTML final que ya existe**. Los capítulos de la fase 1 ya llevan `data-motion="…"`; esta fase les engancha el movimiento sin cambiar lo que ve quien no tiene JS. Tres capas, de más barata a más cara:
1. **CSS con animaciones ligadas al scroll** (`animation-timeline: view()`), cero JS: titulares, construcción de tarjetas, insignias, citas, bio palabra a palabra y la línea de tiempo fijada. Al estar ligadas a la posición y no al tiempo, lo que ya está en pantalla al cargar se pinta en su estado final: no hay destello ni contenido escondido.
2. **Un script en línea en el `<head>`** (≈ 300 bytes) que pone `data-motion-state="on|off"` en `<html>` antes del primer pintado, según `prefers-reduced-motion` y `Save-Data`. Todo el CSS de movimiento cuelga de `:root[data-motion-state="on"]`, así que sin JS o con movimiento reducido no hay ninguna animación.
3. **Un runtime perezoso diminuto** (`src/motion/runtime.ts`, ≤ 6 KB gzip), importado tras `requestIdleCallback` por un componente cliente de ~1 KB, para lo que el CSS no puede hacer: el contador y el imán.

**Decisión sobre librerías.** La spec §4 nombra Motion (`motion`) para la coreografía del DOM. Con el presupuesto de JS al límite, esta fase **no añade Motion**: las tres capas de arriba cubren todo el guion de los capítulos 02, 04, 06, 08 y 09 con menos de 8 KB entre JS y CSS. `framer-motion` está en `package.json` sin usarse en ningún fichero y se retira. Si una fase posterior necesita Motion, entra como import dinámico, nunca en el bundle inicial. (Pregunta abierta 1 para Santiago.)

**Tech Stack:** Next.js 16.2.6 (App Router, Turbopack), React 19.2, TypeScript strict, Tailwind CSS 4, CSS scroll-driven animations y View Transitions, Vitest 3, Playwright + `@axe-core/playwright`, `@lhci/cli`.

**Spec:** `docs/superpowers/specs/2026-09-30-sgomez-redesign-design.md` (esta fase = §10.2; con §2 contraste, §6 movimiento y accesibilidad, §7 presupuestos y §9 pruebas). La spec del 404 (`docs/superpowers/specs/2026-10-01-sgomez-404-experiencia-design.md`, §7.1) fija la regla de 3D solo en escritorio.

**Directorio de trabajo:** la app está en `sgomez/` dentro del repo (`C:\Users\santiago.gomez\Desktop\Repos\sgomez-v3\sgomez`). Todos los comandos `npm` y `npx` se ejecutan ahí. La rama es `feat/redesign-v3`.

## Global Constraints

- **El contenido nunca depende de la animación** (spec §6). El HTML se sirve con el estado final visible; nada usa `opacity: 0` ni `visibility: hidden` en el SSR; la animación solo arranca en el cliente, solo con JS y solo si el movimiento está permitido.
- **`prefers-reduced-motion: reduce`** desactiva todo: animaciones ligadas al scroll, contador, imán, transiciones de página y `scroll-behavior: smooth`. Si cambia a mitad de visita, todo vuelve al estado final al instante y el runtime se para.
- **Contraste AA en TODOS los estados de la animación** (spec §2 y §7): 4,5:1 en cuerpo, 3:1 en display ≥ 24 px. Regla de implementación: **ningún elemento con texto anima `opacity` ni `filter`**. El texto entra con `translate`, `scale` y `clip-path`, y cambia de color solo entre tokens que ya cumplen AA (`--text-2` `#AAB2C6` y `--text` `#F4F6FB`). `opacity` solo en capas decorativas con `aria-hidden="true"`.
- **Las entradas terminan, como tarde, en `entry 100%`**: un elemento entero dentro del viewport está en su estado final. Única excepción, la bio palabra a palabra, cuyo estado inicial ya es texto legible en `--text-2`.
- **Propiedades separadas para no pisarse:** las entradas animan `translate` y `scale` (propiedades individuales); el imán usa `transform`. Nunca dos mecanismos sobre la misma propiedad del mismo elemento.
- **El LCP no se anima.** El `<h1>` del hero, el retrato y el póster del cristal quedan fuera de esta fase (el hero es la fase 3). El selector de titulares es solo `h2[data-motion="text-reveal"]`.
- **3D solo en escritorio, y no en esta fase.** Esta fase no importa `three`, `@react-three/fiber` ni nada de `src/three/`. El `GlassPoster` del contacto sigue siendo el póster (spec 404 §7.1: en móvil el 3D midió ~9 s de TBT).
- **Presupuestos:** JS inicial ≤ 170 KB gzip en `/`, `/en` y el molde del 404, medido por `scripts/js-budget.mjs` (Task 1) y por el e2e de `e2e/experience.spec.ts`. Runtime perezoso de movimiento ≤ 6 KB gzip. CSS de movimiento ≤ 8 KB gzip sobre la línea base. CLS < 0,05 también durante el scroll. TBT < 200 ms.
- **Navegadores sin `animation-timeline`** (hoy, Firefox) ven el estado final estático. Todo el CSS de movimiento vive dentro de `@supports (animation-timeline: view())`.
- **Responsive** de 320 a 1920 px y en horizontal (844×390): 320, 375, 414, 768, 1024, 1280, 1440 y 1920, sin scroll horizontal de página en ningún estado de ninguna animación. La línea de tiempo fijada solo existe con `(min-width: 64rem) and (min-height: 37.5rem)`; por debajo, el comportamiento estático de la fase 1. El imán solo con `(hover: hover) and (pointer: fine)`.
- **Bilingüe ES/EN** por los diccionarios existentes (`src/i18n/dictionaries/{es,en}.ts`). Cualquier cadena nueva va a los dos con las mismas claves (`tests/i18n.test.ts` lo comprueba).
- **Texto para personas:** sin raya (—), semirraya (–) ni doble guion (--), y sin dos puntos retóricos. `tests/no-dashes.test.tsx` ya cubre diccionarios y capítulos; cualquier texto nuevo tiene que pasar por él.
- **El nombre** es «Santiago Gómez de la Torre Romero» o, en corto, «Santiago Gómez de la Torre». Nunca «Santiago Gómez» a secas.
- **Sin APIs de pago ni servicios externos nuevos.** Sin dependencias nuevas en `dependencies`.
- `<Link>` siempre con `prefetch={false}` (`tests/links.test.ts`). No se pasan funciones a componentes `'use client'`.
- **Commits** con el autor del `git config` del repo y **sin** `Co-Authored-By` ni ningún otro trailer. Solo en local; sin push.

## Review Focus

1. **Aterrizar a mitad de página.** Entrar en `/#contact`, recargar con la posición restaurada a mitad de `#proof` o llegar al final del documento: todo elemento animado que esté entero en el viewport tiene que estar en su estado final, aunque ya no se pueda bajar más. Se fija en la Task 2 con la utilidad `settledInViewport()` y en las Tasks 3, 6 y 8 con un e2e en `/#contact` y al final del scroll.
2. **Movimiento reducido activado a mitad de visita.** Al cambiar `prefers-reduced-motion` con la página abierta, `data-motion-state` pasa a `off`, `document.getAnimations()` queda vacío, el contador enseña el número real y el imán vuelve a cero. Se fija en la Task 2 (atributo y runtime) y en la Task 4 (contador) con `page.emulateMedia` a mitad del test.
3. **Cruzar el umbral de la línea de tiempo fijada.** Pasar de 1280×800 a 844×390 (o a 1024×560) con la experiencia a medio deslizar devuelve la lista estática, sin scroll horizontal de página y sin la sección con el alto inflado. Se fija en la Task 5 con un e2e que cambia el viewport a mitad del scroll.
4. **Navegación de cliente ida y vuelta.** `/` → `/about` (enlace del pie) → atrás: el runtime se para al salir y se vuelve a enganchar al volver, sin oyentes duplicados (un solo `pointermove` por elemento magnético) y sin errores de consola. Se fija en la Task 2 con un contador de `start()` expuesto solo en pruebas y en la Task 7 con el e2e de transiciones.
5. **Sin JS y con Save-Data.** Con JS desactivado no hay `data-motion-state` y no hay ninguna animación; con `Save-Data` el estado es `off` y el chunk del runtime no se pide. Se fija en la Task 2 con dos e2e (JS desactivado y `navigator.connection.saveData` forzado por init-script).

---

## Mapa de ficheros

| Fichero | Responsabilidad |
|---|---|
| `scripts/js-budget.mjs`, `scripts/js-budget-lib.mjs` | presupuesto de JS inicial por ruta (desde el HTML prerenderizado), del runtime perezoso y del CSS |
| `src/motion/boot.ts` | `MOTION_ATTR`, `motionStateFor()`, `MOTION_BOOT_SCRIPT` (script en línea del `<head>`) |
| `src/motion/MotionDirector.tsx` | único componente cliente nuevo: importa el runtime tras idle, lo para y lo rearranca |
| `src/motion/runtime.ts` | `start(root, registry?)`: registro de primitivas JS por valor de `data-motion` |
| `src/motion/types.ts` | `type Primitive` |
| `src/motion/math.ts` | funciones puras: `countAt`, `magneticOffset`, `wordSpans` |
| `src/motion/primitives/counter.ts` | Counter (capítulo 02) |
| `src/motion/primitives/magnetic.ts` | Magnetic (capítulo 09) |
| `src/motion/motion.css` | tokens de movimiento y todas las animaciones ligadas al scroll |
| `src/components/motion/WordReveal.tsx` | divide un texto en palabras en el servidor (TextReveal palabra a palabra) |
| `src/components/motion/BuildTrace.tsx` | capa SVG decorativa que se traza alrededor de una tarjeta |
| `src/chapters/{About,Experience,OpenSource,Proof,Contact}.tsx` | solo atributos y envoltorios nuevos; el contenido no cambia |
| `src/app/[lang]/layout.tsx` | `<head>` con el script, `suppressHydrationWarning` en `<html>`, `<MotionDirector />`, `<ViewTransition>` |
| `e2e/motion-utils.ts` | `scrollToProgress()`, `settledInViewport()`, `layoutShiftDuring()` |
| `e2e/motion-*.spec.ts` | e2e de cada primitiva y la verificación transversal |
| `tests/motion-*.test.ts(x)`, `tests/js-budget.test.ts` | unitarias |

Primitivas de la spec §4 y dónde viven en este plan: **TextReveal** (titulares `h2` y bio, CSS + `WordReveal`), **StickyScene** (bio fijada y línea de tiempo fijada, CSS), **Counter** (runtime), **BuildTrace** (CSS + `BuildTrace.tsx`), **Magnetic** (runtime + CSS), **PageTransition** (View Transitions). **ScrollSequence** es de la fase 4. Cada una tiene su variante sin movimiento, que es el HTML de la fase 1 sin cambios.

---

### Task 1: Medidor de presupuesto y línea base (núcleo)

Todas las tareas siguientes se cierran con `npm run budget`. Esta tarea lo crea, mide la línea base real y deja el presupuesto aplicado en CI.

**Hallazgo previo, a confirmar.** Sobre el build que había en `.next/` al escribir este plan, el HTML de `/es` referencia 10 scripts que suman ≈ 196 KB gzip, pero uno de ellos (`03~….js`, ≈ 39 KB gzip) es el polyfill de core-js con `noModule`, que ningún navegador moderno descarga. Sin él quedan ≈ 157 KB. Es probable que la cifra de ~190 KB cuente ese polyfill. El script de esta tarea lo excluye a propósito y lo lista aparte, y el informe de la tarea tiene que decir qué cifra es la real.

**Files:**
- Create: `scripts/js-budget-lib.mjs`, `scripts/js-budget.mjs`
- Modify: `package.json` (script `budget`; retira `framer-motion`), `package-lock.json`, `../.github/workflows/ci.yml` (paso `npm run budget` tras los e2e)
- Test: `tests/js-budget.test.ts`

**Interfaces:**
- Produces:
  - `initialScripts(html: string): string[]`: rutas `/_next/…` de los `<script src>` sin `noModule` y de los `<link rel="preload" as="script">`, sin duplicados, en orden de aparición.
  - `legacyScripts(html: string): string[]`: los `<script noModule src>`.
  - `BUDGET = { initialKB: 170, runtimeKB: 6, cssKB: <línea base + 8> }`
  - `npm run budget`: imprime una tabla por ruta y sale con código 1 si algo se pasa. Busca el runtime de movimiento por la cadena `MOTION_RUNTIME_MARKER` (`"sgomez-motion-runtime"`, Task 2); si aún no existe, lo dice y no falla.

- [ ] **Step 1: Write the failing test**

```ts
// tests/js-budget.test.ts
import { describe, expect, it } from "vitest";
// @ts-expect-error módulo .mjs sin tipos
import { initialScripts, legacyScripts } from "../scripts/js-budget-lib.mjs";

const HTML = `<!DOCTYPE html><html><head>
<link rel="preload" as="script" fetchPriority="low" href="/_next/static/chunks/pre.js"/>
<script src="/_next/static/chunks/poly.js" noModule=""></script>
<script src="/_next/static/chunks/a.js" async=""></script>
<script src="/_next/static/chunks/b.js" async=""></script>
<script src="/_next/static/chunks/a.js" async=""></script>
<script>self.__next_f=[]</script>
</head></html>`;

describe("presupuesto de JS: lectura del HTML", () => {
  it("cuenta los scripts iniciales y los preload, sin duplicados ni inline", () => {
    expect(initialScripts(HTML)).toEqual(["/_next/static/chunks/pre.js", "/_next/static/chunks/a.js", "/_next/static/chunks/b.js"]);
  });
  it("el polyfill noModule no cuenta como inicial: va aparte", () => {
    expect(initialScripts(HTML)).not.toContain("/_next/static/chunks/poly.js");
    expect(legacyScripts(HTML)).toEqual(["/_next/static/chunks/poly.js"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/js-budget.test.ts`
Expected: FAIL, `Cannot find module '../scripts/js-budget-lib.mjs'`.

- [ ] **Step 3: Implement**

```js
// scripts/js-budget-lib.mjs
/** Scripts que el navegador moderno descarga al cargar la página (sin los noModule). */
export function initialScripts(html) {
  const out = [];
  const add = (src) => { if (src && src.startsWith("/_next/") && !out.includes(src)) out.push(src); };
  const tags = [...html.matchAll(/<(script|link)\b([^>]*)>/g)];
  for (const [, tag, attrs] of tags) {
    if (tag === "script") {
      if (/\bnoModule\b/i.test(attrs)) continue;
      add(/\bsrc="([^"]+)"/.exec(attrs)?.[1]);
    } else if (/\brel="preload"/.test(attrs) && /\bas="script"/.test(attrs)) {
      add(/\bhref="([^"]+)"/.exec(attrs)?.[1]);
    }
  }
  return out;
}

export function legacyScripts(html) {
  return [...html.matchAll(/<script\b([^>]*)>/g)]
    .filter(([, a]) => /\bnoModule\b/i.test(a))
    .map(([, a]) => /\bsrc="([^"]+)"/.exec(a)?.[1])
    .filter(Boolean);
}
```

```js
// scripts/js-budget.mjs
// Uso: npm run build && npm run budget. Lee el HTML prerenderizado de .next/server/app.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { initialScripts, legacyScripts } from "./js-budget-lib.mjs";

export const BUDGET = { initialKB: 170, runtimeKB: 6, cssKB: 0 /* Step 4: línea base + 8 */ };
const ROUTES = { "/": "es.html", "/en": "en.html", "404 (molde es)": "es/perdido.html", "404 (molde en)": "en/perdido.html" };
const NEXT = join(process.cwd(), ".next");
const gz = (file) => gzipSync(readFileSync(file)).length / 1024;
const disk = (src) => join(NEXT, src.replace(/^\/_next\//, ""));
let failed = false;

for (const [route, file] of Object.entries(ROUTES)) {
  const html = readFileSync(join(NEXT, "server", "app", file), "utf8");
  const rows = initialScripts(html).map((src) => [src, gz(disk(src))]).sort((a, b) => b[1] - a[1]);
  const total = rows.reduce((s, [, kb]) => s + kb, 0);
  const legacy = legacyScripts(html).reduce((s, src) => s + gz(disk(src)), 0);
  console.log(`\n${route}: ${total.toFixed(1)} KB gzip iniciales (${rows.length} scripts); polyfill noModule aparte: ${legacy.toFixed(1)} KB`);
  for (const [src, kb] of rows) console.log(`  ${kb.toFixed(1).padStart(6)}  ${src}`);
  if (total > BUDGET.initialKB) { failed = true; console.error(`  SE PASA de ${BUDGET.initialKB} KB`); }
}

const chunks = join(NEXT, "static", "chunks");
const runtime = readdirSync(chunks).filter((f) => f.endsWith(".js") && readFileSync(join(chunks, f), "utf8").includes("sgomez-motion-runtime"));
if (runtime.length === 0) console.log("\nruntime de movimiento: todavía no existe");
else {
  const kb = runtime.reduce((s, f) => s + gz(join(chunks, f)), 0);
  console.log(`\nruntime de movimiento: ${kb.toFixed(1)} KB gzip (${runtime.join(", ")})`);
  if (kb > BUDGET.runtimeKB) { failed = true; console.error(`  SE PASA de ${BUDGET.runtimeKB} KB`); }
}

const cssDir = join(NEXT, "static", "chunks");
const css = existsSync(cssDir) ? readdirSync(cssDir).filter((f) => f.endsWith(".css")) : [];
const cssKB = css.reduce((s, f) => s + gz(join(cssDir, f)), 0);
console.log(`\nCSS: ${cssKB.toFixed(1)} KB gzip en ${css.length} ficheros`);
if (BUDGET.cssKB > 0 && cssKB > BUDGET.cssKB) { failed = true; console.error(`  SE PASA de ${BUDGET.cssKB} KB`); }

process.exit(failed ? 1 : 0);
```

If the CSS lives under `.next/static/css/` instead of `chunks/`, point `cssDir` there (`ls .next/static` tells you). In `package.json`: `"budget": "node scripts/js-budget.mjs"`. Remove the unused dependency with `npm uninstall framer-motion`; `grep -rn "framer-motion\|from \"motion" src e2e tests` must print nothing before you do it.

- [ ] **Step 4: Measure the baseline**

Run: `npx vitest run tests/js-budget.test.ts && npm run build && npm run budget`
Expected: PASS for the test, then a table per route. Then:
- set `BUDGET.cssKB` to the measured CSS total rounded up to the next whole KB, plus 8;
- run the e2e budget too, `npx playwright test e2e/experience.spec.ts -g "presupuesto" --project=desktop`, and compare its numbers with the script's. They must agree within 2 KB per route (the e2e also counts what loads up to `networkidle`).

- [ ] **Step 5: If any route is over 170 KB, cut it before going on**

Work down this list and stop when every route is under, re-running `npm run build && npm run budget` after each change:
1. Attribute the big chunks with `npx next experimental-analyze` (Turbopack's analyzer in Next 16) and write in the report which module dominates each chunk over 5 KB.
2. Client components that only need to run on interaction (`NavDisclosure`, `LangSwitch`): check they don't pull a whole module tree through a barrel import; import leaf modules.
3. Server-only data (`@/app/content`, `@/app/seo`, dictionaries) must never appear in a client chunk: `grep` the chunks for a long string from `content/index.tsx`. If it's there, a client component imports it; pass plain strings as props instead.
4. Anything else is a decision for Santiago: stop and report the attribution, do not trim features on your own.

- [ ] **Step 6: CI**

In `../.github/workflows/ci.yml`, right after the `End-to-end tests` step (which leaves a fresh build in `.next/`), add:

```yaml
      - name: JS and CSS budget
        run: npm run budget
```

- [ ] **Step 7: Commit**

Put the measured numbers (per route, with and without the polyfill, and the CSS baseline) in the commit body.

```bash
git add scripts tests/js-budget.test.ts package.json package-lock.json ../.github/workflows/ci.yml
git commit -m "build(budget): presupuesto de JS y CSS por ruta desde el HTML prerenderizado; fuera framer-motion, que no se usaba"
```

---

### Task 2: Cimientos del movimiento (núcleo)

Todas las demás tareas consumen lo que crea esta: el atributo de estado, el CSS base, el director y el registro del runtime.

**Files:**
- Create: `src/motion/boot.ts`, `src/motion/types.ts`, `src/motion/runtime.ts`, `src/motion/MotionDirector.tsx`, `src/motion/motion.css`, `e2e/motion-utils.ts`, `e2e/motion-gate.spec.ts`
- Modify: `src/app/globals.css` (importa `../motion/motion.css`), `src/app/[lang]/layout.tsx` (`<head>` con el script, `suppressHydrationWarning`, `<MotionDirector />` al final del `<body>`)
- Test: `tests/motion-boot.test.ts`, `tests/motion-runtime.test.ts`, `tests/motion-css.test.ts`

**Interfaces:**
- Produces:
  - `MOTION_ATTR = "data-motion-state"`, `type MotionState = "on" | "off"`
  - `motionStateFor(env: { reducedMotion: boolean; saveData: boolean }): MotionState`
  - `MOTION_BOOT_SCRIPT: string`, que hace lo mismo que `motionStateFor` en el navegador y sigue los cambios de `prefers-reduced-motion`
  - `type Primitive = (el: HTMLElement) => (() => void) | void`. Contrato: la función que devuelve deja el elemento **exactamente** como lo pintó el servidor.
  - `REGISTRY: Record<string, Primitive>` (vacío en esta tarea; las Tasks 4 y 6 añaden `count`, `intent` y `magnetic`)
  - `start(root: ParentNode, registry?: Record<string, Primitive>): () => void`
  - `MOTION_RUNTIME_MARKER = "sgomez-motion-runtime"` (lo busca `npm run budget`)
  - En `motion.css`: tokens `--mo-ease` `cubic-bezier(0.2, 0.7, 0, 1)`, `--mo-ease-out` `cubic-bezier(0.16, 1, 0.3, 1)`, `--mo-rise` `1.25rem`, `--mo-stagger` `8%`, y el bloque de puerta (ver Step 3) donde las Tasks 3 a 6 añaden sus reglas.
  - En `e2e/motion-utils.ts`: `settledInViewport(page): Promise<string[]>` (devuelve la descripción de cada elemento animado entero en el viewport cuya animación no está en progreso 1; vacío = bien), `scrollToProgress(page, selector, fraction)`, `layoutShiftDuring(page, fn): Promise<number>`

- [ ] **Step 1: Write the failing tests**

```ts
// tests/motion-boot.test.ts
import { describe, expect, it } from "vitest";
import { MOTION_ATTR, MOTION_BOOT_SCRIPT, motionStateFor } from "@/motion/boot";

function runBoot(opts: { reduce: boolean; saveData?: boolean }) {
  const attrs: Record<string, string> = {};
  let listener: (() => void) | undefined;
  const mql = { matches: opts.reduce, addEventListener: (_: string, fn: () => void) => (listener = fn) };
  const document = { documentElement: { setAttribute: (k: string, v: string) => (attrs[k] = v) } };
  const navigator = { connection: opts.saveData ? { saveData: true } : undefined };
  new Function("document", "matchMedia", "navigator", MOTION_BOOT_SCRIPT)(document, () => mql, navigator);
  return { attrs, mql, fire: () => listener?.() };
}

describe("estado del movimiento", () => {
  it("motionStateFor", () => {
    expect(motionStateFor({ reducedMotion: false, saveData: false })).toBe("on");
    expect(motionStateFor({ reducedMotion: true, saveData: false })).toBe("off");
    expect(motionStateFor({ reducedMotion: false, saveData: true })).toBe("off");
  });
  it("el script del head pone el atributo antes del primer pintado", () => {
    expect(runBoot({ reduce: false }).attrs[MOTION_ATTR]).toBe("on");
    expect(runBoot({ reduce: true }).attrs[MOTION_ATTR]).toBe("off");
    expect(runBoot({ reduce: false, saveData: true }).attrs[MOTION_ATTR]).toBe("off");
  });
  it("sigue los cambios de prefers-reduced-motion", () => {
    const b = runBoot({ reduce: false });
    b.mql.matches = true;
    b.fire();
    expect(b.attrs[MOTION_ATTR]).toBe("off");
  });
  it("no rompe la página si matchMedia no existe", () => {
    expect(() => new Function("document", "matchMedia", "navigator", MOTION_BOOT_SCRIPT)({}, undefined, {})).not.toThrow();
  });
  it("es pequeño", () => expect(MOTION_BOOT_SCRIPT.length).toBeLessThan(400));
});
```

```ts
// tests/motion-runtime.test.ts
import { describe, expect, it, vi } from "vitest";
import { start } from "@/motion/runtime";

function fakeRoot(values: string[]) {
  const els = values.map((v) => ({ dataset: { motion: v } }) as unknown as HTMLElement);
  return { els, root: { querySelectorAll: () => els } as unknown as ParentNode };
}

describe("runtime de movimiento", () => {
  it("engancha solo las primitivas registradas y las para todas", () => {
    const stop = vi.fn();
    const count = vi.fn(() => stop);
    const { root } = fakeRoot(["count", "glass", "count"]);
    const halt = start(root, { count });
    expect(count).toHaveBeenCalledTimes(2);
    halt();
    expect(stop).toHaveBeenCalledTimes(2);
    halt();
    expect(stop).toHaveBeenCalledTimes(2);
  });
  it("una primitiva que lanza no apaga a las demás", () => {
    const ok = vi.fn();
    const { root } = fakeRoot(["bad", "ok"]);
    expect(() => start(root, { bad: () => { throw new Error("x"); }, ok })).not.toThrow();
    expect(ok).toHaveBeenCalledTimes(1);
  });
});
```

```ts
// tests/motion-css.test.ts
import { describe, expect, it } from "vitest";
import fs from "node:fs";

const css = fs.readFileSync("src/motion/motion.css", "utf8");
const keyframes = [...css.matchAll(/@keyframes\s+([\w-]+)\s*\{([\s\S]*?)\n\}/g)].map((m) => ({ name: m[1]!, body: m[2]! }));

describe("motion.css", () => {
  it("toda regla con animation-timeline está detrás de la puerta", () => {
    const gate = css.indexOf('@media (prefers-reduced-motion: no-preference)');
    const supports = css.indexOf("@supports (animation-timeline: view())");
    expect(gate).toBeGreaterThanOrEqual(0);
    expect(supports).toBeGreaterThan(gate);
    const firstUse = css.search(/animation-timeline:\s*(?!none)/);
    if (firstUse >= 0) expect(firstUse).toBeGreaterThan(supports);
    expect(css).toMatch(/:root\[data-motion-state="on"\]/);
  });
  it("los keyframes de texto nunca tocan opacity ni filter (contraste AA en cada estado)", () => {
    for (const k of keyframes.filter((k) => !k.name.startsWith("mo-deco-"))) {
      expect(k.body, k.name).not.toMatch(/\bopacity\s*:/);
      expect(k.body, k.name).not.toMatch(/\bfilter\s*:/);
    }
  });
  it("las entradas usan translate/scale, nunca transform (el imán es dueño de transform)", () => {
    for (const k of keyframes) expect(k.body, k.name).not.toMatch(/\btransform\s*:/);
  });
  it("el h1 del hero (LCP) no se anima", () => {
    expect(css).not.toMatch(/h1\[data-motion/);
    expect(css).not.toMatch(/(^|[\s,{])\[data-motion="text-reveal"\]/m);
  });
});
```

`tests/motion-css.test.ts` will be extended by Tasks 3 to 6; the rules above apply to everything they add. Decorative layers that need `opacity` use keyframes named `mo-deco-*` and must target only `aria-hidden="true"` elements.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/motion-boot.test.ts tests/motion-runtime.test.ts tests/motion-css.test.ts`
Expected: FAIL, modules and `src/motion/motion.css` missing.

- [ ] **Step 3: Implement**

```ts
// src/motion/boot.ts
export const MOTION_ATTR = "data-motion-state";
export type MotionState = "on" | "off";

export function motionStateFor(env: { reducedMotion: boolean; saveData: boolean }): MotionState {
  return env.reducedMotion || env.saveData ? "off" : "on";
}

/**
 * Va en línea en el <head> y corre antes del primer pintado: el CSS de movimiento
 * cuelga de este atributo, así que nunca hay un fotograma con el estado equivocado.
 * Sin JS no se ejecuta y no hay atributo, luego no hay animación (spec §6).
 */
export const MOTION_BOOT_SCRIPT = `(function(){try{var d=document.documentElement,m=matchMedia("(prefers-reduced-motion: reduce)"),c=navigator.connection,s=function(){d.setAttribute("${MOTION_ATTR}",m.matches||(c&&c.saveData)?"off":"on")};s();m.addEventListener("change",s)}catch(e){}})();`;
```

```ts
// src/motion/types.ts
/** Engancha el movimiento a un elemento pintado por el servidor. Lo que devuelve lo deja como estaba. */
export type Primitive = (el: HTMLElement) => (() => void) | void;
```

```ts
// src/motion/runtime.ts
import type { Primitive } from "./types";

/** Lo busca `npm run budget` para medir este chunk. No lo quites. */
export const MOTION_RUNTIME_MARKER = "sgomez-motion-runtime";

/** Valor de `data-motion` → primitiva JS. Lo que no está aquí lo anima solo el CSS. */
export const REGISTRY: Record<string, Primitive> = {};

let starts = 0;

export function start(root: ParentNode, registry: Record<string, Primitive> = REGISTRY): () => void {
  starts++;
  if (typeof window !== "undefined") (window as { __MOTION_STARTS__?: number }).__MOTION_STARTS__ = starts;
  const stops: (() => void)[] = [];
  for (const el of root.querySelectorAll<HTMLElement>("[data-motion]")) {
    const primitive = registry[el.dataset.motion ?? ""];
    if (!primitive) continue;
    try {
      const stop = primitive(el);
      if (stop) stops.push(stop);
    } catch {
      // una primitiva rota deja su elemento en el estado del servidor y no apaga a las demás
    }
  }
  return () => {
    for (const stop of stops.splice(0)) stop();
  };
}
```

```tsx
// src/motion/MotionDirector.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { MOTION_ATTR } from "./boot";

type Idle = (cb: () => void, opts?: { timeout: number }) => number;

/**
 * Único componente cliente de la fase 2. No pinta nada: tras un hueco ocioso
 * importa el runtime (chunk aparte) y lo engancha a los `data-motion` de la
 * página. Lo para al cambiar de ruta y cuando el movimiento pasa a `off`.
 */
export default function MotionDirector() {
  const pathname = usePathname();
  useEffect(() => {
    const html = document.documentElement;
    let stop: (() => void) | undefined;
    let alive = true;
    const isOn = () => html.getAttribute(MOTION_ATTR) === "on";
    const run = () => {
      if (!alive || stop || !isOn()) return;
      import("./runtime")
        .then((m) => {
          if (alive && !stop && isOn()) stop = m.start(document);
        })
        .catch(() => {});
    };
    const w = window as unknown as { requestIdleCallback?: Idle; cancelIdleCallback?: (h: number) => void };
    const handle = w.requestIdleCallback ? w.requestIdleCallback(run, { timeout: 2000 }) : window.setTimeout(run, 200);
    const watch = new MutationObserver(() => {
      if (isOn()) run();
      else {
        stop?.();
        stop = undefined;
      }
    });
    watch.observe(html, { attributes: true, attributeFilter: [MOTION_ATTR] });
    return () => {
      alive = false;
      watch.disconnect();
      stop?.();
      if (w.cancelIdleCallback) w.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
  }, [pathname]);
  return null;
}
```

`motion.css` (the gate every later task writes inside):

```css
/* Movimiento de la fase 2. Mejora progresiva: sin JS, con movimiento reducido,
   con Save-Data o sin animation-timeline, no aplica NADA y se ve el estado final. */
:root {
  --mo-ease: cubic-bezier(0.2, 0.7, 0, 1);
  --mo-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --mo-rise: 1.25rem;
  --mo-stagger: 8%;
}

@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    /* Tasks 3 a 6 añaden aquí sus reglas, todas con el prefijo :root[data-motion-state="on"]. */
  }
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

In `globals.css`, add `@import "../motion/motion.css";` after the tokens import, and make the existing `scroll-behavior: smooth` rule also require `:root[data-motion-state="on"]` (so Save-Data gets instant jumps too).

In `layout.tsx`:

```tsx
import MotionDirector from "@/motion/MotionDirector";
import { MOTION_BOOT_SCRIPT } from "@/motion/boot";
// …
<html lang={…} className={…} suppressHydrationWarning>
  <head>
    {/* Antes del primer pintado: decide si hay movimiento (ver src/motion/boot.ts). */}
    <script dangerouslySetInnerHTML={{ __html: MOTION_BOOT_SCRIPT }} />
  </head>
  <body className="antialiased">
    {/* …lo de siempre… */}
    <MotionDirector />
  </body>
</html>
```

`suppressHydrationWarning` is needed because the attribute on `<html>` is set before React hydrates; it only silences that one element's attributes.

`e2e/motion-utils.ts`:

```ts
import type { Page } from "@playwright/test";

/** Elementos animados enteros en el viewport cuya animación NO ha llegado al final. Vacío = bien. */
export async function settledInViewport(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const out: string[] = [];
    const vh = innerHeight;
    for (const el of document.querySelectorAll<HTMLElement>("[data-motion], [data-motion] *")) {
      const r = el.getBoundingClientRect();
      if (r.height === 0 || r.top < 0 || r.bottom > vh) continue;
      // la bio (Task 4) y la escena fijada (Task 5) dependen de la posición a propósito: no son entradas
      if (el.closest('[data-motion="word-reveal"], [data-pin]')) continue;
      for (const a of el.getAnimations()) {
        if (a.effect?.getComputedTiming().progress !== 1) {
          out.push(`${el.tagName.toLowerCase()}[data-motion=${el.closest<HTMLElement>("[data-motion]")?.dataset.motion}] ${a.animationName ?? ""}`);
        }
      }
    }
    return out;
  });
}

/** Pone el borde superior de `selector` en la fracción `fraction` del viewport (0 = arriba, 1 = abajo). */
export async function scrollToProgress(page: Page, selector: string, fraction: number) {
  await page.evaluate(
    ([sel, f]) => {
      const el = document.querySelector(sel as string)!;
      const top = el.getBoundingClientRect().top + scrollY;
      scrollTo({ top: top - innerHeight * (f as number), behavior: "instant" });
    },
    [selector, fraction] as const,
  );
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}

/** Suma de layout-shift sin input reciente mientras corre `fn`. */
export async function layoutShiftDuring(page: Page, fn: () => Promise<void>): Promise<number> {
  await page.evaluate(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
        if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
      }
    }).observe({ type: "layout-shift", buffered: false });
  });
  await fn();
  return page.evaluate(() => (window as unknown as { __cls: number }).__cls);
}
```

(`CSSAnimation.animationName` exists on CSS animations; the `??` covers others.)

`e2e/motion-gate.spec.ts`:

```ts
import { test, expect } from "./fixtures";

test.describe("puerta del movimiento", () => {
  test("con movimiento: estado on y el runtime se carga tras idle", async ({ page }) => {
    const chunks: string[] = [];
    page.on("response", async (r) => {
      if (r.url().endsWith(".js") && (await r.text()).includes("sgomez-motion-runtime")) chunks.push(r.url());
    });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-motion-state", "on");
    await expect.poll(() => chunks.length, { timeout: 5000 }).toBe(1);
  });

  test("movimiento reducido: off, sin runtime y sin animaciones", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const chunks: string[] = [];
    page.on("response", async (r) => {
      if (r.url().endsWith(".js") && (await r.text()).includes("sgomez-motion-runtime")) chunks.push(r.url());
    });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-motion-state", "off");
    await page.mouse.wheel(0, 4000);
    await page.waitForTimeout(2500);
    expect(chunks).toEqual([]);
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  });

  test("Review Focus 2: cambiar a reducido a mitad de visita lo apaga todo", async ({ page }) => {
    await page.goto("/");
    await page.mouse.wheel(0, 2500);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator("html")).toHaveAttribute("data-motion-state", "off");
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  });

  test("Review Focus 5: sin JS no hay atributo ni animaciones", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/");
    expect(await page.locator("html").getAttribute("data-motion-state")).toBeNull();
    await ctx.close();
  });

  test("Review Focus 5: Save-Data apaga el movimiento", async ({ page }) => {
    await page.addInitScript(() => Object.defineProperty(navigator, "connection", { value: { saveData: true } }));
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-motion-state", "off");
  });

  test("Review Focus 4: ida y vuelta por navegación de cliente re-engancha una sola vez", async ({ page }) => {
    await page.goto("/");
    await expect.poll(() => page.evaluate(() => (window as { __MOTION_STARTS__?: number }).__MOTION_STARTS__ ?? 0)).toBe(1);
    await page.locator("footer").getByRole("link", { name: /sobre mí|about/i }).first().click();
    await expect(page).toHaveURL(/\/about$/);
    await page.goBack();
    await expect(page.locator("#about")).toBeVisible();
    await expect.poll(() => page.evaluate(() => (window as { __MOTION_STARTS__?: number }).__MOTION_STARTS__ ?? 0)).toBe(3);
  });
});
```

(`__MOTION_STARTS__` counts every `start()`: once on `/`, once on `/about`, once back on `/`. Each `start` is paired with the previous `stop` by the effect cleanup.) Check the footer's real link label in `src/components/Footer.tsx` and use it in the `name` regex.

- [ ] **Step 4: Run tests and build**

Run: `npx vitest run && npm run build && npm run budget && npx playwright test e2e/motion-gate.spec.ts --project=desktop`
Expected: all PASS. `npm run budget` shows the runtime chunk (a few hundred bytes so far) and every route still ≤ 170 KB; write in the report how many bytes the director added to the initial JS (target ≤ 1,5 KB gzip).

- [ ] **Step 5: Commit**

```bash
git add -A src/motion src/app e2e/motion-utils.ts e2e/motion-gate.spec.ts tests/motion-*.test.ts
git commit -m "feat(motion): estado del movimiento antes del primer pintado, director perezoso y CSS de movimiento detrás de su puerta"
```

---

### Task 3: Titulares y tarjetas que se construyen (TextReveal de titulares + BuildTrace, capítulo 06)

**Files:**
- Create: `src/components/motion/BuildTrace.tsx`, `e2e/motion-build.spec.ts`
- Modify: `src/motion/motion.css`, `src/chapters/OpenSource.tsx` (añade `<BuildTrace />` y `style={{ "--i": i }}` en cada `li[data-motion="build"]`)
- Test: extend `tests/motion-css.test.ts`, `tests/chapters.test.tsx`

**Interfaces:**
- Consumes: the gate block and tokens of `motion.css`, `settledInViewport` and `scrollToProgress` (Task 2)
- Produces: `<BuildTrace />`, a server component that renders `<svg data-layer="trace" aria-hidden="true" focusable="false">` with one `<rect pathLength="1">`; keyframes `mo-rise`, `mo-trace`, `mo-deco-fade`, `mo-fill`, `mo-content`

The effect:
- **Every chapter `h2`** (they all carry `data-motion="text-reveal"` through `<Display motion>`) rises out of a mask as it enters: `clip-path` from `inset(-0.25em -0.25em 100% -0.25em)` to `inset(-0.25em)`, `translate` from `0 0.4em` to `0 0`, range `entry 0% entry 100%`, easing `--mo-ease`. Opacity stays at 1.
- **Each open source card** builds in four beats on one named timeline (`view-timeline: --build block` on the `li`), staggered by `--i` across the three columns:
  1. the plane (trace): the SVG rect's stroke draws itself, `stroke-dashoffset` 1 → 0, range `entry calc(var(--i) * var(--mo-stagger)) entry calc(45% + var(--i) * var(--mo-stagger))`;
  2. the edge: the existing `[data-layer="outline"]` fades in (`mo-deco-fade`, decorative, `aria-hidden`), `entry calc(35% + …)` to `entry calc(55% + …)`;
  3. the fill: `[data-layer="fill"]` wipes up, `clip-path: inset(100% 0 0 0 round var(--radius))` → `inset(0 round var(--radius))`, `entry calc(40% + …)` to `entry calc(70% + …)`;
  4. the content: `[data-layer="content"]` rises, `translate: 0 var(--mo-rise)` → `0 0` plus `clip-path: inset(0 0 100% 0)` → `inset(-2rem)`, `entry calc(55% + …)` to `entry 100%`.
  While the fill is still clipped, the content sits on `--bg`, and every text token passes AA on all three backgrounds (`tests/design.test.ts`).

- [ ] **Step 1: Write the failing tests**

Append to `tests/motion-css.test.ts`:

```ts
describe("titulares y construcción", () => {
  it("anima solo los h2 de capítulo", () => expect(css).toMatch(/h2\[data-motion="text-reveal"\]/));
  it("cada fase de la construcción termina como tarde en entry 100%", () => {
    for (const m of css.matchAll(/animation-range:\s*([^;]+);/g)) {
      expect(m[1], m[0]).not.toMatch(/\b(cover|exit)\b/);
    }
  });
  it("las tarjetas usan una línea de tiempo con nombre para sus cuatro capas", () => {
    expect(css).toMatch(/view-timeline:\s*--build\s+block/);
    for (const layer of ["trace", "outline", "fill", "content"]) expect(css).toContain(`[data-layer="${layer}"]`);
  });
});
```

(The `cover|exit` check applies to every range in the file. Task 4 and Task 5 use `contain`, which the regex allows.)

Append to `tests/chapters.test.tsx`, inside the per-language loop of chapters 04 to 07:

```tsx
it(`${lang}: cada tarjeta de open source lleva su trazo decorativo y su índice`, () => {
  const os = renderToStaticMarkup(<OpenSource lang={lang} />);
  expect(os.match(/data-layer="trace"[^>]*aria-hidden="true"|aria-hidden="true"[^>]*data-layer="trace"/g)).toHaveLength(3);
  expect(os).toMatch(/--i:0/);
  expect(os).toMatch(/pathLength="1"/);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/motion-css.test.ts tests/chapters.test.tsx`
Expected: FAIL (no rules, no trace layer).

- [ ] **Step 3: Implement**

```tsx
// src/components/motion/BuildTrace.tsx
/** El trazo del «plano» de una tarjeta. Decorativo; el CSS lo dibuja al entrar (motion.css). */
export function BuildTrace() {
  return (
    <svg data-layer="trace" aria-hidden="true" focusable="false" className="pointer-events-none absolute inset-0 -z-30 h-full w-full overflow-visible">
      <rect width="100%" height="100%" rx="14" pathLength="1" fill="none" stroke="var(--light-1)" strokeOpacity="0.55" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeDasharray="1" strokeDashoffset="0" />
    </svg>
  );
}
```

`rx="14"` matches `--radius: 14px`. In the SSR the stroke is fully drawn (`strokeDashoffset="0"`), so without motion the card has its edge. In `OpenSource.tsx`, render `<BuildTrace />` as the first child of each `li[data-motion="build"]` and add `style={{ "--i": i } as React.CSSProperties}`.

Inside the gate block of `motion.css`:

```css
:root[data-motion-state="on"] h2[data-motion="text-reveal"] {
  animation: mo-rise linear both;
  animation-timing-function: var(--mo-ease);
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}

:root[data-motion-state="on"] [data-motion="build"] {
  view-timeline: --build block;
}
:root[data-motion-state="on"] [data-motion="build"] > [data-layer="trace"] rect {
  animation: mo-trace linear both;
  animation-timeline: --build;
  animation-range: entry calc(var(--i, 0) * var(--mo-stagger)) entry calc(45% + var(--i, 0) * var(--mo-stagger));
}
:root[data-motion-state="on"] [data-motion="build"] > [data-layer="outline"] {
  animation: mo-deco-fade linear both;
  animation-timeline: --build;
  animation-range: entry calc(35% + var(--i, 0) * var(--mo-stagger)) entry calc(55% + var(--i, 0) * var(--mo-stagger));
}
:root[data-motion-state="on"] [data-motion="build"] > [data-layer="fill"] {
  animation: mo-fill linear both;
  animation-timing-function: var(--mo-ease);
  animation-timeline: --build;
  animation-range: entry calc(40% + var(--i, 0) * var(--mo-stagger)) entry calc(70% + var(--i, 0) * var(--mo-stagger));
}
:root[data-motion-state="on"] [data-motion="build"] > [data-layer="content"] {
  animation: mo-content linear both;
  animation-timing-function: var(--mo-ease);
  animation-timeline: --build;
  animation-range: entry calc(55% + var(--i, 0) * var(--mo-stagger)) entry 100%;
}
```

Outside the gate (keyframes are inert until something uses them):

```css
@keyframes mo-rise {
  from { clip-path: inset(-0.25em -0.25em 100% -0.25em); translate: 0 0.4em; }
  to { clip-path: inset(-0.25em); translate: 0 0; }
}
@keyframes mo-trace {
  from { stroke-dashoffset: 1; }
  to { stroke-dashoffset: 0; }
}
@keyframes mo-deco-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes mo-fill {
  from { clip-path: inset(100% 0 0 0 round var(--radius)); }
  to { clip-path: inset(0 round var(--radius)); }
}
@keyframes mo-content {
  from { clip-path: inset(0 0 100% 0); translate: 0 var(--mo-rise); }
  to { clip-path: inset(-2rem); translate: 0 0; }
}
```

Note on `mo-deco-fade`: the `tests/motion-css.test.ts` rule exempts only `mo-deco-*` from the opacity ban, and the outline div already has `aria-hidden="true"`.

`e2e/motion-build.spec.ts`:

```ts
import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures";
import { scrollToProgress, settledInViewport } from "./motion-utils";

test.describe("titulares y open source", () => {
  test("a mitad de la entrada la tarjeta está a medio construir y sin violaciones de axe", async ({ page }) => {
    await page.goto("/");
    await scrollToProgress(page, "#open-source ul", 0.85);
    const progress = await page.locator('#open-source [data-layer="content"]').first().evaluate((el) => el.getAnimations()[0]?.effect?.getComputedTiming().progress ?? null);
    expect(progress).not.toBeNull();
    const r = await new AxeBuilder({ page }).include("#open-source").withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(r.violations.map((v) => `${v.id} ${v.nodes[0]?.target}`)).toEqual([]);
  });

  test("entera en pantalla, la tarjeta está terminada", async ({ page }) => {
    await page.goto("/");
    await scrollToProgress(page, "#open-source ul", 0.15);
    expect(await settledInViewport(page)).toEqual([]);
  });

  test("Review Focus 1: al final del documento todo lo visible está terminado", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    expect(await settledInViewport(page)).toEqual([]);
  });

  test("el h1 del hero no tiene animación", async ({ page }) => {
    await page.goto("/");
    expect(await page.locator("h1").evaluate((el) => el.getAnimations().length)).toBe(0);
  });
});
```

- [ ] **Step 4: Run tests, build, budget and look at it**

Run: `npx vitest run && npm run build && npm run budget && npx playwright test e2e/motion-build.spec.ts`
Expected: PASS on every project. Then open `/` and `/en` with `npm run start` at 1280 and 375 px, scroll slowly through `#open-source` and save a screenshot at the start, middle and end of a card's build to `../.superpowers/verify/fase-2/task-3/`.

- [ ] **Step 5: Commit**

```bash
git add -A src/motion src/components/motion src/chapters/OpenSource.tsx e2e/motion-build.spec.ts tests
git commit -m "feat(motion): los titulares suben desde su máscara y las tarjetas de open source se construyen en cuatro tiempos"
```

---

### Task 4: Capítulo 02, la bio que se enciende y las cifras que cuentan (TextReveal palabra a palabra, StickyScene, Counter)

**Files:**
- Create: `src/components/motion/WordReveal.tsx`, `src/motion/math.ts`, `src/motion/primitives/counter.ts`, `e2e/motion-about.spec.ts`
- Modify: `src/chapters/About.tsx`, `src/motion/runtime.ts` (registra `count`), `src/motion/motion.css`
- Test: `tests/motion-math.test.ts`, extend `tests/chapters.test.tsx` and `tests/motion-css.test.ts`

**Interfaces:**
- Consumes: `Primitive`, `REGISTRY` (Task 2)
- Produces:
  - `wordSpans(text: string): { word: string; space: boolean }[]` (pure; keeps every character of the text, so the visible text is identical)
  - `<WordReveal text={string} />`: server component that renders `<span data-w style="--i:k">word</span>` per word, with the spaces as plain text between spans, and sets `--n` on its parent through the `style` it returns via `wordRevealStyle(text)`
  - `countAt(t: number, target: number): number` (ease-out expo; `t ≤ 0` → 0, `t ≥ 1` → `target`, integer, monotonic)
  - `counter: Primitive`, registered as `count`
  - `COUNT_MS = 1400`

The effect:
- **The lead paragraph lights up word by word** while you scroll: each word goes from `--text-2` to `--text` (both AA; the initial state is readable text, not hidden text). From `lg` the paragraph is already sticky (`lg:sticky` in About), so it stays put while the column to its right scrolls and the words light up in order: that is the StickyScene. Below `lg` it uses the paragraph's own view timeline.
- **The figures count** from 0 to their value once, when the figure row is 60% visible. A figure that's already on screen when the runtime arrives is not touched.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/motion-math.test.ts
import { describe, expect, it } from "vitest";
import { countAt, wordSpans } from "@/motion/math";

describe("countAt", () => {
  it("empieza en 0 y acaba exactamente en el valor", () => {
    expect(countAt(0, 13)).toBe(0);
    expect(countAt(-1, 13)).toBe(0);
    expect(countAt(1, 13)).toBe(13);
    expect(countAt(5, 13)).toBe(13);
  });
  it("es monótono y entero", () => {
    let prev = 0;
    for (let t = 0; t <= 1; t += 0.01) {
      const v = countAt(t, 21);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });
});

describe("wordSpans", () => {
  it("conserva el texto exacto, espacios incluidos", () => {
    const text = "Construyo producto.  Llevo la IA\na producción.";
    expect(wordSpans(text).map((s) => s.word).join("")).toBe(text);
  });
  it("las palabras no llevan espacios dentro", () => {
    for (const s of wordSpans("a  b c")) if (!s.space) expect(s.word).not.toMatch(/\s/);
  });
});
```

Append to `tests/chapters.test.tsx` (per language):

```tsx
it(`${lang}: la bio se divide en palabras sin cambiar su texto`, () => {
  const html = renderToStaticMarkup(<About lang={lang} />);
  const lead = /<p[^>]*data-motion="word-reveal"[^>]*>([\s\S]*?)<\/p>/.exec(html)![1]!;
  const text = lead.replace(/<[^>]+>/g, "");
  const [expected] = t(about.description, lang).split(/\n+/).map((p) => p.trim()).filter(Boolean);
  expect(text).toBe(expected);
  expect(lead).toMatch(/data-w/);
});
it(`${lang}: cada cifra tiene su número visible y su número para lectores de pantalla`, () => {
  const html = renderToStaticMarkup(<About lang={lang} />);
  for (const m of html.matchAll(/<dd[^>]*data-value="(\d+)"[^>]*>([\s\S]*?)<\/dd>/g)) {
    expect(m[2]).toMatch(new RegExp(`<span aria-hidden="true" data-count="">${m[1]}</span>`));
    expect(m[2]).toMatch(new RegExp(`<span class="sr-only">${m[1]}</span>`));
  }
});
```

(`about` comes from `@/app/content` and `t` from `@/lib/content/localized`; import them at the top of the file if they aren't already. HTML entities: if the bio contains `&`, compare after replacing `&amp;` with `&`.)

Append to `tests/motion-css.test.ts`:

```ts
it("la bio cambia de color entre tokens AA y nada más", () => {
  const light = keyframes.find((k) => k.name === "mo-light")!;
  expect(light.body).toMatch(/color:\s*var\(--text-2\)/);
  expect(light.body).toMatch(/color:\s*var\(--text\)/);
  expect(light.body.replace(/color:[^;]+;/g, "").trim()).toMatch(/^(from|to|\{|\}|\s)*$/);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/motion-math.test.ts tests/chapters.test.tsx tests/motion-css.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
// src/motion/math.ts
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/** Ease-out expo: arranca rápido y se posa. Entero, monótono y exacto en los extremos. */
export function countAt(t: number, target: number): number {
  if (t >= 1) return target;
  if (t <= 0) return 0;
  return Math.min(target, Math.floor(target * (1 - 2 ** (-10 * clamp01(t)))));
}

/** Parte un texto en palabras y huecos sin perder ni un carácter. */
export function wordSpans(text: string): { word: string; space: boolean }[] {
  return (text.match(/\s+|[^\s]+/g) ?? []).map((w) => ({ word: w, space: /^\s+$/.test(w) }));
}
```

```tsx
// src/components/motion/WordReveal.tsx
import type { CSSProperties } from "react";
import { wordSpans } from "@/motion/math";

/** Número de palabras, para el `--n` del párrafo que las contiene. */
export function wordRevealStyle(text: string): CSSProperties {
  return { "--n": wordSpans(text).filter((s) => !s.space).length } as CSSProperties;
}

/** TextReveal palabra a palabra. En el servidor ya es el texto final; el CSS solo cambia el color. */
export function WordReveal({ text }: { text: string }) {
  let i = 0;
  return (
    <>
      {wordSpans(text).map((s, k) =>
        s.space ? (
          s.word
        ) : (
          <span key={k} data-w="" style={{ "--i": i++ } as CSSProperties}>
            {s.word}
          </span>
        ),
      )}
    </>
  );
}
```

In `About.tsx`:
- the lead `<p>` changes `data-motion="text-reveal"` to `data-motion="word-reveal"`, gains `style={wordRevealStyle(lead)}` and renders `<WordReveal text={lead} />`;
- the grid `div` that holds the lead and the rest gains `data-reveal-scope=""`;
- each `<dd data-motion="count" data-value={it.n}>` renders `<span aria-hidden="true" data-count="" className="inline-block tabular-nums" style={{ minWidth: `${String(it.n).length}ch` }}>{it.n}</span><span className="sr-only">{it.n}</span>`. The fixed `min-width` in `ch` and `tabular-nums` keep the width constant while counting, so nothing shifts.

```ts
// src/motion/primitives/counter.ts
import type { Primitive } from "../types";
import { countAt } from "../math";

export const COUNT_MS = 1400;

/** Counter. Solo se arma si la cifra aún no se ve: lo que ya está en pantalla se queda con su número. */
export const counter: Primitive = (el) => {
  const visual = el.querySelector<HTMLElement>("[data-count]");
  const target = Number(el.dataset.value);
  if (!visual || !Number.isFinite(target)) return;
  if (el.getBoundingClientRect().top < innerHeight) return;
  const final = String(target);
  visual.textContent = "0";
  let raf = 0;
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (now: number) => {
        const v = countAt((now - t0) / COUNT_MS, target);
        visual.textContent = String(v);
        if (v !== target) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    },
    { threshold: 0.6 },
  );
  io.observe(el);
  return () => {
    io.disconnect();
    cancelAnimationFrame(raf);
    visual.textContent = final;
  };
};
```

Register it: `export const REGISTRY: Record<string, Primitive> = { count: counter };`.

Inside the gate block of `motion.css`:

```css
:root[data-motion-state="on"] [data-motion="word-reveal"] {
  view-timeline: --reveal block;
}
:root[data-motion-state="on"] [data-motion="word-reveal"] [data-w] {
  animation: mo-light linear both;
  animation-timeline: --reveal;
  animation-range: contain calc(var(--i) / var(--n) * 60%) contain calc((var(--i) + 1) / var(--n) * 60%);
}
@media (min-width: 64rem) {
  /* Desde lg el párrafo es sticky: su propia posición no cambia, así que manda la rejilla que lo contiene. */
  :root[data-motion-state="on"] [data-reveal-scope] {
    view-timeline: --reveal block;
  }
  :root[data-motion-state="on"] [data-motion="word-reveal"] {
    view-timeline: none;
  }
}
```

Outside the gate:

```css
@keyframes mo-light {
  from { color: var(--text-2); }
  to { color: var(--text); }
}
```

Below `lg` the paragraph's own `contain` range is the time it is fully inside the viewport, so lighting completes by the time it has travelled 60% of the way up.

`e2e/motion-about.spec.ts`:

```ts
import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures";
import { scrollToProgress } from "./motion-utils";

test.describe("capítulo 02", () => {
  test("a mitad, unas palabras encendidas y otras no, todas AA", async ({ page }) => {
    await page.goto("/");
    await scrollToProgress(page, '[data-motion="word-reveal"]', 0.55);
    const colors = await page.locator('[data-motion="word-reveal"] [data-w]').evaluateAll((els) => new Set(els.map((e) => getComputedStyle(e).color)).size);
    expect(colors).toBeGreaterThan(1);
    const r = await new AxeBuilder({ page }).include("#about").withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(r.violations.map((v) => `${v.id} ${v.nodes[0]?.target}`)).toEqual([]);
  });

  test("las cifras cuentan y acaban en su valor", async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(() => (window as { __MOTION_STARTS__?: number }).__MOTION_STARTS__ === 1);
    const first = page.locator('#about dd[data-motion="count"]').first();
    const value = await first.getAttribute("data-value");
    await expect(first.locator("[data-count]")).toHaveText("0");
    await first.scrollIntoViewIfNeeded();
    await expect(first.locator("[data-count]")).toHaveText(value!, { timeout: 4000 });
  });

  test("Review Focus 2: con reducido a mitad de la cuenta, el número real al instante", async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(() => (window as { __MOTION_STARTS__?: number }).__MOTION_STARTS__ === 1);
    const first = page.locator('#about dd[data-motion="count"]').first();
    const value = await first.getAttribute("data-value");
    await first.scrollIntoViewIfNeeded();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(first.locator("[data-count]")).toHaveText(value!);
  });

  test("una cifra ya visible al llegar el runtime no se toca", async ({ page }) => {
    await page.goto("/#about");
    const first = page.locator('#about dd[data-motion="count"]').first();
    await first.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => (window as { __MOTION_STARTS__?: number }).__MOTION_STARTS__ === 1);
    await expect(first.locator("[data-count]")).toHaveText((await first.getAttribute("data-value"))!);
  });
});
```

On the `small` and `landscape` projects the figure row may already be in the viewport at load for some heights; if the `cuentan` test fails there only because the row starts visible, skip that one test for projects whose viewport height ≥ the row's top, with a `test.skip(condition, reason)` that computes it, never a blanket skip.

- [ ] **Step 4: Run tests, build, budget and look at it**

Run: `npx vitest run && npm run build && npm run budget && npx playwright test e2e/motion-about.spec.ts`
Expected: PASS. Runtime chunk still ≤ 6 KB. Screenshots of `#about` at 1280 and 375 px with the bio half lit to `../.superpowers/verify/fase-2/task-4/`.

- [ ] **Step 5: Commit**

```bash
git add -A src/motion src/components/motion src/chapters/About.tsx e2e/motion-about.spec.ts tests
git commit -m "feat(motion): la bio se enciende palabra a palabra con la sección fijada y las cifras cuentan desde cero"
```

---

### Task 5: Capítulo 04, la experiencia que se desliza en horizontal (StickyScene de la línea de tiempo)

Riesgo alto aunque no sea núcleo: cambia el alto de una sección y fija una escena. Recomendado revisarla con el mismo cuidado que una de núcleo.

**Files:**
- Create: `e2e/motion-experience.spec.ts`
- Modify: `src/chapters/Experience.tsx`, `src/motion/motion.css`
- Test: extend `tests/chapters.test.tsx`, `tests/motion-css.test.ts`

**Interfaces:**
- Consumes: the gate block (Task 2), `scrollToProgress`, `layoutShiftDuring` (Task 2)
- Produces: markup contract `section#experience[data-pin][style="--n:N"] > div[data-pin-stage] > … ol[data-motion="timeline"]`, plus `div[data-pin-progress][aria-hidden="true"]`; keyframes `mo-pin` and `mo-deco-progress`. **No JS**: the whole pin is CSS, sized from the number of cards, so its height is right from the first paint and there is no layout shift when the runtime arrives.

The effect, only with `(min-width: 64rem) and (min-height: 37.5rem)`:
- the section grows to `calc(100svh + var(--n) * 23.5rem)`;
- `[data-pin-stage]` sticks under the nav (`position: sticky; top: calc(4rem + var(--safe-top)); height: calc(100svh - 4rem - var(--safe-top)); overflow: clip`), with the heading and the track inside;
- the track becomes `overflow: visible; width: max-content; scroll-snap-type: none` and slides with `translate: 0 0` → `translate: calc(-100% + 100cqw) 0` over the section's `contain` range. The track's wrapper (the second `Container`) is `container-type: inline-size`, so `100cqw` is the width the cards have to fit in;
- a thin progress line under the track (`[data-pin-progress]`, decorative) grows with `scale: 0 1` → `scale: 1 1` on the same timeline;
- the per-card entrance (`[data-motion="card"]`, used below `lg` in Task 6's list) is switched off here, because inside a sticky stage its own view progress would freeze half way.

Below that query nothing changes: vertical list under `md`, horizontally scrollable row with snap from `md` (phase 1).

Keyboard: in the pinned state the `ol` stays `tabIndex={0}`; it no longer scrolls on its own, so the arrow keys scroll the page, which drives the slide. The cards have no links, so there is nothing to focus out of view. Keep the `aria-labelledby`.

- [ ] **Step 1: Write the failing tests**

Append to `tests/chapters.test.tsx` (per language):

```tsx
it(`${lang}: la experiencia lleva su escena fijable con el número de tarjetas`, () => {
  const html = renderToStaticMarkup(<Experience lang={lang} />);
  const n = getExperience(lang).length;
  expect(html).toMatch(new RegExp(`<section[^>]*id="experience"[^>]*data-pin=""[^>]*style="--n:${n}"|<section[^>]*data-pin=""[^>]*id="experience"`));
  expect(html).toMatch(/data-pin-stage/);
  expect(html).toMatch(/data-pin-progress=""[^>]*aria-hidden="true"|aria-hidden="true"[^>]*data-pin-progress/);
});
```

Append to `tests/motion-css.test.ts`:

```ts
it("la escena fijada solo existe en pantallas anchas y altas", () => {
  const block = /@media \(min-width: 64rem\) and \(min-height: 37\.5rem\)\s*\{([\s\S]*?)\n    \}/.exec(css)?.[1] ?? "";
  expect(block).toMatch(/\[data-pin-stage\]/);
  expect(block).toMatch(/position:\s*sticky/);
  expect(block).toMatch(/overflow:\s*clip/);
  expect(css).not.toMatch(/\[data-pin-stage\][^{]*\{[^}]*overflow:\s*hidden/);
});
```

(Adjust the closing-brace indentation in the regex to the file's real indentation; the point is that the sticky rules live only inside that media query, and that the stage uses `clip`, never `hidden`, which would turn it into a scroll container.)

- [ ] **Step 2: Run to verify failure.** `npx vitest run tests/chapters.test.tsx tests/motion-css.test.ts` → FAIL.

- [ ] **Step 3: Implement**

`Experience.tsx`:
- `<Section id="experience" …>` must accept the new attributes. Add optional `data` passthrough to `Section` (`dataAttrs?: Record<\`data-${string}\`, string>` spread on the `<section>`) and a `style` prop; pass `dataAttrs={{ "data-pin": "" }}` and `style={{ "--n": entries.length } as CSSProperties}`.
- Wrap both `Container`s in `<div data-pin-stage="" className="flex flex-col justify-center">`.
- Add `className="[container-type:inline-size]"` to the second `Container`, and after the `ol`, `<div data-pin-progress="" aria-hidden="true" className="mt-6 hidden h-px origin-left bg-[color:var(--light-1)]" />`. It is `hidden` statically; the pinned CSS shows it.

Inside the gate block of `motion.css`:

```css
@media (min-width: 64rem) and (min-height: 37.5rem) {
  :root[data-motion-state="on"] [data-pin] {
    height: calc(100svh + var(--n, 6) * 23.5rem);
    view-timeline: --pin block;
  }
  :root[data-motion-state="on"] [data-pin-stage] {
    position: sticky;
    top: calc(4rem + var(--safe-top, 0px));
    height: calc(100svh - 4rem - var(--safe-top, 0px));
    overflow: clip;
  }
  :root[data-motion-state="on"] [data-pin] [data-motion="timeline"] {
    overflow: visible;
    width: max-content;
    scroll-snap-type: none;
    animation: mo-pin linear both;
    animation-timeline: --pin;
    animation-range: contain 0% contain 100%;
  }
  :root[data-motion-state="on"] [data-pin] [data-motion="card"] {
    animation: none;
  }
  :root[data-motion-state="on"] [data-pin-progress] {
    display: block;
    animation: mo-deco-progress linear both;
    animation-timeline: --pin;
    animation-range: contain 0% contain 100%;
  }
}
```

Outside the gate:

```css
@keyframes mo-pin {
  from { translate: 0 0; }
  to { translate: calc(-100% + 100cqw) 0; }
}
@keyframes mo-deco-progress {
  from { scale: 0 1; }
  to { scale: 1 1; }
}
```

The `md:` classes on the `ol` (`md:overflow-x-auto`, `md:snap-x`, `md:snap-mandatory`) still apply below `lg` and are overridden inside the query by the higher-specificity rule above. Check in DevTools that the pinned `ol` reports `overflow: visible`.

If the section's own `py-[var(--space-section)]` padding makes the stage start too low, move that padding inside the stage for the pinned state only (inside the same media query), never by changing the static layout.

`e2e/motion-experience.spec.ts`:

```ts
import { test, expect } from "./fixtures";
import { layoutShiftDuring, scrollToProgress } from "./motion-utils";

const noPageOverflow = (page: import("@playwright/test").Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);

test.describe("capítulo 04 fijado", () => {
  test.skip(({ viewport }) => !viewport || viewport.width < 1024 || viewport.height < 600, "solo en pantallas anchas y altas");

  test("bajar desliza la pista y nunca desborda la página", async ({ page }) => {
    await page.goto("/");
    const track = page.locator('#experience [data-motion="timeline"]');
    await scrollToProgress(page, "#experience", 0);
    const x0 = await track.evaluate((el) => el.getBoundingClientRect().left);
    await page.evaluate(() => {
      const s = document.querySelector("#experience")!;
      scrollTo({ top: s.getBoundingClientRect().top + scrollY + (s as HTMLElement).offsetHeight / 2, behavior: "instant" });
    });
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const x1 = await track.evaluate((el) => el.getBoundingClientRect().left);
    expect(x1).toBeLessThan(x0 - 100);
    expect(await noPageOverflow(page)).toBe(true);
  });

  test("al final del recorrido la última tarjeta está entera en pantalla", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      const s = document.querySelector<HTMLElement>("#experience")!;
      scrollTo({ top: s.getBoundingClientRect().top + scrollY + s.offsetHeight - innerHeight, behavior: "instant" });
    });
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const last = page.locator('#experience [data-motion="card"]').last();
    const box = (await last.boundingBox())!;
    const vw = page.viewportSize()!.width;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(vw);
  });

  test("sin desplazamientos de layout al recorrer la escena", async ({ page }) => {
    await page.goto("/");
    const cls = await layoutShiftDuring(page, async () => {
      for (let i = 0; i < 20; i++) await page.mouse.wheel(0, 400);
    });
    expect(cls).toBeLessThan(0.05);
  });

  test("Review Focus 3: cruzar a apaisado a mitad devuelve la lista estática sin desbordes", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      const s = document.querySelector<HTMLElement>("#experience")!;
      scrollTo({ top: s.getBoundingClientRect().top + scrollY + s.offsetHeight / 2, behavior: "instant" });
    });
    for (const size of [{ width: 844, height: 390 }, { width: 1024, height: 560 }]) {
      await page.setViewportSize(size);
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      expect(await noPageOverflow(page)).toBe(true);
      const stage = await page.locator("[data-pin-stage]").evaluate((el) => getComputedStyle(el).position);
      expect(stage).not.toBe("sticky");
      const h = await page.locator("#experience").evaluate((el) => el.getBoundingClientRect().height);
      expect(h).toBeLessThan(size.height * 4);
    }
  });

  test("con movimiento reducido no hay escena fijada", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    expect(await page.locator("[data-pin-stage]").evaluate((el) => getComputedStyle(el).position)).not.toBe("sticky");
  });
});
```

(`h < size.height * 4` is a coarse check that the section is back to its static height; tune the factor to the static height you measure at that size, and write the measured value in a comment.)

- [ ] **Step 4: Run tests, build, budget and look at it**

Run: `npx vitest run && npm run build && npm run budget && npx playwright test e2e/motion-experience.spec.ts e2e/responsive.spec.ts`
Expected: PASS, including the existing responsive suite. Then a real pass at 1280×800, 1440×900, 1920×1080, 1024×768 and 844×390: scroll through `#experience` and save start, middle and end screenshots to `../.superpowers/verify/fase-2/task-5/`. Also tab into the track and use the arrow keys: the page scrolls and the track slides.

- [ ] **Step 5: Commit**

```bash
git add -A src/chapters/Experience.tsx src/components/ui/Section.tsx src/motion e2e/motion-experience.spec.ts tests
git commit -m "feat(motion): la experiencia se fija y se desliza en horizontal al bajar, solo en pantallas anchas y altas y sin JS"
```

---

### Task 6: Capítulos 08 y 09, insignias que se ensamblan, citas en secuencia y contacto magnético (Magnetic)

**Files:**
- Create: `src/motion/primitives/magnetic.ts`, `e2e/motion-proof-contact.spec.ts`
- Modify: `src/chapters/Proof.tsx` (`style={{ "--i": i % 3 }}` en cada insignia), `src/chapters/Contact.tsx` (`data-motion="intent"` y `--i` en las tres tarjetas, `data-motion="magnetic"` en el enlace del correo), `src/motion/math.ts` (`magneticOffset`), `src/motion/runtime.ts` (registra `intent` y `magnetic`), `src/motion/motion.css`
- Test: extend `tests/motion-math.test.ts`, `tests/motion-css.test.ts`, `tests/chapters.test.tsx`

**Interfaces:**
- Consumes: `Primitive`, `REGISTRY`, gate block, e2e utils (Task 2)
- Produces:
  - `magneticOffset(dx: number, dy: number, max?: number): { x: number; y: number }` (pull 0,25 of the distance, each axis clamped to `±max`, default 8 px, rounded to 0,1 px)
  - `magnetic: Primitive`, registered as both `magnetic` and `intent`
  - keyframes `mo-badge`, `mo-quote`, `mo-card`

The effect:
- **Badges** (`[data-motion="badge"]`) assemble into the wall: `translate: 0 var(--mo-rise)` → `0 0`, `scale: 0.96` → `1`, and `clip-path: inset(0 0 100% 0 round var(--radius))` → `inset(-0.5rem round var(--radius))`, staggered by column (`--i` = index mod 3), range `entry calc(var(--i) * var(--mo-stagger)) entry calc(70% + var(--i) * var(--mo-stagger))`.
- **Quotes** (`[data-motion="quote"]`) arrive one after another as you reach them: `translate: 0 2rem` → `0 0` only, range `entry 0% entry 40%`. No clip: a quote can be taller than a phone screen, and its text must never be cut.
- **Experience cards below `lg`** (`[data-motion="card"]`) use the same `mo-card` entrance as the contact cards (Task 5 already disables it inside the pinned scene).
- **Contact intent cards** (`[data-motion="intent"]`) rise in a stagger (`mo-card`: `translate` + `clip-path`, `--i` 0 to 2) and are **magnetic**: with a fine pointer they lean up to 8 px towards the cursor and settle back on leave. The `<a>` inside stays a normal link and its hit area moves with the card. The email link is magnetic too.

CSS for the magnet (inside the gate, and also inside `@media (hover: hover) and (pointer: fine)`):

```css
:root[data-motion-state="on"] [data-motion="intent"],
:root[data-motion-state="on"] [data-motion="magnetic"] {
  transform: translate3d(var(--mx, 0px), var(--my, 0px), 0);
  transition: transform 0.45s var(--mo-ease-out);
}
```

- [ ] **Step 1: Write the failing tests**

Append to `tests/motion-math.test.ts`:

```ts
import { magneticOffset } from "@/motion/math";

describe("magneticOffset", () => {
  it("en el centro no se mueve", () => expect(magneticOffset(0, 0)).toEqual({ x: 0, y: 0 }));
  it("tira hacia el cursor y conserva el signo", () => {
    expect(magneticOffset(20, -12)).toEqual({ x: 5, y: -3 });
  });
  it("nunca pasa del máximo", () => {
    const o = magneticOffset(900, -900);
    expect(o).toEqual({ x: 8, y: -8 });
    expect(magneticOffset(900, 0, 4).x).toBe(4);
  });
});
```

Append to `tests/motion-css.test.ts`:

```ts
it("las citas no se recortan nunca", () => {
  const quote = keyframes.find((k) => k.name === "mo-quote")!;
  expect(quote.body).not.toMatch(/clip-path/);
});
it("el imán solo con puntero fino", () => {
  const i = css.indexOf('[data-motion="intent"]');
  expect(css.lastIndexOf("@media (hover: hover) and (pointer: fine)", i)).toBeGreaterThan(-1);
});
```

Append to `tests/chapters.test.tsx` (per language):

```tsx
it(`${lang}: las intenciones son magnéticas y siguen siendo enlaces mailto`, () => {
  const html = renderToStaticMarkup(<Contact lang={lang} />);
  expect(html.match(/data-motion="intent"/g)).toHaveLength(3);
  for (const intent of ["freelance", "job", "other"] as const) expect(html).toContain(`href="${contactMailto(intent, lang).replace(/&/g, "&amp;")}"`);
  expect(html).toMatch(/data-motion="magnetic"[^>]*href="mailto:|href="mailto:[^"]*"[^>]*data-motion="magnetic"/);
});
```

(Import `contactMailto` from `@/lib/contact/mailto` if the file doesn't already.)

- [ ] **Step 2: Run to verify failure.** `npx vitest run tests/motion-math.test.ts tests/motion-css.test.ts tests/chapters.test.tsx` → FAIL.

- [ ] **Step 3: Implement**

```ts
// add to src/motion/math.ts
const round1 = (v: number) => Math.round(v * 10) / 10;

/** Cuánto se inclina un elemento magnético hacia el cursor, en px, por eje. */
export function magneticOffset(dx: number, dy: number, max = 8): { x: number; y: number } {
  const pull = (d: number) => round1(Math.max(-max, Math.min(max, d * 0.25))) || 0;
  return { x: pull(dx), y: pull(dy) };
}
```

```ts
// src/motion/primitives/magnetic.ts
import type { Primitive } from "../types";
import { magneticOffset } from "../math";

/** Magnetic. Solo con puntero fino; el elemento sigue siendo un <a> o <button> normal. */
export const magnetic: Primitive = (el) => {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  let raf = 0;
  const set = (x: number, y: number) => {
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
  };
  const move = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    const o = magneticOffset(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => set(o.x, o.y));
  };
  const leave = () => {
    cancelAnimationFrame(raf);
    set(0, 0);
  };
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerleave", leave);
  return () => {
    el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerleave", leave);
    cancelAnimationFrame(raf);
    el.style.removeProperty("--mx");
    el.style.removeProperty("--my");
  };
};
```

Registry: `{ count: counter, intent: magnetic, magnetic }`.

In `Contact.tsx`, each intent `li` gains `data-motion="intent"` and `style={{ "--i": index } as CSSProperties}`; the email `<a>` gains `data-motion="magnetic"`. In `Proof.tsx`, each badge `li` gains `style={{ "--i": index % 3 } as CSSProperties}` (use the map index).

Inside the gate block:

```css
:root[data-motion-state="on"] [data-motion="badge"] {
  animation: mo-badge linear both;
  animation-timing-function: var(--mo-ease);
  animation-timeline: view();
  animation-range: entry calc(var(--i, 0) * var(--mo-stagger)) entry calc(70% + var(--i, 0) * var(--mo-stagger));
}
:root[data-motion-state="on"] [data-motion="quote"] {
  animation: mo-quote linear both;
  animation-timing-function: var(--mo-ease);
  animation-timeline: view();
  animation-range: entry 0% entry 40%;
}
:root[data-motion-state="on"] [data-motion="card"],
:root[data-motion-state="on"] [data-motion="intent"] {
  animation: mo-card linear both;
  animation-timing-function: var(--mo-ease);
  animation-timeline: view();
  animation-range: entry calc(var(--i, 0) * var(--mo-stagger)) entry calc(70% + var(--i, 0) * var(--mo-stagger));
}
@media (hover: hover) and (pointer: fine) {
  :root[data-motion-state="on"] [data-motion="intent"],
  :root[data-motion-state="on"] [data-motion="magnetic"] {
    transform: translate3d(var(--mx, 0px), var(--my, 0px), 0);
    transition: transform 0.45s var(--mo-ease-out);
  }
}
```

Keep this block **after** the Task 5 block so that `[data-pin] [data-motion="card"] { animation: none }` still wins (it has higher specificity regardless, but keep the order readable).

Outside the gate:

```css
@keyframes mo-badge {
  from { clip-path: inset(0 0 100% 0 round var(--radius)); translate: 0 var(--mo-rise); scale: 0.96; }
  to { clip-path: inset(-0.5rem round var(--radius)); translate: 0 0; scale: 1; }
}
@keyframes mo-quote {
  from { translate: 0 2rem; }
  to { translate: 0 0; }
}
@keyframes mo-card {
  from { clip-path: inset(0 0 100% 0 round var(--radius)); translate: 0 var(--mo-rise); }
  to { clip-path: inset(-0.5rem round var(--radius)); translate: 0 0; }
}
```

The final `inset(-0.5rem)` leaves room for the 2 px focus ring with its 2 px offset. Check it on a focused badge and a focused intent card.

`e2e/motion-proof-contact.spec.ts`:

```ts
import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures";
import { scrollToProgress, settledInViewport } from "./motion-utils";

test.describe("capítulos 08 y 09", () => {
  test("el muro de insignias a medio ensamblar pasa axe", async ({ page }) => {
    await page.goto("/");
    await scrollToProgress(page, '#proof [data-motion="badge"]', 0.9);
    const r = await new AxeBuilder({ page }).include("#proof").withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(r.violations.map((v) => `${v.id} ${v.nodes[0]?.target}`)).toEqual([]);
  });

  test("Review Focus 1: llegar a /#contact lo deja todo terminado", async ({ page }) => {
    await page.goto("/#contact");
    await page.waitForTimeout(300);
    expect(await settledInViewport(page)).toEqual([]);
  });

  test("el imán inclina la tarjeta y vuelve a cero al salir", async ({ page }) => {
    test.skip(page.viewportSize()!.width < 1024, "solo con puntero fino de escritorio");
    await page.goto("/#contact");
    await page.waitForFunction(() => (window as { __MOTION_STARTS__?: number }).__MOTION_STARTS__ === 1);
    const card = page.locator('[data-motion="intent"]').first();
    const box = (await card.boundingBox())!;
    await page.mouse.move(box.x + box.width - 4, box.y + 4);
    await expect.poll(() => card.evaluate((el) => el.style.getPropertyValue("--mx"))).not.toBe("0px");
    await page.mouse.move(0, 0);
    await expect.poll(() => card.evaluate((el) => el.style.getPropertyValue("--mx"))).toBe("0px");
  });

  test("Review Focus 4: un solo oyente por elemento tras ir y volver", async ({ page }) => {
    test.skip(page.viewportSize()!.width < 1024, "solo escritorio");
    await page.goto("/");
    await page.waitForFunction(() => (window as { __MOTION_STARTS__?: number }).__MOTION_STARTS__ === 1);
    await page.locator("footer").getByRole("link", { name: /sobre mí|about/i }).first().click();
    await page.goBack();
    await page.waitForFunction(() => (window as { __MOTION_STARTS__?: number }).__MOTION_STARTS__ === 3);
    const card = page.locator('[data-motion="intent"]').first();
    await card.scrollIntoViewIfNeeded();
    const box = (await card.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2 + 40, box.y + box.height / 2);
    await expect.poll(() => card.evaluate((el) => el.style.getPropertyValue("--mx"))).toBe("8px");
  });

  test("con el teclado la tarjeta es un enlace normal con foco visible", async ({ page }) => {
    await page.goto("/#contact");
    const link = page.locator('[data-motion="intent"] a').first();
    await link.focus();
    await expect(link).toBeFocused();
    expect(await link.getAttribute("href")).toMatch(/^mailto:/);
  });
});
```

(The «8px» check relies on 40 px of distance × 0,25 = 10, clamped to 8. If two listeners were attached, the value would still be 8, so the test also asserts `__MOTION_STARTS__ === 3`, which together with Task 2's pairing of `start` and `stop` proves there is one live set of listeners.)

- [ ] **Step 4: Run tests, build, budget and look at it**

Run: `npx vitest run && npm run build && npm run budget && npx playwright test e2e/motion-proof-contact.spec.ts`
Expected: PASS, runtime ≤ 6 KB. Screenshots of `#proof` mid-assembly and `#contact` with a magnetised card to `../.superpowers/verify/fase-2/task-6/`.

- [ ] **Step 5: Commit**

```bash
git add -A src/motion src/chapters/Proof.tsx src/chapters/Contact.tsx e2e/motion-proof-contact.spec.ts tests
git commit -m "feat(motion): el muro de insignias se ensambla, las citas llegan en secuencia y el contacto es magnético"
```

---

### Task 7: Transiciones de página (PageTransition)

**Files:**
- Create: `e2e/motion-transitions.spec.ts`
- Modify: `src/motion/motion.css`, `src/components/Nav.tsx` (`view-transition-name: site-nav` por clase), `src/app/[lang]/layout.tsx` (`<ViewTransition>` alrededor de `{children}`), `next.config.ts` (`experimental.viewTransition: true`)
- Test: extend `tests/motion-css.test.ts`

**Interfaces:**
- Consumes: the gate attribute (Task 2), `npm run budget` (Task 1)
- Produces: nothing other tasks use.

Two paths, both with zero extra JS of our own:
- **Full navigations** (the language switch is a plain `<a>`, the 404 and any `<a>` to the site): the CSS rule `@view-transition { navigation: auto; }`, inside `@media (prefers-reduced-motion: no-preference)`. Chrome and Safari 18.2+ do the cross-fade; other browsers navigate as usual.
- **Client navigations** (`<Link>` in the footer and the static pages): Next 16's `experimental.viewTransition` plus React's `<ViewTransition>` (exported as `ViewTransition` by the React canary that Next 16.2.6 bundles; check `node_modules/next/dist/compiled/react/cjs/react.production.js` exports it before writing code). Add `/// <reference types="react/canary" />` in a `.d.ts` if TypeScript doesn't know the export.

The look, for both: the old page sinks 12 px and fades out in 180 ms; the new one rises 12 px and fades in in 280 ms with `--mo-ease-out`. The nav keeps its own name (`site-nav`), so it stays still while the page under it changes. These pseudo-elements are snapshots, not live text, so the opacity rule doesn't apply to them; axe never sees them.

**Budget gate for this task:** if enabling `experimental.viewTransition` adds more than 3 KB gzip to the initial JS of any route (`npm run budget` before and after), or breaks any existing e2e, revert the React half (flag, wrapper and type reference), keep only the CSS path, and say so in the report.

- [ ] **Step 1: Write the failing test**

Append to `tests/motion-css.test.ts`:

```ts
describe("transiciones de página", () => {
  it("la transición entre documentos solo se declara sin movimiento reducido", () => {
    const at = css.indexOf("@view-transition");
    expect(at).toBeGreaterThan(-1);
    expect(css.lastIndexOf("@media (prefers-reduced-motion: no-preference)", at)).toBeGreaterThan(-1);
  });
  it("con movimiento reducido se anulan las animaciones de la transición", () => {
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*::view-transition-(group|old|new)\(\*\)[\s\S]*animation:\s*none/);
  });
});
```

- [ ] **Step 2: Run to verify failure.** `npx vitest run tests/motion-css.test.ts` → FAIL.

- [ ] **Step 3: Implement**

In `motion.css`, outside `@supports` but inside the `no-preference` media block:

```css
@view-transition {
  navigation: auto;
}
::view-transition-old(root) {
  animation: 180ms ease-in both mo-deco-vt-out;
}
::view-transition-new(root) {
  animation: 280ms var(--mo-ease-out) both mo-deco-vt-in;
}
```

And in the `reduce` block:

```css
::view-transition-group(*),
::view-transition-old(*),
::view-transition-new(*) {
  animation: none !important;
}
```

Keyframes (snapshot animations, so they carry the `mo-deco-` prefix that the opacity test allows):

```css
@keyframes mo-deco-vt-out {
  to { opacity: 0; translate: 0 12px; }
}
@keyframes mo-deco-vt-in {
  from { opacity: 0; translate: 0 -12px; }
}
```

`Nav.tsx`: add the class `[view-transition-name:site-nav]` to the `<header>` or `<nav>` root.

`layout.tsx`:

```tsx
import { ViewTransition } from "react";
// …
<main id="main" className="pt-[calc(4rem+var(--safe-top))]">
  <ViewTransition>{children}</ViewTransition>
</main>
```

`next.config.ts`: `experimental: { viewTransition: true }`, merged with any existing `experimental` key.

`e2e/motion-transitions.spec.ts`:

```ts
import { test, expect } from "./fixtures";

test.describe("transiciones de página", () => {
  test("navegación de cliente al pie y vuelta, sin errores", async ({ page }) => {
    await page.goto("/");
    await page.locator("footer").getByRole("link", { name: /sobre mí|about/i }).first().click();
    await expect(page.locator("h1")).toContainText("Santiago Gómez de la Torre Romero");
    await page.goBack();
    await expect(page.locator("#about")).toBeVisible();
  });

  test("cambio de idioma (navegación completa) con y sin movimiento reducido", async ({ page }) => {
    for (const reducedMotion of ["no-preference", "reduce"] as const) {
      await page.emulateMedia({ reducedMotion });
      await page.goto("/about");
      await page.getByRole("link", { name: "English" }).first().click();
      await expect(page).toHaveURL(/\/en\/about$/);
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
    }
  });

  test("la nav no se mueve durante la transición", async ({ page }) => {
    await page.goto("/");
    const before = (await page.locator("header, nav").first().boundingBox())!;
    await page.locator("footer").getByRole("link", { name: /sobre mí|about/i }).first().click();
    await expect(page).toHaveURL(/\/about$/);
    const after = (await page.locator("header, nav").first().boundingBox())!;
    expect(after.y).toBe(before.y);
  });
});
```

(Use the real label of the language switch from `src/i18n/dictionaries/es.ts`, `nav.switchTo`.)

- [ ] **Step 4: Run tests, build and budget**

Run: `npx vitest run && npm run build && npm run budget && npx playwright test e2e/motion-transitions.spec.ts e2e/routes.spec.ts e2e/lost.spec.ts`
Expected: PASS, including the existing route and 404 suites (the 404 is a full navigation from the proxy and must not break). Quote the budget delta from enabling the flag.

- [ ] **Step 5: Commit**

```bash
git add -A src/motion src/components/Nav.tsx src/app next.config.ts e2e/motion-transitions.spec.ts tests
git commit -m "feat(motion): transiciones de página con View Transitions, la nav quieta y nada con movimiento reducido"
```

---

### Task 8: Verificación transversal del movimiento

Las tareas anteriores prueban cada capítulo por separado. Esta prueba el conjunto: todos los capítulos, todos los anchos, estados intermedios y presupuestos.

**Files:**
- Create: `e2e/motion-sweep.spec.ts`
- Modify: `lighthouserc.json` (añade una ejecución de escritorio de `/` además de la móvil por defecto), `e2e/experience.spec.ts` (el e2e de presupuesto ya incluye el runtime perezoso: añade un comentario que lo diga)

**Interfaces:** none new.

- [ ] **Step 1: Write the sweep**

```ts
// e2e/motion-sweep.spec.ts
import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures";
import { layoutShiftDuring, scrollToProgress, settledInViewport } from "./motion-utils";

const CHAPTERS = ["#about", "#experience", "#open-source", "#proof", "#contact"];
const WIDTHS = [320, 375, 414, 768, 1024, 1280, 1440, 1920];

for (const path of ["/", "/en"]) {
  test.describe(`barrido ${path}`, () => {
    test("axe en estado intermedio de cada capítulo", async ({ page }) => {
      await page.goto(path);
      for (const id of CHAPTERS) {
        await scrollToProgress(page, `${id} h2`, 0.92);
        const r = await new AxeBuilder({ page }).include(id).withTags(["wcag2a", "wcag2aa"]).analyze();
        expect(r.violations.map((v) => `${id} ${v.id} ${v.nodes[0]?.target}`)).toEqual([]);
      }
    });

    test("CLS al recorrer la página entera", async ({ page }) => {
      await page.goto(path);
      const cls = await layoutShiftDuring(page, async () => {
        const h = await page.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y < h; y += 500) await page.mouse.wheel(0, 500);
      });
      expect(cls).toBeLessThan(0.05);
    });

    test("sin scroll horizontal en ningún ancho y en ningún punto del recorrido", async ({ page }) => {
      await page.goto(path);
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 800 });
        for (const id of CHAPTERS) {
          await scrollToProgress(page, id, 0.5);
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px ${id}`).toBe(true);
        }
      }
      await page.setViewportSize({ width: 844, height: 390 });
      for (const id of CHAPTERS) {
        await scrollToProgress(page, id, 0.5);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `844x390 ${id}`).toBe(true);
      }
    });

    test("Review Focus 1: al final del documento todo lo visible está terminado", async ({ page }) => {
      await page.goto(path);
      await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      expect(await settledInViewport(page)).toEqual([]);
    });

    test("movimiento reducido: todo el texto de los capítulos visible y sin animaciones", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      for (const id of CHAPTERS) {
        await page.locator(id).scrollIntoViewIfNeeded();
        expect((await page.locator(id).innerText()).trim().length, id).toBeGreaterThan(20);
      }
      expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    });

    test("ningún long task de más de 50 ms al recorrer la página", async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      await page.evaluate(() => {
        (window as unknown as { __lt: number[] }).__lt = [];
        new PerformanceObserver((l) => l.getEntries().forEach((e) => (window as unknown as { __lt: number[] }).__lt.push(e.duration))).observe({ type: "longtask" });
      });
      for (let i = 0; i < 30; i++) await page.mouse.wheel(0, 400);
      const tasks = await page.evaluate(() => (window as unknown as { __lt: number[] }).__lt);
      expect(tasks.filter((d) => d > 50)).toEqual([]);
    });
  });
}
```

- [ ] **Step 2: Run the sweep and the whole suite**

Run: `npx tsc --noEmit && npm run lint && npx vitest run && npm run e2e && npm run budget`
Expected: everything PASS. If the sweep finds a real defect, fix it in the owning file (chapter or `motion.css`), not in the test, and list each fix in the report with the task it belonged to.

- [ ] **Step 3: Lighthouse**

Add to `lighthouserc.json` a desktop run of `/` (a second `collect` URL with `settings.preset: "desktop"` through an `assertMatrix` entry, or a separate `lighthouserc.desktop.json` run from the `lhci` script). Then run `npm run lhci`. Expected: every error-level assertion passes on mobile and desktop; TBT < 200 ms; CLS ≤ 0,05. Quote the scores.

- [ ] **Step 4: Commit**

```bash
git add -A e2e lighthouserc*.json package.json
git commit -m "test(motion): barrido de axe en estados intermedios, CLS, desbordes en los nueve anchos, long tasks y Lighthouse de escritorio"
```

---

### Task 9: Verificación final de la fase y PR (controlador)

- [ ] Run the full suite: `npx tsc --noEmit && npm run lint && npx vitest run && npm run e2e && npm run budget`. Quote the totals and the budget table.
- [ ] Real browser pass with Playwright MCP against `npm run start` (spec §9), **before** calling the phase done:
  - `/` and `/en` at 1440×900, 1280×800, 375×812, 320×640 and 844×390, scrolling through chapters 02, 04, 06, 08 and 09;
  - for each of those chapters, screenshots of the initial, intermediate and final state at 1280 and 375 px;
  - the same pass with `prefers-reduced-motion: reduce`: everything static and complete;
  - a client navigation (footer to `/about` and back) and a language switch, to see the page transition;
  - the magnetic cards with a mouse and with the keyboard;
  - screenshots to `../.superpowers/verify/fase-2/`.
- [ ] Opus review of the whole branch, tracing interactions between tasks (the shared `motion.css` cascade, `translate` versus `transform`, the pinned scene versus the card entrances, the director versus client navigation). Tasks 1 and 2 are core and get their own opus review at task time; Task 5 is high risk and is recommended for opus too.
- [ ] Only after Santiago's go: push and open the PR against `main`. The body carries the verification evidence and the budget table.

---

## Preguntas abiertas para Santiago

1. **Motion (`motion`) no entra en esta fase.** La spec §4 lo nombra para la coreografía del DOM; el plan consigue el guion con CSS ligado al scroll y ~3 KB de runtime propio, por el presupuesto. ¿De acuerdo con desviarse de la spec en esto?
2. **¿Qué cifra es la real del JS inicial?** Sobre el build que había en `.next/`, el HTML de `/es` suma ≈ 196 KB gzip contando el polyfill `noModule` (≈ 39 KB, no lo descarga ningún navegador moderno) y ≈ 157 KB sin él. La Task 1 lo confirma con el build actual; si los ~190 KB venían de contar el polyfill, el margen real es de unos 13 KB.
3. **Firefox** no tiene aún `animation-timeline` y verá la web estática (completa, sin movimiento). ¿Aceptable, o se quiere un respaldo con JS para Firefox (más peso en el runtime perezoso)?
4. **El hero** (el nombre que se escribe con luz) queda para la fase 3 con el cristal vivo, para no tocar el LCP ahora. ¿Lo quieres en esta fase, aunque sea solo con CSS?
