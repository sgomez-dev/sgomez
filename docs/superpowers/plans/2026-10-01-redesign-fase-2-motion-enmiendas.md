# Fase 2: enmiendas del dueño (2026-10-01)

Estas decisiones prevalecen sobre el plan `2026-10-01-redesign-fase-2-motion.md` donde lo contradigan.

## E1. Motor de animación: Motion primero, CSS como respaldo medido

La Task 2 tiene una puerta de decisión.

1. Se intenta primero con Motion (el paquete `motion`, sucesor de framer-motion).
   - Va cargado en diferido y nunca en el JS inicial.
   - Usa la entrada más pequeña que sirva: `motion/mini` o `animate`/`scroll`/`inView` de vanilla. `LazyMotion` con `domAnimation` solo si hace falta React.
2. El medidor de la Task 1 lo mide, inicial y por ruta.
   - Si el JS inicial de cualquier ruta sigue ≤ 170 KB gzip, se queda Motion.
   - Si lo supera, se usa el camino CSS del plan: `animation-timeline` más un runtime ligero. Ese camino debe emular Motion por completo: muelles (con curvas `linear()` generadas), escalonado y animación ligada al scroll.
3. La decisión y sus cifras se anotan en el informe de la Task 2 y en un comentario del registro del runtime.
   - Las Tasks 3 a 7 solo hablan con el registro del runtime, nunca con Motion ni con CSS directamente. Así son agnósticas al motor.

## E2. Firefox: respaldo ligero

Donde no hay `animation-timeline`, las piezas se revelan al entrar en pantalla.

- Usa un IntersectionObserver y una animación simple, no ligada al scroll.
- No pesa más de unos 2 KB y se carga solo cuando hace falta.
- La página se ve completa también sin JS.

## E3. Nombre "escrito con luz" en el hero

Pasa a la fase 3 y no se toca en la fase 2.

## E4. Peso inicial

La cifra de unos 190 KB probablemente contaba un polyfill `noModule`. La Task 1 confirma la cifra real con una build limpia, y esa es la línea base.

## E5 revisada. El CSS ligado al scroll es estático, no del registro

Las pistas A y B midieron lo mismo: el `css` de una entrada del registro se inyecta tras idle, y entonces un elemento a medio entrar salta a su estado parcial y, si el CSS cambia el layout, la página crece a mitad de scroll.

- Todo el CSS ligado al scroll o de estado previo vive en `src/motion/motion.css`, estático, tras `@media (prefers-reduced-motion: no-preference)`, `@supports (animation-timeline: view())` y `:root[data-motion-state="on"]`. Está vivo desde el primer pintado y no necesita runtime.
- Lo que depende de JS (hoy, el `transform` del imán, que lee `--mx` y `--my`) cuelga además de `data-motion-ready`.
- El campo `css` de `Entry` desaparece. El registro solo lleva primitivas con JS: `count`, `intent` y `magnetic` (con `run`), y `text-reveal` y `build` con `fallbackOnly` (solo respaldo de Firefox, no se piden donde hay `animation-timeline`). `card`, `badge`, `quote` y `word-reveal` ya no son entradas: son atributos `data-motion` que enganchan el CSS.
- Consecuencia: en Chromium el runtime solo se pide en páginas con cifras o imanes (la home); la política y el resto de páginas internas no lo cargan.
