import { GLASS_PROFILE, pointerTarget, type FromWorker, type GlassId, type ToWorker } from "./protocol";

/** Lo busca `npm run budget`. No lo quites. */
export const GLASS_CLIENT_MARKER = "sgomez-glass-client";

/**
 * Lado del hilo principal: UN worker para todos los lienzos, creado al primer
 * montaje y terminado al último desmontaje. Aquí solo hay postMessage: nada de
 * WebGL en este hilo.
 */
type Listener = (m: FromWorker) => void;
let worker: Worker | null = null;
const listeners = new Map<GlassId, Listener>();
let paused = false;
const pauseSubs = new Set<(p: boolean) => void>();
let offPointer: (() => void) | null = null;

type Hooks = { __GLASS_LIVE_WORKERS__?: number };
const live = (d: number) => {
  const w = window as Hooks;
  w.__GLASS_LIVE_WORKERS__ = (w.__GLASS_LIVE_WORKERS__ ?? 0) + d;
};

function send(m: ToWorker, transfer: Transferable[] = []) {
  worker?.postMessage(m, transfer);
}

function getWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL("./glass.worker.ts", import.meta.url), { type: "module", name: GLASS_CLIENT_MARKER });
  live(1);
  worker.onmessage = (e: MessageEvent<FromWorker>) => {
    const m = e.data;
    listeners.get(m.id)?.(m);
  };
  worker.onerror = (ev) => {
    ev.preventDefault();
    listeners.forEach((l, id) => l({ type: "fail", id, reason: "worker" }));
  };
  if (paused) send({ type: "pause", paused });
  return worker;
}

function startPointer() {
  if (offPointer || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  let raf = 0;
  let x = 0;
  let y = 0;
  const move = (e: PointerEvent) => {
    x = e.clientX;
    y = e.clientY;
    if (!raf)
      raf = requestAnimationFrame(() => {
        raf = 0;
        send({ type: "pointer", ...pointerTarget(x, y, innerWidth, innerHeight) });
      });
  };
  const leave = () => send({ type: "pointer", x: 0, y: 0 });
  addEventListener("pointermove", move, { passive: true });
  document.documentElement.addEventListener("pointerleave", leave);
  offPointer = () => {
    removeEventListener("pointermove", move);
    document.documentElement.removeEventListener("pointerleave", leave);
    if (raf) cancelAnimationFrame(raf);
    offPointer = null;
  };
}

const NOOP = { resize() {}, visible() {}, send() {}, dispose() {} };

export function mountGlass(canvas: HTMLCanvasElement, o: { id: GlassId; width: number; height: number; dpr: number; force: boolean }, on: Listener) {
  let off: OffscreenCanvas;
  let w: Worker;
  try {
    // Sin OffscreenCanvas o con el worker bloqueado: se avisa y el póster se queda.
    off = canvas.transferControlToOffscreen();
    w = getWorker();
  } catch {
    queueMicrotask(() => on({ type: "fail", id: o.id, reason: "worker" }));
    return NOOP;
  }
  listeners.set(o.id, on);
  w.postMessage({ type: "init", id: o.id, canvas: off, width: o.width, height: o.height, dpr: o.dpr, profile: GLASS_PROFILE, force: o.force } satisfies ToWorker, [off]);
  startPointer();
  let gone = false;
  return {
    resize: (width: number, height: number, dpr: number) => !gone && send({ type: "resize", id: o.id, width, height, dpr }),
    visible: (v: boolean) => !gone && send({ type: "visible", id: o.id, visible: v }),
    /** Mensajes propios del montaje (el 404 manda su estado y el hero y el contacto no mandan nada). */
    send: (m: ToWorker) => !gone && send(m),
    dispose() {
      if (gone) return;
      gone = true;
      send({ type: "dispose", id: o.id });
      listeners.delete(o.id);
      if (listeners.size === 0) {
        offPointer?.();
        worker?.terminate();
        worker = null;
        live(-1);
      }
    },
  };
}

export const isPaused = () => paused;
export function setPaused(p: boolean) {
  paused = p;
  send({ type: "pause", paused: p });
  pauseSubs.forEach((cb) => cb(p));
}
export function onPaused(cb: (p: boolean) => void) {
  pauseSubs.add(cb);
  return () => void pauseSubs.delete(cb);
}
