"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { MOTION_ATTR } from "./boot";
import { needsRuntime } from "./registry";

type Idle = (cb: () => void, opts?: { timeout: number }) => number;

/**
 * Único componente cliente de la fase 2. No pinta nada: tras un hueco ocioso
 * mira si en `<main>` hay algo que el runtime tenga que animar (un `data-motion`
 * registrado o, sin `animation-timeline`, un titular que revelar) y solo
 * entonces importa el runtime. Lo para al cambiar de ruta y cuando el
 * movimiento pasa a `off`. Nav y Footer quedan fuera del alcance.
 */
export default function MotionDirector() {
  const pathname = usePathname();
  useEffect(() => {
    const html = document.documentElement;
    let stop: (() => void) | undefined;
    let alive = true;
    let lc: typeof import("./runtime").lifecycle | undefined;
    const isOn = () => html.getAttribute(MOTION_ATTR) === "on";
    const run = () => {
      const root = document.querySelector("main");
      if (!alive || stop || !isOn() || !root || !needsRuntime(root)) return;
      import("./runtime")
        .then((m) => {
          if (!alive || stop || !isOn()) return;
          lc = m.lifecycle;
          stop = m.start(root);
          lc.emit("afterNavigate");
        })
        .catch(() => {});
    };
    const w = window as unknown as { requestIdleCallback?: Idle; cancelIdleCallback?: (h: number) => void };
    const handle = w.requestIdleCallback ? w.requestIdleCallback(run, { timeout: 2000 }) : window.setTimeout(run, 200);
    const watch = new MutationObserver(() => {
      if (isOn()) run();
      else {
        stop?.();
        stop = undefined;
      }
    });
    watch.observe(html, { attributes: true, attributeFilter: [MOTION_ATTR] });
    return () => {
      alive = false;
      watch.disconnect();
      lc?.emit("beforeNavigate");
      stop?.();
      if (w.cancelIdleCallback) w.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
  }, [pathname]);
  return null;
}
