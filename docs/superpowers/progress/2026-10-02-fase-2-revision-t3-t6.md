# Fase 2: revisión con opus de las tareas 3 a 6, y ronda de arreglos

Veredicto: se aprueba tras dos arreglos importantes. No hay nada crítico.

## Importante

1. **Límite del runtime.** El controlador decide que 15 KB es coherente con E1, porque la puerta del dueño es el JS inicial (≤170 KB) y el runtime se carga en diferido, tras idle, y solo en la home. Hay que anotarlo como E6 en las enmiendas.
   - La siembra de `js-budget.mjs` debe partir solo de los objetivos `import()` del chunk del registro, no de todos los chunks que nombra.
2. **El pin de la experiencia tiene que funcionar en portátiles normales.** Con `min-height: 48rem` (`motion.css:166`), un portátil de 1536x864 o de 1366x768 queda fuera, porque el navegador deja un viewport de 650 a 740 px.
   - Bajar la puerta a 40rem, unos 640 px.
   - Rediseñar la tarjeta fijada con estilo keynote. Lo primero es grande: periodo, rol y organización. Después va un cuerpo corto a tamaño legible, nunca por debajo de 15 px.
   - Si el texto completo no cabe, añadir un campo `summary` en ES y EN por entrada en el contenido, sin guiones ni dos puntos retóricos, y mostrarlo solo en modo fijado. El texto completo sigue en la lista vertical, sin pin.
   - Los lectores de pantalla no pierden contenido y nada queda recortado.
   - El h2 no cambia de tamaño al cruzar la puerta (`motion.css:180`).

## Menor

- **Cifras duplicadas al copiar** (`About.tsx:46-49`). Poner `select-none` en la copia con `aria-hidden`.
- **Imán** (`ctx.ts:75`).
  - Guardar el rect en `pointerenter`, porque ahora se mide con el transform del propio imán.
  - Registrar `@property --mx/--my { inherits: false }`.
- **Impresión.** Las reglas del pin van dentro de `@media screen`.
- **Foco en el `ol` fijado** (`Experience.tsx:27`). Mientras está fijado no debe tener un tabIndex inútil ni un anillo de foco de 4720 px. El foco va al escenario, o las flechas desplazan la página.
- **Comentario obsoleto** en `Experience.tsx:12`.
