import { isSoftwareRenderer } from "@/chapters/lost/media";
import { createGlassScene, type GlassSceneHandle } from "./GlassScene";
import { createConstellationScene, type ConstellationHandle, type ConstellationState } from "./ConstellationScene";
import { FRAME_MS, PLACEMENTS, type FailReason, type FromWorker, type GlassId, type ToWorker } from "./protocol";

/** Lo busca `npm run budget` para localizar este chunk. No lo quites. */
export const GLASS_WORKER_MARKER = "sgomez-glass-worker";

type Scope = {
  postMessage(m: FromWorker, transfer?: Transferable[]): void;
  onmessage: ((e: MessageEvent<ToWorker>) => void) | null;
  requestAnimationFrame?: (cb: (t: number) => void) => number;
};
const ctx = self as unknown as Scope;
const post = (m: FromWorker, transfer?: Transferable[]) => ctx.postMessage(m, transfer);
const raf = (cb: (t: number) => void) => (ctx.requestAnimationFrame ? ctx.requestAnimationFrame(cb) : setTimeout(() => cb(performance.now()), FRAME_MS));

type Slot = {
  scene: GlassSceneHandle | null;
  /** Solo el 404: la misma escena, con su estado y sus desplazamientos. */
  lost: ConstellationHandle | null;
  /** El estado del 404 que llegó antes de que la escena existiera. */
  pending: ConstellationState | null;
  visible: boolean;
  frames: number;
  t0: number;
  w: number;
  h: number;
  dpr: number;
};
const slots = new Map<GlassId, Slot>();
const input = { x: 0, y: 0 };
let paused = false;
let running = false;
let last = 0;

/** Pinta un fotograma y, en el 404, manda a los enlaces cuánto se ha movido cada fragmento (copia transferida). */
function draw(s: Slot, dt: number, pausedNow: boolean) {
  s.scene!.frame(dt, input, pausedNow);
  if (s.lost) {
    const offsets = s.lost.offsets().slice();
    post({ type: "project", id: "lost", offsets }, [offsets.buffer]);
  }
}

/** El 404 solo pide fotograma si anima, si un brillo se asienta o si cambió de estado; el cristal entero, mientras no esté en pausa. */
const wants = (s: Slot) => s.frames < 2 || (s.lost ? s.lost.wants(paused) : !paused);

function loop(t: number) {
  running = false;
  let any = false;
  const dt = last ? Math.min((t - last) / 1000, 0.05) : 0;
  if (!last || t - last >= FRAME_MS) {
    last = t;
    for (const [id, s] of slots) {
      if (!s.scene || !s.visible) continue;
      if (s.lost && !wants(s)) continue;
      draw(s, dt, paused);
      s.frames++;
      // el primer fotograma ya está en el lienzo cuando llega el siguiente rAF: avisar entonces
      if (s.frames === 2) post({ type: "ready", id, ms: Math.round(performance.now() - s.t0) });
    }
  }
  for (const s of slots.values()) if (s.scene && s.visible && wants(s)) any = true;
  if (any) kick();
}
function kick() {
  if (running) return;
  running = true;
  raf(loop);
}

/** Solo actua si el hueco sigue siendo el mismo: un fallo tardio de un montaje viejo no debe tirar el nuevo. */
function fail(id: GlassId, reason: FailReason, slot: Slot) {
  if (slots.get(id) !== slot) return;
  slot.scene?.dispose();
  slots.delete(id);
  post({ type: "fail", id, reason });
}

ctx.onmessage = async (e) => {
  const m = e.data;
  switch (m.type) {
    case "init": {
      const slot: Slot = { scene: null, lost: null, pending: null, visible: true, frames: 0, t0: performance.now(), w: m.width, h: m.height, dpr: m.dpr };
      slots.set(m.id, slot);
      try {
        const gl = m.canvas.getContext("webgl2", { alpha: true, antialias: true, powerPreference: "high-performance" }) as WebGL2RenderingContext | null;
        if (!gl) return fail(m.id, "no-webgl2", slot);
        const info = gl.getExtension("WEBGL_debug_renderer_info");
        const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
        if (!m.force && isSoftwareRenderer(name)) return fail(m.id, "software", slot);
        m.canvas.addEventListener("webglcontextlost", (ev) => {
          ev.preventDefault();
          fail(m.id, "context-lost", slot);
        });
        const make2d = (w: number, h: number) => new OffscreenCanvas(w, h);
        const dims = { width: slot.w, height: slot.h, dpr: slot.dpr, profile: m.profile, make2d };
        let scene: GlassSceneHandle;
        let lost: ConstellationHandle | null = null;
        if (m.id === "lost") scene = lost = await createConstellationScene(m.canvas, gl, dims);
        else scene = await createGlassScene(m.canvas, gl, { ...dims, placement: PLACEMENTS[m.id] });
        if (slots.get(m.id) !== slot) return scene.dispose();
        slot.scene = scene;
        slot.lost = lost;
        if (slot.pending) lost?.set(slot.pending);
        // un resize que llego durante el arranque ya estaba guardado en el hueco: se aplica ahora
        if (slot.w !== m.width || slot.h !== m.height || slot.dpr !== m.dpr) scene.resize(slot.w, slot.h, slot.dpr);
        kick();
      } catch {
        fail(m.id, "error", slot);
      }
      return;
    }
    case "resize": {
      const s = slots.get(m.id);
      if (s) {
        s.w = m.width;
        s.h = m.height;
        s.dpr = m.dpr;
      }
      s?.scene?.resize(m.width, m.height, m.dpr);
      if (paused && s?.scene) draw(s, 0, true);
      return;
    }
    case "visible": {
      const s = slots.get(m.id);
      if (s) s.visible = m.visible;
      kick();
      return;
    }
    case "pointer":
      input.x = m.x;
      input.y = m.y;
      return;
    case "pause":
      paused = m.paused;
      kick();
      return;
    case "lost": {
      const st = { live: m.live, highlightId: m.highlightId, linesOn: m.linesOn };
      const s = slots.get("lost");
      if (s) {
        s.pending = st;
        s.lost?.set(st);
      }
      kick();
      return;
    }
    case "dispose": {
      slots.get(m.id)?.scene?.dispose();
      slots.delete(m.id);
      return;
    }
  }
};
