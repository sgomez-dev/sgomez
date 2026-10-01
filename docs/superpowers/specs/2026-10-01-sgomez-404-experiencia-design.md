# sgomez.dev v3: el 404 como experiencia

Fecha: 2026-10-01 · Autor: Santiago Gómez de la Torre · Estado: pendiente de revisión
Base: `docs/superpowers/specs/2026-09-30-sgomez-redesign-design.md` (la spec del rediseño). Esta spec se suma a aquella; donde se contradigan, manda esta para el 404.

## 1. Objetivo

Que entrar en una URL que no existe sea una experiencia memorable y útil. El concepto aprobado en el compañero visual combina el estilo de «A · El cristal roto» con la función de «C · Te has salido del mapa»: el cristal iridiscente del hero estalla y sus fragmentos se convierten en una constelación en la que cada fragmento es una página real del sitio.

Además, este trabajo arregla las dos limitaciones de la fase 1:
- **R8:** el 404 se servía con `experimental.globalNotFound`.
- **R22:** el 404 era una sola página bilingüe con navegación y pie en español, también bajo `/en/…`.

**Criterios de éxito**
1. Una URL desconocida responde con **estado 404 real**, en el idioma de la URL (`/en/…` en inglés y el resto en español), con la navegación y el pie de ese idioma.
2. Una persona ve primero el estallido del cristal (Remotion) y luego la constelación viva en 3D, con fragmentos que flotan, reaccionan al cursor o al giroscopio y llevan a páginas reales.
3. Sin JavaScript, sin WebGL o con `prefers-reduced-motion`, la página sigue siendo completa y bonita. Tiene la constelación estática y los mismos enlaces.
4. Un agente obtiene el mismo mapa del sitio que hoy: el HTML lleva la lista de páginas, ficheros para máquinas y API, y `Accept: text/markdown` devuelve el markdown 404 localizado.
5. Se mantienen `noindex`, `Vary`, una caché corta, presupuestos de rendimiento y accesibilidad AA.

## 2. La experiencia (guion aprobado)

| Tiempo | Qué pasa | Quién lo hace |
|---|---|---|
| 0,0 s | El cristal del hero entra, gira y se agrieta; la luz entra por las grietas | Remotion (vídeo con canal alfa) |
| 0,8 s | Estalla en fragmentos 3D despedidos; el «404» queda grabado en contorno detrás | Remotion |
| 2,0 s | Los fragmentos frenan y se colocan; cada uno se enciende con el nombre de una página y se trazan las líneas de la constelación | 3D en vivo (relevo exacto del último fotograma del vídeo) |
| ∞ | Los fragmentos flotan, se inclinan hacia el cursor (giroscopio en móvil, con permiso) y brillan al pasar o al recibir foco; un punto marca «Estás aquí, fuera del mapa» junto a la URL pedida | 3D en vivo |

**Texto** (sin rayas y sin dos puntos retóricos, según la regla del dueño):
- **ES:** etiqueta «Error 404 · `/ruta-pedida`», titular «Esta página *se ha roto.*» y párrafo «Pero cada fragmento lleva a un sitio que sí existe. Elige uno o vuelve al inicio.»
- **EN:** etiqueta «Error 404 · `/requested-path`», titular «This page *broke.*» y párrafo «But every fragment leads somewhere that exists. Pick one or head home.»
- Los botones son «Volver al inicio» / «Back to home» y «Ver el mapa completo» / «See the full map». Este último lleva al ancla `#mapa`, la lista para agentes y teclado.
- La ruta pedida se escapa siempre (texto plano, nunca HTML) y se recorta a 80 caracteres.

**Fragmentos y páginas.** Hay siete fragmentos con enlace: Inicio, Sobre mí, Proyectos (`/#work`), Open source (`/#open-source`), Contacto (`/#contact`), Developers y Para agentes (`llms.txt` del idioma). Los acompañan cuatro o cinco fragmentos pequeños decorativos sin enlace. Los enlaces salen del catálogo de rutas (`src/lib/routing/pages.ts` y `machineHref`), nunca escritos a mano.

## 3. Arquitectura

### 3.1 Enrutado del 404 (sustituye a R8)
- Se crea una página estática y prerenderizada, `app/[lang]/perdido/page.tsx`, con `noindex` y fuera del sitemap. Es el «molde» del 404 en cada idioma.
- **Ruta desconocida.** `routeRequest()` decide que una ruta HTML es desconocida cuando no está en el catálogo localizado: páginas, anclas de la home, ficheros para máquinas, variantes `.md`, `/api`, `/_next` y ficheros con extensión. Los recursos estáticos con extensión que no existen siguen el 404 normal de Next, sin experiencia.
- **Lo que hace el proxy.** Pide internamente `/{lang}/perdido` con una cabecera de bypass y devuelve ese HTML con:
  - `status: 404`;
  - `Content-Type: text/html; charset=utf-8`;
  - `Cache-Control: public, max-age=60, s-maxage=60`;
  - `Vary` igual que las páginas;
  - `X-Robots-Tag: noindex, follow`.

  El navegador sigue en la URL pedida, porque el proxy devuelve el molde en esa misma URL. Así que la página lee `location.pathname` en el cliente y la pinta como texto escapado. No se mete en el HTML del servidor, para que el molde sea uno por idioma y cacheable. Sin JS, la etiqueta dice solo «Error 404».
- **Acceso directo** a `/en/perdido` o `/perdido`: también responde 404 con la misma experiencia, sin bucle gracias a la cabecera de bypass.
- **Markdown:** `Accept: text/markdown` y las variantes `.md` desconocidas siguen devolviendo `notFoundMarkdown(path, lang)`, como hoy.
- **Lo que se elimina:** `src/app/global-not-found.tsx`, `experimental.globalNotFound` y `NotFoundBody` en su forma bilingüe. Su contenido de mapa se reutiliza por idioma en la sección `#mapa`.
- **Viabilidad: confirmada** por la prueba técnica del 2026-10-01 (Next 16.2.6, `next start`).
  - `/zz` → 404 con el molde español y `lang="es-ES"`; `/en/zz` → 404 con el molde inglés y `lang="en"`.
  - La página hidrata y los componentes de cliente funcionan.
  - La cabecera de bypass `x-sgomez-404: 1` evita el bucle.
  - Al navegar desde dentro de la web, el router hace una navegación completa y muestra el 404.
  - Se descarta `NextResponse.rewrite(url, { status: 404 })`. Conserva el estado, pero hereda `s-maxage=31536000` del prerender y el proxy no puede corregirlo, así que la CDN guardaría el 404 un año.
- **Robustez:**
  - El proxy guarda el HTML del molde por idioma en memoria, con un TTL de 60 s, para no hacer una petición interna por cada 404.
  - `Cache-Control: public, max-age=60, s-maxage=60`.
  - Si la petición interna falla (por ejemplo, por la protección de previews de Vercel o un error), el proxy devuelve una página 404 mínima autocontenida, generada desde `notFoundMarkdown(path, lang)`, con estado 404 y enlaces a las páginas. Nunca un 500.
  - Si la petición ya lleva la cabecera de bypass, el proxy nunca vuelve a pedir el molde.

### 3.2 Taller Remotion (adelanta la fase 4 solo para esta pieza)
- Proyecto hermano `video/` en la raíz del repo, con dependencias propias que no se despliegan: `remotion`, `@remotion/cli` y `@remotion/three`.
- Composición `Shatter404`, de 1920×1080 a 60 fps y unos 2 s (120 fotogramas).
  - Contiene el cristal con el mismo material y la misma paleta que el hero: transmisión, iridiscencia, `#8FA8FF`, `#6EF0DC`, `#5B6CFF` y blanco.
  - El cristal se agrieta y se fractura en N fragmentos con física sencilla determinista.
  - Fondo transparente.
- **Salida**, en `sgomez/public/media/404/`:
  - `shatter.webm` (VP9 con canal alfa);
  - `shatter.mov` en HEVC con alfa para Safari, si el tamaño lo permite; si no, `shatter.mp4` sin alfa sobre el fondo exacto de la página;
  - `poster-end.webp`, el último fotograma;
  - `constellation.webp`, el estado final estático para la reserva sin JS.
  - Presupuesto total de vídeo ≤ 1,5 MB.
- **Configuración compartida:** `shared/shards.ts`, en un sitio importable desde `video/` y desde la app, define la geometría, la posición final, la rotación y el color de cada fragmento. El último fotograma de Remotion y el primer fotograma de la escena viva usan exactamente esos valores, así que el relevo es invisible.
- El render es local (`npx remotion render`), sin servicios en la nube ni de pago. Los ficheros generados se commitean.

### 3.3 Escena viva (adelanta la fase 3 solo para esta pieza)
- `src/three/ConstellationScene.tsx` con React Three Fiber y drei. Se carga con `next/dynamic({ ssr: false })` solo si:
  - hay WebGL2;
  - no está activo `prefers-reduced-motion`;
  - no está activo `Save-Data`;
  - `hardwareConcurrency ≥ 4`.
- Materiales `MeshPhysicalMaterial` con transmisión e iridiscencia, una luz de entorno sencilla y bloom ligero, todo con el presupuesto en mente.
- **Movimiento:** cada fragmento flota con ruido suave. La escena se inclina con el puntero, con amortiguación. En móvil usa `DeviceOrientation` solo tras un gesto y con permiso en iOS; sin permiso, la escena flota sola. El hover y el foco hacen brillar el fragmento y muestran su etiqueta.
- **Enlaces accesibles:** cada fragmento con enlace tiene su `<a>` real en el DOM, posicionado sobre la proyección del fragmento y actualizado por frame con un transform, sin reflow. El orden de tabulación es el de la constelación y el foco visible es el del sitio. Las líneas de la constelación son decorativas, `aria-hidden`.
- **Secuencia:**
  1. Al cargar se ve el póster estático, y el vídeo se reproduce encima si se permite el movimiento.
  2. Cuando el vídeo termina, o si ya estaba en caché, se monta la escena viva en el estado exacto del final.
  3. El vídeo se oculta.
  4. Si el 3D no se carga, se queda `constellation.webp` con los enlaces del DOM en sus posiciones estáticas.
- **Pausa:** botón «Pausar movimiento» / «Pause motion», porque el movimiento dura más de 5 s.

### 3.4 Contenido para agentes y teclado
- Debajo del escenario va la sección `#mapa`, el mapa completo del sitio en el idioma de la URL. Incluye las páginas, los ficheros para máquinas con `machineHref`, la API y el bloque literal del markdown 404. Es lo que hoy muestra `NotFoundBody`, ahora localizado.
- El HTML del servidor contiene todo el texto y todos los enlaces. La experiencia solo decora.

## 4. Presupuestos y accesibilidad

| Métrica | Presupuesto |
|---|---|
| LCP del 404 | < 2,5 s. El LCP es el titular o el póster, nunca el canvas |
| JS inicial | ≤ 170 KB gzip, igual que el resto del sitio. El chunk de R3F va aparte, en diferido y ≤ 250 KB gzip |
| Vídeo | ≤ 1,5 MB en total; carga con `preload="auto"` solo si se permite el movimiento |
| CLS | < 0,05. El escenario tiene alto fijo por breakpoint |
| Accesibilidad | axe sin violaciones, foco visible, 44 px en enlaces y botones, contraste AA en cada estado |

Responsive de 320 a 1920 px y en horizontal. En móvil la constelación se reordena en vertical y el texto va arriba.

## 5. Pruebas

- **Unitarias:**
  - `routeRequest` clasifica como desconocidas las rutas HTML fuera del catálogo, pero no `/api`, ficheros ni `.md`;
  - `shards.ts` tiene los siete fragmentos con enlace mapeados a rutas existentes del catálogo;
  - el escape y el recorte de la ruta pedida.
- **E2E:**
  - `/no-existe` y `/en/no-existe` responden 404 con `lang` correcto, navegación del idioma y el titular localizado;
  - `noindex`;
  - sin JS se ven los siete enlaces y el mapa;
  - con `prefers-reduced-motion` no hay vídeo ni canvas;
  - con JS y movimiento, el vídeo se reproduce y después aparece el canvas;
  - 0 errores de consola;
  - los enlaces de los fragmentos llevan a páginas 200;
  - sin desbordamiento en los 9 anchos;
  - axe sin violaciones;
  - el markdown 404 por idioma sigue igual.
- **Pasada real en navegador:** escritorio, móvil y horizontal, con capturas del estado final y de un fotograma intermedio.

## 6. Fuera de alcance

El resto de las fases 3 y 4 (el cristal vivo del hero y las secuencias de scroll de la home). Esta pieza estrena las herramientas, pero no las aplica a otras páginas.

## 7. Cambios tras la revisión del render (2026-10-01)

- **Fuente única de verdad.**
  - `src/lib/lost/shards.ts` (sin imports) contiene la geometría de cada fragmento (contorno y celda), el tamaño, el orden de Euler, el material y el entorno del cristal.
  - Contiene también las funciones `project`, `unproject` (a la profundidad de cada fragmento) y `silhouette`.
  - El generador vive en `video/scripts/bake-geometry.mjs`, con una comprobación que avisa si los datos se desvían.
- **Escritorio.**
  - El escenario es una caja fija 16:9 de hasta 1440 px, y en ella encajan el vídeo y el canvas.
  - Las posiciones se calculan a partir de las poses, no se escriben a mano.
  - La capa estática es `poster-end.webp` a tamaño exacto, que es también el póster del vídeo.
  - Las líneas solo las dibuja el SVG.
- **Móvil.**
  - No hay vídeo: se pasa de la constelación estática directamente a la escena viva.
  - Los fragmentos de CSS son siluetas proyectadas (`clip-path`).
- **Safari.** El MP4 se renderiza sobre negro puro y se reproduce con `mix-blend-mode: screen`, porque Safari ignora el canal alfa del WebM.
- **Ficheros.** Se retiran `constellation*.webp` de `public/media/404`.

### 7.1 Enmienda: 3D solo en escritorio (2026-10-01)

- Por debajo de `lg` la puerta de `LostExperience` falla: no hay sonda WebGL2, ni chunk three, ni lienzo. Móvil muestra siempre el escenario estático (póster, siluetas `clip-path` y líneas) con los mismos enlaces. Esto sustituye al fundido móvil a la escena viva descrito arriba.
- Motivo: el TBT de Lighthouse móvil estaba en 9-12 s. Casi todo es una única llamada de comprobación de enlazado del shader de `MeshPhysicalMaterial` (transmisión, dispersión, iridiscencia y clearcoat) en ANGLE/D3D11, que bloquea el hilo y no se puede trocear. `compileAsync`, el bucle a demanda y el diferido no lo evitan.
- Escritorio conserva vídeo y escena 3D. El vídeo arranca de inmediato; solo el import de three espera a un hueco ocioso tras `load`. Si no llega a tiempo al relevo, rige el comportamiento de escena tardía.
- Cruzar a móvil tras la puerta devuelve el escenario estático.
