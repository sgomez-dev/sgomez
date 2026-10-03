# Fase 2: revisión final con opus y ronda de arreglos

Veredicto: aún no está lista para el PR. Hay tres hallazgos importantes, todos de arreglo pequeño, y nada crítico.

## Importante

1. **El scroll suave choca con las transiciones** (`src/app/[lang]/layout.tsx:160`). Hay que añadir `data-scroll-behavior="smooth"` en `<html>`.
   - Next 16 solo desactiva el scroll suave durante el cambio de ruta si se pide con ese atributo.
   - Sin él, la página nueva aparece por el final y luego sube durante unos 700 ms.
2. **El ancla `#open-source` aterriza en tarjetas vacías** (`src/motion/motion.css:63-85`). Cada capa debe terminar hacia `entry 60%`, o la línea de tiempo se ata al `ul` en lugar de a cada `li`.
   - La prueba e2e "ancla aterriza terminada" se amplía a todas las anclas de la navegación, a 1366x700, 1280x800, 1440x900 y 375.
3. **`summary` se cuela en `/api/v1/experience`** (`src/lib/api/data.ts:185`). Rompe el contrato OpenAPI, que tiene `additionalProperties: false`.
   - Sacar `summary` de `getExperience` y leerlo en `Experience.tsx`.
   - Añadir una prueba que valide las respuestas de la API contra el esquema OpenAPI.

## Menor

4. **`beforeNavigate` y `afterNavigate`** (`MotionDirector.tsx:33,50`, `runtime.ts:16-39`). Nadie los escucha y los nombres no dicen lo que hacen: quitarlos.
5. **El resumen no se puede copiar** (`Experience.tsx:44`). Quitar `select-none` del summary; basta con `aria-hidden`.
6. **Tras navegar, `/about` se queda en y=64.** Si el arreglo es trivial, que la página nueva arranque en 0. Si no lo es, dejarlo anotado.
