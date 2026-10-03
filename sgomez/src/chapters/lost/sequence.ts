/**
 * Secuencia del 404: de lo estático al vídeo y de ahí a la escena 3D viva.
 * Máquina de estados PURA: no toca el DOM, no mide nada; `LostExperience` le
 * da los eventos y pinta la fase.
 *
 * Escritorio: static, video, scene, idle. Móvil (sin vídeo, L5): static, scene, idle.
 * La capa estática (póster final y enlaces) se queda hasta que la escena avisa
 * de que está lista: nunca hay un escenario en blanco ni un salto.
 */
export type Phase = "static" | "video" | "scene" | "idle";

export type Event =
  | "motionAllowed"
  | "videoEnded"
  | "videoFailed"
  | "sceneReady"
  | "sceneFailed"
  | "pause"
  | "resume"
  /** El relevo ya se hizo y el fundido terminó: la escena corre sola. */
  | "settled";

export type Ctx = {
  sceneReady: boolean;
  /** El vídeo ya llegó a su último fotograma (o ya no se espera). */
  videoEnded?: boolean;
  /** La escena falló: estado final, ya nada la despierta. */
  failed?: boolean;
};

export function next(phase: Phase, event: Event, ctx: Ctx): Phase {
  if (event === "sceneFailed" || ctx.failed) return "static";
  switch (event) {
    case "motionAllowed":
      return phase === "static" ? "video" : phase;
    case "videoEnded":
      return phase === "video" && ctx.sceneReady ? "scene" : phase;
    case "videoFailed":
      // Sin vídeo se queda el layout estático; si la escena ya está, entra.
      return phase === "video" ? (ctx.sceneReady ? "scene" : "static") : phase;
    case "sceneReady":
      // En video espera a que el vídeo acabe (el póster final sostiene el escenario).
      if (phase === "video") return ctx.videoEnded ? "scene" : "video";
      return phase === "static" ? "scene" : phase;
    case "settled":
      return phase === "scene" ? "idle" : phase;
    case "pause":
    case "resume":
      return phase;
  }
}

export type State = { phase: Phase; paused: boolean; sceneReady: boolean; videoEnded: boolean; failed: boolean };

export function initial(): State {
  return { phase: "static", paused: false, sceneReady: false, videoEnded: false, failed: false };
}

/** Reductor: aplica el evento y lleva las banderas que `next` necesita. */
export function step(s: State, event: Event): State {
  const failed = s.failed || event === "sceneFailed";
  const sceneReady = failed ? false : s.sceneReady || event === "sceneReady";
  // Un vídeo que falla ya no se espera: cuenta como terminado.
  const videoEnded = s.videoEnded || event === "videoEnded" || event === "videoFailed";
  const paused = event === "pause" ? true : event === "resume" ? false : s.paused;
  const phase = next(s.phase, event, { sceneReady, videoEnded, failed });
  return { phase, paused, sceneReady, videoEnded, failed };
}
