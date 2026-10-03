# Fase 3: respuestas del dueño (2026-10-02)

Estas decisiones prevalecen sobre `2026-10-02-redesign-fase-3-3d.md` donde lo contradigan.

## F1. R3F

**Aprobado.** El hero usa three.js puro dentro de un worker, y R3F se retira del todo después de la tarea 9.

## F2. LCP en móvil

**Se mide en CI, con throttling real.** La tarea 2 añade un workflow que también se ejecuta al hacer push a `feat/redesign-v3` (con disparador `push`, limitado a esa rama).

- Hay que tener en cuenta que `ci.yml` solo corre en `pull_request`, y el PR no se abre hasta el final.
- Una variante mide con DevTools o con throttling aplicado (`throttlingMethod: devtools`) y otra con la simulación. Así se separa lo que es artefacto de lo que es real.

## F3. Forma del cristal

**Gana la forma redondeada del póster**, no la losa del 404.

- El `glass-kit` genera esa silueta redondeada, extruida y con bisel.
- El póster SVG y el 3D deben coincidir en el relevo.
- La constelación del 404 conserva sus fragmentos.

## F4. El salto del 404

El dueño no tiene claro qué ve. La tarea 8 empieza con un **diagnóstico visual**, no con un arreglo:

1. Captura en escritorio, a 1440x900, los fotogramas del relevo del vídeo al 3D: unos 12 fotogramas alrededor del final del vídeo y la entrada del canvas. Incluye también el arranque del vídeo, para el parpadeo de las líneas.
2. Mide en cada fotograma:
   - las cajas del escenario, del vídeo y del canvas;
   - la posición en pantalla de 3 fragmentos;
   - la opacidad de las líneas SVG.
3. Monta una tira comparativa en `docs/superpowers/progress/fase-3-404-relevo.png`, con un informe corto de qué se mueve, cuántos píxeles y en qué fotograma.
4. **Solo arregla lo que la medición demuestre.**
   - Si no hay descuadre, no se toca la geometría.
   - En ese caso, el informe propone qué podría estar percibiendo el dueño: un cambio de brillo o de material entre vídeo y 3D, el parpadeo de las líneas o el cambio de capa respecto al texto.
   - La tira se le enseña al dueño.

## F5. Botón de pausa

**«Pausar movimiento» / «Pause motion»**, la misma clave que en el 404. Hay una sola etiqueta en los diccionarios.
