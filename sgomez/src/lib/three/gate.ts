import { gatingPasses } from "@/chapters/lost/media";
import { MOTION_ATTR } from "@/motion/boot";

/** El 3D solo existe desde aquí (spec del 404, §7.1). */
export const LG_QUERY = "(min-width: 64rem)";

type NavigatorExtras = Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };

const num = (v: unknown) => (typeof v === "number" && v > 0 ? v : undefined);

/** Lo que el hilo principal sabe del cristal SIN crear un contexto WebGL (la sonda de WebGL2 y de software la hace el worker). */
export type GlassEnv = {
  lg: boolean;
  offscreen: boolean;
  /** `data-motion-state="on"`: ya incluye movimiento reducido y Save-Data (ver motion/boot.ts). */
  motionOn: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  cores?: number;
  deviceMemory?: number;
  /** Solo pruebas: el worker no descarta el renderizador por software. */
  forced: boolean;
};

export function readGlassEnv(): GlassEnv {
  const nav = navigator as NavigatorExtras;
  return {
    lg: matchMedia(LG_QUERY).matches,
    offscreen: typeof HTMLCanvasElement !== "undefined" && "transferControlToOffscreen" in HTMLCanvasElement.prototype && typeof Worker !== "undefined",
    motionOn: document.documentElement.getAttribute(MOTION_ATTR) === "on",
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: nav.connection?.saveData === true,
    cores: num(nav.hardwareConcurrency),
    deviceMemory: num(nav.deviceMemory),
    forced: (window as { __GLASS_FORCE_GATE__?: boolean }).__GLASS_FORCE_GATE__ === true,
  };
}

/** Escritorio, movimiento permitido, OffscreenCanvas y un equipo capaz. WebGL2 y software los decide el worker. */
export function glassGatePasses(e: GlassEnv): boolean {
  return e.lg && e.offscreen && e.motionOn && gatingPasses({ webgl2: true, software: false, reducedMotion: e.reducedMotion, saveData: e.saveData, cores: e.cores, deviceMemory: e.deviceMemory });
}
