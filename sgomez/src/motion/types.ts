/** Contexto que el runtime pasa a cada primitiva. Las Tasks 3 a 7 hablan solo con esto. */
export type Engine = {
  animate: typeof import("motion/mini").animate;
  spring: typeof import("motion").spring;
  stagger: typeof import("motion").stagger;
};

export type ScrollOpts = { axis?: "x" | "y"; offset?: readonly string[] };

export type Ctx = {
  engine: Engine;
  /** Llama a `cb` al entrar `el` en pantalla; `cb` puede devolver una función para la salida. Devuelve el parado. */
  inView(el: Element, cb: (el: Element) => void | ((e?: unknown) => void), opts?: { amount?: number | "some" | "all"; margin?: string }): () => void;
  /** Progreso 0..1 de `target` en el scroll (ScrollTimeline nativo cuando Motion puede). Devuelve el parado. */
  scrollProgress(target: Element, opts: ScrollOpts, cb: (progress: number) => void): () => void;
  /** Tween numérico (Motion mini no anima números). `onUpdate` recibe el valor entero. Devuelve el parado. */
  count(from: number, to: number, opts: { duration?: number; onUpdate: (v: number) => void; onDone?: () => void }): () => void;
  /** Parte el texto de `el` en palabras (spans con `--i`). Conserva `aria-label`; `restore()` deja el DOM como estaba. */
  split(el: HTMLElement, by: "word"): { words: HTMLElement[]; restore: () => void };
  /** Seguimiento del puntero con muelle e inercia. `onMove` recibe el desplazamiento en px. Devuelve el parado, que vuelve a 0. */
  pointer(el: HTMLElement, opts: { strength?: number; onMove: (x: number, y: number) => void }): () => void;
};

/** Engancha el movimiento a un elemento pintado por el servidor. Lo que devuelve lo deja como estaba. */
export type Primitive = (el: HTMLElement, ctx: Ctx) => (() => void) | void;

/**
 * Entrada del registro. `load` trae el módulo de la primitiva solo cuando hay un
 * elemento que la usa; el módulo exporta lo mismo que la entrada (`run`, `fallback`).
 */
export type Entry = {
  run?: Primitive;
  /** Se usa en lugar de `run` donde no hay `animation-timeline` (Firefox). */
  fallback?: Primitive;
  /** Solo tiene `fallback` (el movimiento es CSS estático): el runtime no se pide donde hay `animation-timeline`. */
  fallbackOnly?: boolean;
  load?: () => Promise<Partial<Omit<Entry, "load">>>;
};

export type Registry = Record<string, Entry>;
