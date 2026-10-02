/** Entrada compartida por tarjetas y por intenciones del contacto: sin opacity, el texto conserva su contraste. */
export const MO_CARD_KEYFRAMES = `
@keyframes mo-card {
  from { clip-path: inset(0 0 100% 0 round var(--radius)); translate: 0 var(--mo-rise); }
  to { clip-path: inset(-0.5rem round var(--radius)); translate: 0 0; }
}`;

/** Escalonado por columna o por posición: `--i` en el elemento. */
export const STAGGER_RANGE = "entry calc(var(--i, 0) * var(--mo-stagger)) entry calc(70% + var(--i, 0) * var(--mo-stagger))";

export const entrance = (selector: string, name: string, range = STAGGER_RANGE) => `
:root[data-motion-state="on"] ${selector} {
  animation: ${name} linear both;
  animation-timing-function: var(--mo-ease);
  animation-timeline: view();
  animation-range: ${range};
}`;
