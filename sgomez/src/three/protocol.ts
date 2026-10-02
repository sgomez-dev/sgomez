import type { GlassProfile } from "./glass-kit";

/** Mensajes entre el hilo principal y el worker del cristal. Sin imports de valor: lo importan los dos lados. */
export type GlassId = "hero" | "contact" | "lost";
export type FailReason = "no-webgl2" | "software" | "context-lost" | "error" | "worker";

export type ToWorker =
  | { type: "init"; id: GlassId; canvas: OffscreenCanvas; width: number; height: number; dpr: number; profile: GlassProfile; force: boolean }
  | { type: "resize"; id: GlassId; width: number; height: number; dpr: number }
  | { type: "visible"; id: GlassId; visible: boolean }
  | { type: "pointer"; x: number; y: number }
  | { type: "pause"; paused: boolean }
  | { type: "lost"; live: boolean; highlightId: string; linesOn: boolean }
  | { type: "dispose"; id: GlassId };

export type FromWorker =
  | { type: "ready"; id: GlassId; ms: number }
  | { type: "fail"; id: GlassId | "*"; reason: FailReason }
  /** Solo el 404: pares `dx, dy` en px del centro de cada fragmento con enlace respecto a su reposo, en el orden de `PROJECTED_IDS`. */
  | { type: "project"; id: "lost"; offsets: Float32Array };

/**
 * Los fragmentos del 404 que son enlaces, en el orden de `SHARDS`. Va a mano para que el cliente no arrastre los datos de
 * `shards.ts`; `tests/glass-protocol.test.ts` comprueba que coincide.
 */
export const PROJECTED_IDS: readonly string[] = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"];

/** Tope de 30 fps, como el 404. */
export const FRAME_MS = 33;

/**
 * Perfil de material. Lo fija la Task 5 (Step 7) con lo medido: "full" si el primer
 * fotograma llega en 1500 ms o menos y el hilo principal no pierde fotogramas de más de 100 ms;
 * si no, "lite".
 */
export const GLASS_PROFILE: GlassProfile = "full";

/** Centro del cristal en % de su caja (el mismo sitio que el blob de GlassPoster), profundidad, escala y pose de reposo. */
export type Placement = { left: number; top: number; z: number; scale: number; rest: { rx: number; ry: number; rz: number } };

/** Solo el cristal entero (hero y contacto); el 404 tiene su propia escena (`ConstellationScene.ts`). */
export const PLACEMENTS: Record<"hero" | "contact", Placement> = {
  // Reposo casi frontal: los 18° del póster ya van en la silueta y una pose más girada enseñaba la pared lateral.
  hero: { left: 63.6, top: 42.1, z: 0, scale: 0.985, rest: { rx: -0.1, ry: 0.12, rz: 0 } },
  contact: { left: 63.0, top: 42.1, z: 0, scale: 0.972, rest: { rx: 0.1, ry: -0.12, rz: 0 } },
};

const clamp = (v: number) => Math.min(1, Math.max(-1, v));
export function pointerTarget(clientX: number, clientY: number, w: number, h: number): { x: number; y: number } {
  return { x: clamp((clientX / Math.max(1, w) - 0.5) * 2), y: clamp((clientY / Math.max(1, h) - 0.5) * 2) };
}
