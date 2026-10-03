import type { Primitive } from "../types";
import { revealOnEnter } from "../reveal-fallback";

/** Tarjetas que se construyen: el movimiento es CSS estático (motion.css). Aquí solo el respaldo de Firefox. */
export const fallback: Primitive = (el) => revealOnEnter([el]);
