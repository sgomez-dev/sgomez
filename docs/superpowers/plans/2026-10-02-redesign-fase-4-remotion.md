# Fase 4: taller de Remotion (capítulos 03, 05 y 07, y la reserva del hero)

Especificación: §3.3, §4, §6, §7 y §10.4 de `docs/superpowers/specs/2026-09-30-sgomez-redesign-design.md`.
Estado de partida: fases 1 a 3 hechas en `feat/redesign-v3`. El proyecto `video/` ya renderiza el 404 (`Shatter404`).

## Objetivo

Cuatro piezas renderizadas en local con Remotion. Se commitean en `public/media/` y la página las reproduce sin servicios externos:

| Pieza | Capítulo | Qué se ve | Cómo se reproduce |
|---|---|---|---|
| `BuildSequence` | 03 Lo que construyo | Seis losas de cristal (interfaz, API, modelo, datos, evaluación, infraestructura) que llegan separadas y se apilan en un sistema | `ScrollSequence`: fotogramas en `<canvas>` según el scroll |
| `ProjectReel` | 05 Proyectos | En cada una de las tres fichas destacadas, un recorrido por capturas reales del proyecto dentro del marco de dispositivo | `<video>` en bucle, en silencio, solo en pantalla |
| `SkyQuetzMonogram` | 07 SkyQuetz | Fragmentos del cristal que se juntan y forman el monograma de SkyQuetz | `<video>` una vez al entrar en pantalla, que acaba en el monograma |
| `HeroLoop` | 01 Hero | El cristal del póster respirando, para quien no tiene el 3D en vivo (móvil y horizontal) | `<video>` en bucle con «Pausar movimiento», tras el LCP |

## Reglas que no cambian

- El contenido nunca depende de la animación (§6). El texto de las capas, las fichas y la consultora sigue en el DOM. Los vídeos y las secuencias son decorativos, con `aria-hidden`.
- Sin JS, con movimiento reducido y con Save-Data se ve un póster estático (el último fotograma). No se descarga ningún vídeo ni ninguna secuencia.
- El LCP sigue siendo el titular o el retrato. Nada de esta fase se pide antes de `load` y de un hueco ocioso.
- Ningún vídeo lleva texto, porque el texto es DOM. Así se traduce y se lee.
- Los presupuestos del §7. Cada secuencia de scroll pesa como mucho 4 MB en escritorio y 1,5 MB en móvil. Cada reel, como mucho 600 KB. El monograma, como mucho 400 KB. El `HeroLoop`, como mucho 500 KB. El JS inicial se queda en 170 KB o menos y lo nuevo va en `import()` diferido. Lo mide un test de pesos como `tests/lost-media.test.ts`.
- La misma fuente de verdad. Material, entorno y colores salen de `sgomez/src/lib/lost/shards.ts` (`GLASS_MATERIAL`, `GLASS_ENV` y `GLASS_LIVE` para el hero), importados por ruta relativa, como hace `Shatter404`.
- Safari y el alfa. Donde haga falta transparencia, WebM VP9 con alfa y MP4 sobre negro con `mix-blend-mode: screen`, como en el 404. Donde la caja tiene fondo propio (reels), basta con MP4 H.264 opaco y un WebM.
- Reglas del dueño (TRASPASO §4). Copy sin rayas ni dos puntos retóricos, el nombre siempre entero y commits sin trailers.

## Tareas

### Task 1: `ScrollSequence`, el reproductor (núcleo)

**Files:** create `src/motion/scroll-sequence/{player.ts,ScrollSequence.tsx,manifest.ts}`, `tests/scroll-sequence.test.ts`, `e2e/scroll-sequence.spec.ts`.

- `manifest.ts` describe una secuencia: `{ id, frames, width, height, sizes: { desktop: {w,h,path}, mobile: {w,h,path} }, poster }`. Los fotogramas son `/media/<id>/<size>/0001.webp` y siguientes.
- `ScrollSequence` es un componente cliente. Pinta el póster (`<img>`) en el SSR y, si pasa la puerta (motion on, sin Save-Data, JS), monta un `<canvas>` encima con la misma caja (sin CLS).
- `player.ts` va sin React:
  - empieza a descargar cuando la sección está a un viewport (IntersectionObserver con `rootMargin` del 100 %);
  - primero carga 1 de cada 4 fotogramas, después el resto;
  - pinta el fotograma más cercano ya cargado según el progreso de scroll de la sección, con `requestAnimationFrame` y solo si cambia;
  - en móvil (menos de 64rem) usa el tamaño `mobile`;
  - libera las `ImageBitmap` al salir.
- El progreso se calcula de `getBoundingClientRect` en un rAF pasivo. No usa `animation-timeline`, porque el canvas no es CSS.
- Pruebas:
  - unitarias de la elección de fotograma por progreso y del orden de carga (1 de cada 4 primero);
  - e2e en las que sin JS y con movimiento reducido solo está el póster y ninguna petición a `/media/<id>/`;
  - e2e de que con scroll el canvas cambia de fotograma y no hay CLS;
  - axe sobre el capítulo.

### Task 2: `BuildSequence` (capítulo 03)

**Files:** create `video/src/BuildSequence.tsx` y `video/src/build-timeline.ts`; modify `video/src/Root.tsx` y `video/scripts/render.mjs` (salida `--only=build`, fotogramas WebP a `public/media/build/{desktop,mobile}/`, póster final); modify `src/chapters/Build.tsx`.

- Son seis losas con la silueta redondeada del póster, extruidas con el material del cristal. Llegan de lejos, separadas en profundidad, y se apilan en el orden de la lista. 90 fotogramas a 1600x900 en escritorio y 800x450 en móvil.
- Sin texto. En escritorio, la lista de capas del DOM va al lado, en dos columnas (secuencia a la derecha y lista a la izquierda). En móvil, la secuencia va encima de la lista.
- `Build.tsx` sigue siendo de servidor y monta `ScrollSequence` como isla cliente, con `manifest` de `build`.
- Verificación con capturas a 375, 1280 y 1920 al 0, 50 y 100 % del scroll del capítulo, y pesos bajo presupuesto.

### Task 3: `ProjectReel` (capítulo 05)

**Files:** create `video/scripts/capture-projects.mjs` (Playwright, capturas de las URL públicas de los tres proyectos destacados a 1440x900, más una a media página), `video/src/ProjectReel.tsx` y `video/public/projects/<slug>/*.png` (las capturas, commiteadas); modify `render.mjs` (`--only=reels`, a `public/media/reels/<slug>.{webm,mp4}` y su póster) y `src/chapters/Projects.tsx`.

- Las capturas salen solo de las URL que ya están en `content/index.tsx`. Si una URL no responde o pide login, ese proyecto se queda con la ficha actual (iniciales y stack), sin reel. No se inventa ninguna pantalla.
- El reel dura 8 s a 30 fps y 960x540. Hace un desplazamiento lento por la captura y un fundido a la segunda. No lleva texto.
- En la página, el `<video>` sustituye al bloque de iniciales dentro del marco de dispositivo. Usa `preload="none"` y `poster`. Se reproduce con IntersectionObserver y se pausa fuera de pantalla. Si el movimiento está reducido, solo se ve el póster.

### Task 4: `SkyQuetzMonogram` (capítulo 07)

**Files:** create `video/src/SkyQuetzMonogram.tsx`; modify `render.mjs` (`--only=monogram`, a `public/media/skyquetz/monogram.{webm,mp4}` y su póster) y `src/chapters/SkyQuetz.tsx`.

- Fragmentos de cristal (los de `shards.ts`, reescalados) vuelan hacia la silueta del monograma de `public/brand/skyquetz-monogram.webp` y se funden en él. Son 2,5 s a 60 fps y 800x800, con alfa.
- El último fotograma es exactamente el monograma, que es la imagen actual. El relevo a la `<img>` del DOM no salta.
- Se reproduce una vez al entrar en pantalla, sin bucle. La `<img>` actual sigue siendo el contenido, con su `alt`.

### Task 5: `HeroLoop` (capítulo 01, reserva)

**Files:** create `video/src/HeroLoop.tsx`; modify `render.mjs` (`--only=hero`, a `public/media/hero/loop.{webm,mp4}`) y `src/components/GlassStage.tsx` o un `HeroLoop.tsx` hermano.

- Es el cristal del póster con el aspecto de `GLASS_LIVE`, girando poco y flotando. Dura 6 s, en bucle perfecto, a 30 fps y 720x720, con alfa. El primer fotograma coincide con el póster SVG.
- Solo por debajo de lg y en horizontal, que es donde no hay 3D en vivo. Se monta tras `load` y un hueco ocioso. Va con `preload="none"`. Lleva el botón «Pausar movimiento» (`d.lost.pause`), porque el bucle dura más de 5 s (§6).
- No cambia el LCP en móvil. Hay que medirlo con la sonda de Lighthouse en Linux antes y después.

### Task 6: verificación y cierre de la fase

- Pasada en el navegador: escritorio con GPU y móvil, capturas de los capítulos 01, 03, 05 y 07 en su estado inicial, intermedio y final, y una vuelta con movimiento reducido y otra sin JS.
- `npm run budget`, el test de pesos de medios, la suite e2e entera y la sonda de LCP en el CI (push a la rama).
- Revisión con opus de las tareas 1 y 2, que son el núcleo, y de la fase entera. Una sola ronda de arreglos.

## Decisiones tomadas sin preguntar (el dueño pidió terminarlo todo)

Se anotan aquí para que el dueño pueda corregirlas.

1. Los reels salen de capturas automáticas de las URL públicas de cada proyecto, no de grabaciones del dueño. Un proyecto cuya URL no responde no tiene reel.
2. `HeroLoop` solo existe por debajo de lg y en horizontal. En escritorio manda el 3D en vivo.
3. `BuildSequence` no lleva etiquetas dentro del vídeo. La lista del DOM es la leyenda.
4. Cada pieza se puede retirar sola. Si una no pasa su presupuesto o su revisión visual, el capítulo se queda como está hoy y se anota.
