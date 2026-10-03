# Taller de Remotion del 404

Este proyecto renderiza en local el vídeo del 404: el cristal iridiscente entra, se agrieta y se rompe en los 12 fragmentos que la página enlaza. Termina exactamente en las poses finales de `sgomez/src/lib/lost/shards.ts`, así que la escena 3D en vivo puede tomar el relevo sin salto. No usa nube, ni servicios de pago, ni claves.

## Cómo renderizar

Desde esta carpeta, una sola vez `npm install`, y después `npm run render`. Esa orden genera todos los ficheros en `sgomez/public/media/404`:

- `shatter.webm`, VP9 con canal alfa, para Chrome, Firefox y Edge.
- `shatter.mp4`, H.264 sobre negro puro, para Safari. La página lo pinta con `mix-blend-mode: screen`, así el negro desaparece.
- `poster-end.webp`, el último fotograma a 1920 por 1080, transparente y sin líneas. La página lo pinta como fondo a 100% por 100% de una caja 16:9, con la misma proyección que las posiciones de los enlaces.

`npm run draft` renderiza solo diez fotogramas a `video/out`, para comprobar que la tubería funciona. `npm run render -- --only=webm,mp4` o `--only=posters` renderiza una parte. `npm run studio` abre Remotion Studio para ver la composición fotograma a fotograma.

## Qué hay dentro

La composición `Shatter404` mide 1920 por 1080, va a 60 fps y dura 120 fotogramas. No lleva texto: el «404» es DOM de la página. Los fotogramas 0 a 40 son la entrada y las grietas, del 40 al 70 la fractura y del 70 al 119 el asentamiento en `pose`.

- `src/timeline.ts` guarda toda la animación como funciones puras del fotograma. No hay azar sin semilla, así que dos renders dan los mismos píxeles.
- `src/geometry.ts` construye las mallas desde los contornos horneados. Las aristas internas de cada celda son las grietas.
- `src/Scene.tsx` tiene el material `MeshPhysicalMaterial`, el entorno y las luces.

El fichero `shards.ts` se importa por ruta relativa desde `../../sgomez/src/lib/lost/shards`. No se copia y no debe ganar imports.

## Fuente única de la geometría

Todo lo que define el cristal vive en `sgomez/src/lib/lost/shards.ts`: `GLASS`, `GLASS_MATERIAL`, `GLASS_ENV`, y por fragmento `outline` y `cell`. El vídeo y la escena 3D en vivo leen de ahí. `shards.ts` también trae `project`, `unproject` y `silhouette`, que usa la página estática.

Los contornos los escribe `npm run bake`, que ejecuta el generador de Voronoi y reescribe los literales. `npm run bake:check` falla si los literales no coinciden con el generador. `npm run verify` comprueba que el centroide de cada fragmento de `poster-end.webp` cae a menos del 1% de `project(pose, 16/9)`.

## Safari

Safari dice que reproduce VP9 en WebM pero ignora su canal alfa, así que verá un recuadro opaco. Por eso la elección de fuente no puede apoyarse en poner el WebM primero. Hay que detectar Safari, o encabezar con una fuente que solo Safari elija, y servirle el MP4 con `mix-blend-mode: screen` dentro de la caja del escenario.

## Presupuesto

Los vídeos juntos pesan como mucho 1,5 MB y el WebP como mucho 200 KB. El test `sgomez/tests/lost-media.test.ts` lo comprueba. Si algo se pasa, baja la calidad con `WEBM_CRF`, `MP4_CRF` o `WEBP_QUALITY` al principio de `scripts/render.mjs`.

## Notas

El MP4 con alfa HEVC (ProRes 4444 a HEVC) necesita VideoToolbox, que solo existe en macOS, así que aquí Safari recibe el MP4 opaco. 
## Secuencia del capítulo 03

`npm run render -- --only=build` renderiza `BuildDesktop` (1200 por 1200) y `BuildMobile` (600 por 600), 90 fotogramas a 30 fps, y los convierte a WebP con alfa en `sgomez/public/media/build/{desktop,mobile}/0001.webp`, más `poster.webp`. Presupuesto: 4 MB en escritorio, 1,5 MB en móvil y 200 KB el póster (`sgomez/tests/build-media.test.ts`). Las losas usan la silueta del póster del hero y el material de `GLASS_LIVE`.

## Reels del capítulo 05

`node scripts/capture-projects.mjs` captura (Playwright, 1440 por 900) la primera pantalla y otra a media página de las URL de los tres proyectos destacados, a `public/projects/<slug>/`. Se miran antes de usarlas y se commitean. `npm run render -- --only=reels` renderiza `ProjectReel` (960 por 540, 8 s a 30 fps, sin texto, bucle sin salto) a `sgomez/public/media/reels/<slug>.{webm,mp4,webp}`. Presupuesto: 600 KB cada vídeo (`sgomez/tests/reel-media.test.ts`). Si una URL no responde, ese proyecto se queda sin reel y se quita de `scripts/projects.mjs` y de `sgomez/src/lib/reels.ts`.
