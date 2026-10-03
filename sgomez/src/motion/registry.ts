import type { Registry } from "./types";

/**
 * Valor de `data-motion` → entrada (un import() por primitiva): va en el JS inicial y tiene que seguir siendo diminuto.
 * Solo están las primitivas que necesitan JS; el resto del movimiento es CSS estático en motion.css (E5 revisada).
 */
export const REGISTRY: Registry = {
  // Titulares y tarjetas: el movimiento es CSS estático; solo hay respaldo de Firefox.
  "text-reveal": { fallbackOnly: true, load: () => import("./primitives/text-reveal") },
  build: { fallbackOnly: true, load: () => import("./primitives/build") },
  // Con JS de verdad.
  count: { load: () => import("./primitives/count") },
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
  for (const el of root.querySelectorAll<HTMLElement>("[data-motion]")) {
    const entry = registry[el.dataset.motion ?? ""];
    if (entry && (!entry.fallbackOnly || !supported)) return true;
  }
  return !supported && !!root.querySelector(REVEAL_SELECTOR);
}
