import type { Ctx, Entry, Registry } from "./types";
import { REGISTRY, REVEAL_SELECTOR, supportsScrollTimeline } from "./registry";

/** Lo busca `npm run budget` para localizar este chunk. No lo quites. */
export const MOTION_RUNTIME_MARKER = "sgomez-motion-runtime";

/** Atributo de `<html>` que dice «el runtime está enganchado». El estado previo que dependa de JS cuelga de él. */
export const READY_ATTR = "data-motion-ready";

type Phase = "ready" | "stop" | "beforeNavigate" | "afterNavigate";

/**
 * Ciclo de vida para las primitivas y las transiciones de página (Task 7).
 * `exit` registra una animación de salida; `runExit()` espera a todas.
 */
const hooks: Record<Phase, Set<() => void>> = { ready: new Set(), stop: new Set(), beforeNavigate: new Set(), afterNavigate: new Set() };
const exits = new Set<() => Promise<void> | void>();
export const lifecycle = {
  on(phase: Phase, fn: () => void) {
    hooks[phase].add(fn);
    return () => void hooks[phase].delete(fn);
  },
  emit(phase: Phase) {
    for (const fn of [...hooks[phase]]) {
      try {
        fn();
      } catch {
        // un hook roto no frena a los demás
      }
    }
  },
  exit(fn: () => Promise<void> | void) {
    exits.add(fn);
    return () => void exits.delete(fn);
  },
  async runExit() {
    await Promise.all([...exits].map((fn) => Promise.resolve().then(fn).catch(() => {})));
  },
};

/** Un elemento se engancha una sola vez, aunque `start` o el observador lo vean varias veces. */
const hooked = new WeakMap<Element, () => void>();

let starts = 0;

export type StartOpts = { ctx?: Ctx | Promise<Ctx>; supported?: boolean };

export { REGISTRY };

export function start(root: ParentNode, registry: Registry = REGISTRY, opts: StartOpts = {}): () => void {
  starts++;
  const supported = opts.supported ?? supportsScrollTimeline();
  const html = typeof document === "undefined" ? undefined : document.documentElement;
  if (typeof window !== "undefined") {
    const w = window as { __MOTION_STARTS__?: number; __MOTION_RUNTIME__?: string };
    w.__MOTION_STARTS__ = starts;
    w.__MOTION_RUNTIME__ = MOTION_RUNTIME_MARKER;
  }
  html?.setAttribute(READY_ATTR, "");

  const mine = new Set<Element>();
  const cssByKey = new Map<string, string>();
  let styleEl: HTMLStyleElement | undefined;
  let ctxP: Promise<Ctx> | undefined;
  let alive = true;
  const getCtx = () => (ctxP ??= Promise.resolve(opts.ctx ?? import("./ctx").then((m) => m.createCtx())));

  const addCss = (key: string, css: string | undefined) => {
    if (!css || !supported || cssByKey.has(key) || typeof document === "undefined") return;
    cssByKey.set(key, css);
    styleEl ??= Object.assign(document.createElement("style"), { textContent: "" });
    styleEl.setAttribute("data-motion-css", "");
    styleEl.textContent = [...cssByKey.values()].join("\n");
    if (!styleEl.isConnected) document.head.append(styleEl);
  };

  const hook = async (el: HTMLElement, entry: Entry) => {
    const claim = () => {};
    hooked.set(el, claim);
    mine.add(el);
    try {
      const mod = entry.load ? await entry.load() : {};
      if (!alive || hooked.get(el) !== claim) return;
      const e = { ...entry, ...mod };
      addCss(el.dataset.motion ?? "", e.css);
      const fn = supported ? e.run : (e.fallback ?? e.run);
      if (!fn) return;
      const stop = fn(el, await getCtx());
      if (!alive || hooked.get(el) !== claim) {
        stop?.();
        return;
      }
      if (stop) hooked.set(el, () => stop());
    } catch {
      // una primitiva rota deja su elemento en el estado del servidor y no apaga a las demás
    }
  };

  const scan = (node: ParentNode & Partial<Element>) => {
    const all: HTMLElement[] = [...node.querySelectorAll<HTMLElement>("[data-motion]")];
    if (node.hasAttribute?.("data-motion")) all.unshift(node as HTMLElement);
    const reveal: HTMLElement[] = [];
    for (const el of all) {
      if (hooked.has(el)) continue;
      const entry = registry[el.dataset.motion ?? ""];
      if (entry) void hook(el, entry);
      else if (!supported && el.matches(REVEAL_SELECTOR)) reveal.push(el);
    }
    // Firefox y compañía: revelado ligero al entrar (E2), por primitiva: se salta lo registrado.
    if (reveal.length) {
      void import("./reveal-fallback")
        .then((m) => {
          if (!alive) return;
          const stop = m.revealOnEnter(reveal);
          for (const el of reveal) {
            hooked.set(el, stop);
            mine.add(el);
          }
        })
        .catch(() => {});
    }
  };

  const release = (el: Element) => {
    const stop = hooked.get(el);
    hooked.delete(el);
    mine.delete(el);
    stop?.();
  };

  scan(root as ParentNode & Partial<Element>);

  // Contenido que llega después de `start` (cargas diferidas, streaming).
  const mo =
    typeof MutationObserver === "undefined"
      ? undefined
      : new MutationObserver((records) => {
          for (const r of records) {
            r.addedNodes.forEach((n) => n.nodeType === 1 && scan(n as Element));
            r.removedNodes.forEach((n) => {
              if (n.nodeType !== 1) return;
              release(n as Element);
              (n as Element).querySelectorAll("[data-motion]").forEach(release);
            });
          }
        });
  if (mo && "nodeType" in root) mo.observe(root as Node, { childList: true, subtree: true });

  lifecycle.emit("ready");

  return () => {
    if (!alive) return;
    alive = false;
    mo?.disconnect();
    for (const el of [...mine]) release(el);
    styleEl?.remove();
    html?.removeAttribute(READY_ATTR);
    lifecycle.emit("stop");
  };
}
