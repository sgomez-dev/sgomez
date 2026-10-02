/**
 * Motor de animación del runtime. Las primitivas de las Tasks 3 a 7 importan de
 * aquí y del registro, nunca de "motion" ni del CSS directamente.
 *
 * DECISION (Task 2, enmienda E1): Motion (vanilla, sin React) se queda.
 * Va en el chunk perezoso del runtime, así que no entra en el JS inicial de
 * ninguna ruta. Cifras de la medición en el informe de la Task 2
 * (docs/superpowers/progress/2026-10-01-fase-2.md). Si una tarea posterior
 * hiciera pasar el JS inicial de 170 KB gzip, el plan dice cambiar a CSS
 * (animation-timeline) más un runtime ligero emulando muelles con curvas
 * linear(), escalonado y animación ligada al scroll; solo habría que
 * reimplementar este fichero con la misma forma.
 */
export { animate, inView, scroll, stagger, spring } from "motion";
