# Fase 3: revisión con opus de la tarea 5 (GlassStage en el hero)

**Veredicto:** todavía no se puede fusionar. La fontanería es sólida: puerta, reservas, CLS 0, LCP intacto (el h1) y presupuesto de 156,3 KB. Pero el relevo del póster al 3D se nota como un bajón, así que **la siguiente ronda es visual**. Esta ronda está **por aplicar**.

Las capturas de la revisión estaban en el scratchpad de la sesión y no se guardaron. Las de referencia son `fase-3-task5-poster.png` (el póster) y `fase-3-task4-glass-fixed.png` (el cristal en vivo).

## Crítico

1. **`GlassScene.ts:81`.** El giro `t*0.08` crece sin límite. Cada unos 39 s la losa se pone de canto y enseña el dorso; a los 18 s ya parece una moneda.
   - Hay que acotarlo, por ejemplo `Math.sin(t*0.1)*0.2`.
2. **El "corte" del borde izquierdo no es un recorte.** Es la pared lateral de la losa, que la transmisión pinta oscura. Durante el fundido, el 3D es un 25 % más estrecho que el póster.
   - La causa es la pose de reposo del hero (`protocol.ts:32`, `ry 0.42`, `rx -0.32`), más los 18° extra de la intro (`GlassScene.ts:79`) y su escala inicial de 0.94 (`:84`).
   - Arreglo:
     - Reposo casi frontal, con `rx -0.1, ry 0.12, rz 0`. Los 18° del póster ya están en la silueta.
     - La intro arranca sin giro extra y con escala 1, para que el fotograma de t=0 coincida con el SVG.
3. **Demasiado oscuro y demasiado azul.**
   - Las causas:
     - el fondo `#0A1030` (`shards.ts:102`);
     - la atenuación `#8FA8FF` a distancia 2.5 (`shards.ts:65-66`);
     - ACES con exposición 1 (`GlassScene.ts:30`).
   - Arreglo, **solo para el hero y el contacto**, sin tocar el 404:
     - `toneMappingExposure` en torno a 1.4, o `NeutralToneMapping`;
     - un fondo más claro, con manchas blancas y `#6EF0DC` sacadas de las paradas del degradado del póster;
     - `attenuationDistance` en torno a 8, o atenuación blanca;
     - `envMapIntensity` en torno a 1.6.
4. **El halo desaparece.** El halo difuminado (`GlassPoster.tsx:47-52`) se apaga junto con el SVG.
   - Hay que llevarlo a una capa propia que `motion.css:295-296` no apague, o poner un brillo radial en CSS detrás del canvas.

## Importante

5. **`motion.css:295`.** Al apagar el cristal, el póster tarda unos 200 ms en volver. Pasa al cruzar lg y con movimiento reducido.
   - La transición va solo en la regla `[data-glass="live"]`, para que el póster vuelva al instante.
   - El e2e debe comprobar opacity 1 justo después de "off". `toHaveCSS` reintenta y oculta el hueco.
6. **`js-budget.mjs:15/78`.** `REQUIRE_GLASS` se declara pero no se lee. Cuando está activo, tiene que poner `failed = true`.
7. **`GlassStage.tsx:93-107`.** La primera visibilidad (IntersectionObserver y `document.hidden`) se pierde antes de que exista `handle`.
   - Llamar a `sendVisible()` justo después de `mountGlass`. Afecta a la tarea 6 (`/#contact`).

## Menor

8. **`glass-hero.spec.ts:23`.** `lcp.t < start` es intermitente. Comprobar la etiqueta del elemento, o comparar con `glass:ready`.
9. **`glass-kit.ts:138-169`.** El arreglo de la costura rellena el tile entero 297 veces en vez de 33. Hay que rellenar solo los límites de cada degradado y saltar las copias que caen fuera del tile, porque cuesta hilo principal en el 404 hasta la tarea 9.
10. **`GlassStage.tsx:153`.** Al llegar a live, el efecto de pausa debe volver a leer `isPaused()`.
11. **E2E.** Faltan pruebas de:
    - memoria baja (<4);
    - el vigilante de DPR;
    - `visibilitychange`;
    - que con Save-Data no se pida el worker.

## Cómo verificar la ronda

Hacer capturas a 1440x900 y 1920x1080 en tres estados: póster, a mitad del fundido y en vivo, más una a los 60 s. Con eso hay que confirmar que:

- la silueta del 3D coincide con la del póster, ±4 px, en el fotograma del relevo;
- el brillo y el color son equivalentes;
- el halo se mantiene;
- la losa no se pone de canto.

Guardarlas en `docs/superpowers/progress/` para que el dueño las vea.
