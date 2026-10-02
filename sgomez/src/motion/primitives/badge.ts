import { entrance } from "./entrance";

/** Muro de insignias: se ensambla escalonado por columna (`--i` = índice mod 3). El recorte deja sitio al anillo de foco. */
export const css = `
@keyframes mo-badge {
  from { clip-path: inset(0 0 100% 0 round var(--radius)); translate: 0 var(--mo-rise); scale: 0.96; }
  to { clip-path: inset(-0.5rem round var(--radius)); translate: 0 0; scale: 1; }
}${entrance('[data-motion="badge"]', "mo-badge")}`;
