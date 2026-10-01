# Taller de Remotion del 404

Este proyecto renderiza en local el vídeo del 404: el cristal iridiscente entra, se agrieta y se rompe en los 12 fragmentos que la página enlaza. Termina exactamente en las poses finales de `sgomez/src/lib/lost/shards.ts`, así que la escena 3D en vivo puede tomar el relevo sin salto. No usa nube, ni servicios de pago, ni claves.

## Cómo renderizar

Desde esta carpeta, una sola vez `npm install`, y después `npm run render`. Esa orden genera todos los ficheros en `sgomez/public/media/404`:

- `shatter.webm`, VP9 con canal alfa, para Chrome, Firefox y Edge.
- `shatter.mp4`, H.264 sobre el fondo `#05060A`, para Safari.
- `poster-end.webp`, el último fotograma a 1920 por 1080 y transparente.
- `constellation.webp`, el póster de escritorio con las líneas de `LINES`.
- `constellation-mobile.webp`, el póster vertical de 900 por 1200 con `stage.mobile` y `LINES_MOBILE`.

`npm run draft` renderiza solo diez fotogramas a `video/out`, para comprobar que la tubería funciona. `npm run render -- --only=webm,mp4` o `--only=posters` renderiza una parte. `npm run studio` abre Remotion Studio para ver la composición fotograma a fotograma.

## Qué hay dentro

La composición `Shatter404` mide 1920 por 1080, va a 60 fps y dura 120 fotogramas. No lleva texto: el «404» es DOM de la página. Los fotogramas 0 a 40 son la entrada y las grietas, del 40 al 70 la fractura y del 70 al 119 el asentamiento en `pose`.

- `src/timeline.ts` guarda toda la animación como funciones puras del fotograma. No hay azar sin semilla, así que dos renders dan los mismos píxeles.
- `src/geometry.ts` construye el cristal como un diagrama de Voronoi de 12 celdas. Las aristas son las grietas y cada celda es un fragmento.
- `src/Scene.tsx` tiene el material `MeshPhysicalMaterial`, el entorno y las luces.
- `src/stills.tsx` define los pósters de la constelación.

El fichero `shards.ts` se importa por ruta relativa desde `../../sgomez/src/lib/lost/shards`. No se copia y no debe ganar imports.

## Presupuesto

Los vídeos juntos pesan como mucho 1,5 MB y cada WebP como mucho 200 KB. El test `sgomez/tests/lost-media.test.ts` lo comprueba. Si algo se pasa, baja la calidad con `WEBM_CRF`, `MP4_CRF` o `WEBP_QUALITY` al principio de `scripts/render.mjs`.

## Notas

El MP4 con alfa HEVC (ProRes 4444 a HEVC) necesita VideoToolbox, que solo existe en macOS, así que aquí Safari recibe el MP4 opaco. El tamaño de cada fragmento en el vídeo es `scale` por 0,42 unidades de mundo en escritorio y por 0,3 en el póster móvil, y la escena en vivo debe usar el mismo valor.
