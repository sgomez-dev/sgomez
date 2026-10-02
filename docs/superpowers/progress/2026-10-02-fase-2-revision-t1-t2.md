# Fase 2: revisión con opus de las tareas 1 y 2, y ronda de arreglos

Veredicto: se aprueba con arreglos. No hay nada crítico, pero todo lo que sigue debe aterrizar antes de la tarea 3.

## Importante

1. **Motor más pequeño y carga por primitiva** (`src/motion/engine.ts:14`, `runtime.ts:4`).
   - Cambiar a `animate` de `motion/mini` más `inView`, `stagger`, `spring` y `scroll` de `motion`. Ronda los 8,8 KB, frente a los 22,5 actuales.
   - Quitar `export * as engine`, que impide el tree-shaking.
   - Cada primitiva se carga con su propio `import()`. `MotionDirector.tsx:23` solo importa cuando un `[data-motion]` coincide con una clave registrada o cuando hace falta el respaldo de Firefox.
   - Bajar `runtimeKB` a unos 10 KB.
2. **Parpadeo del respaldo de Firefox** (`reveal-fallback.ts:32,35`).
   - Aplicar el estado previo (clip-path y translate en línea) al empezar a observar, mientras el elemento sigue fuera de pantalla, y animar al entrar.
   - La limpieza quita los estilos en línea.
3. **Señal de runtime listo.** `start()` pone `data-motion-ready` y la limpieza lo quita.
   - Cualquier estado previo que dependa de JS (contador a 0, palabras ocultas) se cuelga de ese atributo, para que un runtime que no carga nunca oculte contenido.
   - Las reglas de view-timeline pueden quedarse en `on`.

## Menor

- **Código del respaldo duplicado.** `runtime.ts:2` importa `reveal-fallback` de forma estática y además en diferido (:35). Llevar `supportsScrollTimeline` a `runtime.ts` y dejar un solo camino.
- **Alcance del runtime.** `runtime.ts:23` recorre todo el documento. Limitar `start` a `main`, para que Nav y Footer no se reinicien en cada navegación.
- **Doble animación en Firefox** (`runtime.ts:34`). El respaldo va por primitiva y se salta los elementos registrados.
- **`scripts/js-budget.mjs`.**
  - Contar el runtime por los chunks del grafo de imports, no por una cadena marcadora.
  - Medir también about, contact, developers y privacy.
- **`e2e/motion-gate.spec.ts:22-28`.** Volver a comprobarlo en cuanto haya animaciones reales; ahora pasa sin probar nada.

## Lo que necesita la API para las tareas 3 a 7

Hay que añadirlo ahora, con pruebas.

- **Contexto `(el, ctx)` de cada primitiva.** Lleva `engine` (animate, spring, stagger), `inView(el, cb, opts)` y `scrollProgress(target, {axis, offset}) → 0..1`.
- **Tween numérico `count`.** Hace falta porque mini no anima números.
- **`split(el, "word")`.** Conserva `aria-label` y restaura el DOM al limpiar.
- **Seguimiento del puntero** con muelle y arrastre de velocidad, para las tarjetas magnéticas.
- **Campos opcionales `fallback` y `css` en cada entrada del registro.** Así Firefox y las reglas de view-timeline también pasan por el registro (E1.3).
- **Ciclo de vida.** Hooks `ready`/`stop`, `beforeNavigate`/`afterNavigate` y un hook de animación de salida para las transiciones de página.
- **Idempotencia por elemento** con un WeakMap, y un MutationObserver para el contenido que se inserta después de `start`.

## E5 (decisión del controlador)

Las tareas 3 a 7 pasan solo por el registro y sus primitivas. Donde el plan escribe CSS con `animation-timeline` directamente en un capítulo, ese CSS pasa al campo `css` de la primitiva. Si no, se usa `ctx.scrollProgress`, porque el `scroll()` de Motion ya usa ScrollTimeline nativo cuando está disponible.
