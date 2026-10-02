import { useEffect, type RefObject } from "react";
import { MOTION_ATTR } from "@/motion/boot";

type Idle = (cb: () => void, o?: { timeout: number }) => number;

/**
 * Arranque de un medio decorativo: espera a `load` y a un hueco ocioso y, si se da una caja, a que esté a un viewport;
 * entonces llama a `run` una vez (con `delay` ms más si se pide). Devuelve la cancelación. Lo comparten ProjectReel, MonogramReveal y HeroLoop (código
 * común en el JS inicial: cada byte cuenta para el tope de 170 KB).
 */
export function armAfterLoad(root: Element | null, run: () => void, delay = 0): () => void {
  let idle = 0;
  let timer = 0;
  let io: IntersectionObserver | null = null;
  const w = window as unknown as { requestIdleCallback?: Idle; cancelIdleCallback?: (h: number) => void };
  const arm = () => {
    if (!root) return run();
    io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        io?.disconnect();
        run();
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(root);
  };
  const schedule = () => {
    const go = () => (delay ? (timer = window.setTimeout(arm, delay)) : arm());
    idle = w.requestIdleCallback ? w.requestIdleCallback(go, { timeout: 3000 }) : window.setTimeout(go, 300);
  };
  if (document.readyState === "complete") schedule();
  else addEventListener("load", schedule, { once: true });
  return () => {
    io?.disconnect();
    removeEventListener("load", schedule);
    if (w.cancelIdleCallback) w.cancelIdleCallback(idle);
    else window.clearTimeout(idle);
    window.clearTimeout(timer);
  };
}

/**
 * Efecto común de ProjectReel, MonogramReveal y HeroLoop: sin movimiento no hace nada; con él, espera (`armAfterLoad`) y
 * pide el reproductor con `start`, cuyo resultado se desmonta al salir. `extra` es una condición más (HeroLoop: no desde lg).
 */
export function useLazyMedia(ref: RefObject<HTMLElement | null>, start: (root: HTMLElement) => Promise<{ dispose(): void }>, near: boolean, delay: number, extra: () => boolean, deps: unknown[]) {
  useEffect(() => {
    const root = ref.current;
    const ok = () => document.documentElement.getAttribute(MOTION_ATTR) === "on" && extra();
    if (!root || !ok()) return;
    let alive = true;
    let handle: { dispose(): void } | null = null;
    const cancel = armAfterLoad(
      near ? root : null,
      () => {
        if (ok())
          start(root)
            .then((h) => (alive && ok() ? (handle = h) : h.dispose()))
            .catch(() => {});
      },
      delay,
    );
    return () => {
      alive = false;
      cancel();
      handle?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
