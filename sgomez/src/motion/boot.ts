export const MOTION_ATTR = "data-motion-state";
export type MotionState = "on" | "off";

export function motionStateFor(env: { reducedMotion: boolean; saveData: boolean }): MotionState {
  return env.reducedMotion || env.saveData ? "off" : "on";
}

/**
 * Va en línea en el <head> y corre antes del primer pintado: el CSS de movimiento
 * cuelga de este atributo, así que nunca hay un fotograma con el estado equivocado.
 * Sin JS no se ejecuta y no hay atributo, luego no hay animación (spec §6).
 */
export const MOTION_BOOT_SCRIPT = `(function(){try{var d=document.documentElement,m=matchMedia("(prefers-reduced-motion: reduce)"),c=navigator.connection,s=function(){d.setAttribute("${MOTION_ATTR}",m.matches||(c&&c.saveData)?"off":"on")};s();m.addEventListener("change",s)}catch(e){}})();`;
