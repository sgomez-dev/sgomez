"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { MOTION_ATTR } from "./boot";

type Idle = (cb: () => void, opts?: { timeout: number }) => number;

/**
 * Único componente cliente de la fase 2. No pinta nada: tras un hueco ocioso
 * importa el runtime (chunk aparte) y lo engancha a los `data-motion` de la
 * página. Lo para al cambiar de ruta y cuando el movimiento pasa a `off`.
 */
export default function MotionDirector() {
  const pathname = usePathname();
  useEffect(() => {
    const html = document.documentElement;
    let stop: (() => void) | undefined;
    let alive = true;
    const isOn = () => html.getAttribute(MOTION_ATTR) === "on";
    const run = () => {
      if (!alive || stop || !isOn()) return;
      import("./runtime")
        .then((m) => {
          if (alive && !stop && isOn()) stop = m.start(document);
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
      stop?.();
      if (w.cancelIdleCallback) w.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
  }, [pathname]);
  return null;
}
