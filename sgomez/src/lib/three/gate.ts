import { gatingPasses, isSoftwareRenderer, type Gate } from "@/chapters/lost/media";
import { MOTION_ATTR } from "@/motion/boot";

/** El 3D solo existe desde aquí (spec del 404, §7.1). */
export const LG_QUERY = "(min-width: 64rem)";

type NavigatorExtras = Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };

/** Sonda de WebGL2 en el hilo principal. Solo la usa el 404 mientras su escena viva aquí (la Task 9 la lleva al worker). */
export function probeWebGL2(): { ok: boolean; software: boolean } {
  try {
    const c = document.createElement("canvas");
    const g = c.getContext("webgl2");
    if (!g) return { ok: false, software: false };
    const info = g.getExtension("WEBGL_debug_renderer_info");
    const name = info ? String(g.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    g.getExtension("WEBGL_lose_context")?.loseContext();
    return { ok: true, software: isSoftwareRenderer(name) };
  } catch {
    return { ok: false, software: false };
  }
}

const num = (v: unknown) => (typeof v === "number" && v > 0 ? v : undefined);

/** La puerta del 404, tal cual estaba en LostExperience, más deviceMemory. */
export function readGate(): Gate {
  const nav = navigator as NavigatorExtras;
  const gl = probeWebGL2();
  // Solo para pruebas: un init-script pone este indicador para ejercitar la ruta 3D aunque el Chromium de CI pinte por software.
  const forced = (window as { __LOST_FORCE_GATE__?: boolean }).__LOST_FORCE_GATE__ === true;
  return {
    webgl2: gl.ok,
    software: forced ? false : gl.software,
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: nav.connection?.saveData === true,
    cores: num(nav.hardwareConcurrency),
    deviceMemory: num(nav.deviceMemory),
  };
}

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
