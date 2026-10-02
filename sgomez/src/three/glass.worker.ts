import { isSoftwareRenderer } from "@/chapters/lost/media";
import { createGlassScene, type GlassSceneHandle } from "./GlassScene";
import { FRAME_MS, PLACEMENTS, type FailReason, type FromWorker, type GlassId, type ToWorker } from "./protocol";

/** Lo busca `npm run budget` para localizar este chunk. No lo quites. */
export const GLASS_WORKER_MARKER = "sgomez-glass-worker";

type Scope = {
  postMessage(m: FromWorker): void;
  onmessage: ((e: MessageEvent<ToWorker>) => void) | null;
  requestAnimationFrame?: (cb: (t: number) => void) => number;
};
const ctx = self as unknown as Scope;
const post = (m: FromWorker) => ctx.postMessage(m);
const raf = (cb: (t: number) => void) => (ctx.requestAnimationFrame ? ctx.requestAnimationFrame(cb) : setTimeout(() => cb(performance.now()), FRAME_MS));

type Slot = { scene: GlassSceneHandle | null; visible: boolean; frames: number; t0: number };
const slots = new Map<GlassId, Slot>();
const input = { x: 0, y: 0 };
let paused = false;
let running = false;
let last = 0;

function loop(t: number) {
  running = false;
  let any = false;
  const dt = last ? Math.min((t - last) / 1000, 0.05) : 0;
  if (!last || t - last >= FRAME_MS) {
    last = t;
    for (const [id, s] of slots) {
      if (!s.scene || !s.visible) continue;
      s.scene.frame(dt, input, paused);
      s.frames++;
      // el primer fotograma ya está en el lienzo cuando llega el siguiente rAF: avisar entonces
      if (s.frames === 2) post({ type: "ready", id, ms: Math.round(performance.now() - s.t0) });
    }
  }
  for (const s of slots.values()) if (s.scene && s.visible && (!paused || s.frames < 2)) any = true;
  if (any) kick();
}
function kick() {
  if (running) return;
  running = true;
  raf(loop);
}

function fail(id: GlassId, reason: FailReason) {
  slots.get(id)?.scene?.dispose();
  slots.delete(id);
  post({ type: "fail", id, reason });
}

ctx.onmessage = async (e) => {
  const m = e.data;
  switch (m.type) {
    case "init": {
      const slot: Slot = { scene: null, visible: true, frames: 0, t0: performance.now() };
      slots.set(m.id, slot);
      try {
        const gl = m.canvas.getContext("webgl2", { alpha: true, antialias: true, powerPreference: "high-performance" }) as WebGL2RenderingContext | null;
        if (!gl) return fail(m.id, "no-webgl2");
        const info = gl.getExtension("WEBGL_debug_renderer_info");
        const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
        if (!m.force && isSoftwareRenderer(name)) return fail(m.id, "software");
        m.canvas.addEventListener("webglcontextlost", (ev) => {
          ev.preventDefault();
          fail(m.id, "context-lost");
        });
        const scene = await createGlassScene(m.canvas, gl, {
          width: m.width,
          height: m.height,
          dpr: m.dpr,
          profile: m.profile,
          placement: PLACEMENTS[m.id],
          make2d: (w, h) => new OffscreenCanvas(w, h),
        });
        if (slots.get(m.id) !== slot) return scene.dispose();
        slot.scene = scene;
        kick();
      } catch {
        fail(m.id, "error");
      }
      return;
    }
    case "resize": {
      const s = slots.get(m.id);
      s?.scene?.resize(m.width, m.height, m.dpr);
      if (paused) s?.scene?.frame(0, input, true);
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
    case "dispose": {
      slots.get(m.id)?.scene?.dispose();
      slots.delete(m.id);
      return;
    }
  }
};
