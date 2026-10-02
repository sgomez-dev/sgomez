import type { Primitive } from "./types";
import { supportsScrollTimeline } from "./reveal-fallback";

export * as engine from "./engine";

/** Lo busca `npm run budget` para medir este chunk. No lo quites. */
export const MOTION_RUNTIME_MARKER = "sgomez-motion-runtime";

/** Valor de `data-motion` → primitiva JS. Lo que no está aquí lo anima solo el CSS. */
export const REGISTRY: Record<string, Primitive> = {};

let starts = 0;

export function start(root: ParentNode, registry: Record<string, Primitive> = REGISTRY): () => void {
  starts++;
  if (typeof window !== "undefined") {
    const w = window as { __MOTION_STARTS__?: number; __MOTION_RUNTIME__?: string };
    w.__MOTION_STARTS__ = starts;
    w.__MOTION_RUNTIME__ = MOTION_RUNTIME_MARKER;
  }
  const stops: (() => void)[] = [];
  let alive = true;
  for (const el of root.querySelectorAll<HTMLElement>("[data-motion]")) {
    const primitive = registry[el.dataset.motion ?? ""];
    if (!primitive) continue;
    try {
      const stop = primitive(el);
      if (stop) stops.push(stop);
    } catch {
      // una primitiva rota deja su elemento en el estado del servidor y no apaga a las demás
    }
  }
  // Firefox y compañía: sin animation-timeline, revelado ligero al entrar (enmienda E2).
  if (typeof CSS !== "undefined" && typeof IntersectionObserver !== "undefined" && !supportsScrollTimeline(CSS)) {
    import("./reveal-fallback")
      .then((m) => {
        if (alive) stops.push(m.revealOnEnter(root.querySelectorAll<HTMLElement>(m.REVEAL_SELECTOR)));
      })
      .catch(() => {});
  }
  return () => {
    alive = false;
    for (const stop of stops.splice(0)) stop();
  };
}
