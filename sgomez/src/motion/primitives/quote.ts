import { entrance } from "./entrance";

/** Citas en secuencia. Solo `translate`, sin recorte: una cita puede ser más alta que una pantalla y su texto nunca se corta. */
export const css = `
@keyframes mo-quote {
  from { translate: 0 2rem; }
  to { translate: 0 0; }
}${entrance('[data-motion="quote"]', "mo-quote", "entry 0% entry 40%")}`;
