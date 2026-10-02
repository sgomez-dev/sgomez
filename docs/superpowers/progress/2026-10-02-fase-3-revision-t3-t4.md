# Fase 3: revisión con opus de las tareas 3 y 4, y ronda de arreglos

**Veredicto:** las tareas son sólidas y la tarea 5 puede construir sobre ellas.

**Decisión de perfil:** se queda **"full" con `compileAsync`**. No se publica "lite", ni se empieza con lite para pasar luego a full. Medido en frío:
- full síncrono: el primer render tarda de 0,9 a 1,3 s y los huecos de rAF llegan a 633 ms;
- full con async: de 80 a 150 ms y huecos de 33 a 117 ms.

Lite no es más rápido y se ve como un disco blanco plano, que no casa con el póster.

## Crítico

- **`src/three/GlassScene.ts:63`.** `await renderer.compileAsync(scene, camera)` antes del primer render, que hace uso de `KHR_parallel_shader_compile`. Los huecos del paso 7 se miden solo a partir de `glass:start`.

## Importante

- **`src/three/glass-kit.ts:159`.** La costura horizontal es la del tile con `RepeatWrapping`. Hay que pintar cada mancha y cada haz en sus copias envueltas (±size) dentro de `buildBackdrop`, para que el tile no tenga costura. El arreglo vale también para el 404.
- **`src/three/glass-kit.ts:113`.** PMREM `fromScene` cuesta entre 0,6 y 1,25 s en frío. La decisión del controlador:
  - Intentar **hornear el entorno en build** (la textura cubeUV o una equirect pequeña cargada como fichero) si se resuelve en un tiempo razonable.
  - Si no, aceptar unos 2 s hasta que el cristal está listo y relajar la regla de 1500 ms. El póster cubre ese tiempo.
  - Lo que se haga se mide y se documenta.
- **`src/three/glass.worker.ts:85`.** Hay que guardar el último tamaño y dpr del slot y aplicarlos cuando resuelva `createGlassScene`. Ahora un resize durante el arranque se pierde.
- **`scripts/js-budget.mjs:76`.** Si no encuentra los chunks del cristal, debe FALLAR. Basta con dejarlo preparado detrás de un indicador que se activa en la tarea 5.
- **`src/three/glass-client.ts:77`.** StrictMode ejecuta el efecto dos veces y `transferControlToOffscreen` solo se puede usar una vez por canvas. Hay que crear un `<canvas>` nuevo en cada ejecución del efecto y quitarlo en la limpieza. Si no, en `next dev` el cristal nunca aparece. Puede hacerse ya o al principio de la tarea 5.

## Menor

- **`glass.worker.ts:47`.** Borrar el slot solo si `slots.get(id) === slot`.
- **`GlassScene.ts:101`.** `dispose` debe llamar a `renderer.forceContextLoss()`.
- **Para la tarea 5:**
  - Detectar los cambios de DPR, porque con el mismo tamaño CSS no llega ningún resize.
  - Enviar `visibilitychange` como pausa.

## Sin cambios

- El archivo suelto `static/media/glass.worker.*.ts` que genera Turbopack es inofensivo y se ignora.
- Los dos indicadores de forzar la puerta se pueden unificar si no cuesta nada.
