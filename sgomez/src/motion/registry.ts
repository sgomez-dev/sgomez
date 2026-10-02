import type { Registry } from "./types";

/**
 * Valor de `data-motion` → entrada. Solo hay `load` (un import() por primitiva):
 * este fichero va en el JS inicial y tiene que seguir siendo diminuto.
 * Las Tasks 4 y 6 añaden `count`, `word-reveal`, `intent` y `magnetic`.
 */
export const REGISTRY: Registry = {
  "text-reveal": { load: () => import("./primitives/text-reveal") },
  build: { load: () => import("./primitives/build") },
  "word-reveal": { load: () => import("./primitives/word-reveal") },
  count: { load: () => import("./primitives/count") },
  // Task 5 y 6 (la escena fijada del capitulo 04 es CSS estatico en motion.css, ver alli). Cada entrada trae su módulo (run y/o css) solo cuando hay un elemento que lo usa.
  card: { load: () => import("./primitives/card") },
  badge: { load: () => import("./primitives/badge") },
  quote: { load: () => import("./primitives/quote") },
  intent: { load: () => import("./primitives/intent") },
  magnetic: { load: () => import("./primitives/magnetic") },
};

/** Titulares y tarjetas que el respaldo de Firefox revela al entrar. */
export const REVEAL_SELECTOR = 'h2[data-motion="text-reveal"], [data-motion="build"]';

export function supportsScrollTimeline(css: { supports(p: string): boolean } | undefined = typeof CSS === "undefined" ? undefined : CSS): boolean {
  try {
    return !!css && css.supports("animation-timeline: view()");
  } catch {
    return false;
  }
}

/** ¿Hay algo que el runtime tenga que hacer en esta página? Si no, ni se pide su chunk. */
export function needsRuntime(root: ParentNode, registry: Registry = REGISTRY, supported = supportsScrollTimeline()): boolean {
  for (const el of root.querySelectorAll<HTMLElement>("[data-motion]")) if (registry[el.dataset.motion ?? ""]) return true;
  return !supported && !!root.querySelector(REVEAL_SELECTOR);
}
