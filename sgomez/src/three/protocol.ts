import type { GlassProfile } from "./glass-kit";

/** Mensajes entre el hilo principal y el worker del cristal. Sin imports de valor: lo importan los dos lados. */
export type GlassId = "hero" | "contact";
export type FailReason = "no-webgl2" | "software" | "context-lost" | "error" | "worker";

export type ToWorker =
  | { type: "init"; id: GlassId; canvas: OffscreenCanvas; width: number; height: number; dpr: number; profile: GlassProfile; force: boolean }
  | { type: "resize"; id: GlassId; width: number; height: number; dpr: number }
  | { type: "visible"; id: GlassId; visible: boolean }
  | { type: "pointer"; x: number; y: number }
  | { type: "pause"; paused: boolean }
  | { type: "dispose"; id: GlassId };

export type FromWorker = { type: "ready"; id: GlassId; ms: number } | { type: "fail"; id: GlassId | "*"; reason: FailReason };

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

/** Solo el cristal entero (hero y contacto); el 404 de la Task 9 tiene su propia escena. */
export const PLACEMENTS: Record<"hero" | "contact", Placement> = {
  hero: { left: 59.5, top: 41.5, z: 0, scale: 0.95, rest: { rx: -0.32, ry: 0.42, rz: 0.12 } },
  contact: { left: 59.5, top: 41.5, z: 0, scale: 0.9, rest: { rx: 0.28, ry: -0.5, rz: -0.18 } },
};

const clamp = (v: number) => Math.min(1, Math.max(-1, v));
export function pointerTarget(clientX: number, clientY: number, w: number, h: number): { x: number; y: number } {
  return { x: clamp((clientX / Math.max(1, w) - 0.5) * 2), y: clamp((clientY / Math.max(1, h) - 0.5) * 2) };
}
