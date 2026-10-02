"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { LG_QUERY, glassGatePasses, readGlassEnv } from "@/lib/three/gate";
import { MOTION_ATTR } from "@/motion/boot";
import type { GlassId } from "@/three/protocol";

type State = "poster" | "loading" | "live" | "off";
type Idle = (cb: () => void, o?: { timeout: number }) => number;
type Handle = { resize(w: number, h: number, dpr: number): void; visible(v: boolean): void; dispose(): void };

/**
 * El póster del servidor (children) y, en un escritorio que pasa la puerta, el
 * cristal vivo encima. Recibe solo cadenas e hijos del servidor. La decisión se
 * toma UNA vez por visita: si algo la tumba (cruzar lg, movimiento reducido,
 * fallo del worker) vuelve el póster y ya no se reintenta.
 *
 * El `<canvas>` NO lo pinta React: se crea y se quita dentro del efecto. Un
 * canvas solo puede pasar una vez a `transferControlToOffscreen`, y StrictMode
 * ejecuta cada efecto dos veces (en `next dev` el cristal no aparecería).
 */
export default function GlassStage({ id, pauseLabel, className = "", children }: { id: GlassId; pauseLabel: string; className?: string; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<State>("poster");
  const [paused, setPausedState] = useState(false);
  const client = useRef<typeof import("@/three/glass-client") | null>(null);
  const active = state === "loading" || state === "live";

  // 1. Puerta y arranque: tras load y un hueco ocioso; el contacto además espera a estar a menos de un viewport.
  useEffect(() => {
    if (!glassGatePasses(readGlassEnv())) return;
    let cancelled = false;
    let idle = 0;
    let io: IntersectionObserver | null = null;
    const go = () => {
      if (cancelled) return;
      performance.mark(`glass:start:${id}`);
      setState("loading");
    };
    const near = () => {
      if (id === "hero") return go();
      io = new IntersectionObserver(
        ([e]) => {
          if (e?.isIntersecting) {
            io?.disconnect();
            go();
          }
        },
        { rootMargin: "100% 0px" },
      );
      if (box.current) io.observe(box.current);
    };
    const w = window as unknown as { requestIdleCallback?: Idle; cancelIdleCallback?: (h: number) => void };
    const schedule = () => {
      idle = w.requestIdleCallback ? w.requestIdleCallback(near, { timeout: 3000 }) : window.setTimeout(near, 300);
    };
    if (document.readyState === "complete") schedule();
    else addEventListener("load", schedule, { once: true });
    return () => {
      cancelled = true;
      removeEventListener("load", schedule);
      io?.disconnect();
      if (w.cancelIdleCallback) w.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, [id]);

  // 2. Montaje en el worker. El efecto sobrevive al paso de `loading` a `live` (la dependencia es booleana).
  useEffect(() => {
    const root = box.current;
    if (!active || !root) return;
    const el = document.createElement("canvas");
    el.setAttribute("aria-hidden", "true");
    el.setAttribute("data-glass-canvas", "");
    el.className = "absolute inset-0 h-full w-full";
    root.appendChild(el);

    let handle: Handle | null = null;
    let alive = true;
    let intersecting = true;
    const off = () => {
      handle?.dispose();
      handle = null;
      if (alive) setState("off");
    };
    const size = () => {
      const r = root.getBoundingClientRect();
      return [Math.round(r.width), Math.round(r.height)] as const;
    };
    import("@/three/glass-client")
      .then((c) => {
        if (!alive) return;
        client.current = c;
        setPausedState(c.isPaused());
        const [width, height] = size();
        handle = c.mountGlass(el, { id, width, height, dpr: devicePixelRatio, force: readGlassEnv().forced }, (m) => {
          if (m.type === "ready") {
            performance.mark(`glass:ready:${id}`);
            setState("live");
          } else off();
        });
        // El IntersectionObserver y `document.hidden` pudieron responder antes de que hubiera handle.
        sendVisible();
      })
      .catch(off);

    const ro = new ResizeObserver(([e]) => e && handle?.resize(Math.round(e.contentRect.width), Math.round(e.contentRect.height), devicePixelRatio));
    ro.observe(root);
    const sendVisible = () => handle?.visible(intersecting && !document.hidden);
    const io = new IntersectionObserver(([e]) => {
      intersecting = !!e?.isIntersecting;
      sendVisible();
    });
    io.observe(root);
    document.addEventListener("visibilitychange", sendVisible);
    // Un cambio de DPR (otra pantalla, zoom) no cambia el tamaño CSS: ResizeObserver no avisa. Se vigila aparte.
    let dprQuery: MediaQueryList | null = null;
    const onDpr = () => {
      const [w, h] = size();
      handle?.resize(w, h, devicePixelRatio);
      watchDpr();
    };
    const watchDpr = () => {
      dprQuery?.removeEventListener("change", onDpr);
      dprQuery = matchMedia(`(resolution: ${devicePixelRatio}dppx)`);
      dprQuery.addEventListener("change", onDpr, { once: true });
    };
    watchDpr();
    const lg = matchMedia(LG_QUERY);
    const onLg = () => !lg.matches && off();
    lg.addEventListener("change", onLg);
    const html = document.documentElement;
    const mo = new MutationObserver(() => html.getAttribute(MOTION_ATTR) !== "on" && off());
    mo.observe(html, { attributes: true, attributeFilter: [MOTION_ATTR] });
    return () => {
      alive = false;
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", sendVisible);
      dprQuery?.removeEventListener("change", onDpr);
      lg.removeEventListener("change", onLg);
      handle?.dispose();
      el.remove();
    };
  }, [active, id]);

  // 3. Pausa compartida entre hero y contacto.
  useEffect(() => {
    if (state !== "live" || !client.current) return;
    // La otra escena pudo pausar mientras esta cargaba.
    setPausedState(client.current.isPaused());
    return client.current.onPaused(setPausedState);
  }, [state]);

  return (
    <div ref={box} data-glass={state} className={`relative ${className}`}>
      {children}
      {state === "live" ? (
        <button
          type="button"
          aria-pressed={paused}
          onClick={() => client.current?.setPaused(!paused)}
          className="absolute right-2 top-2 z-10 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/[0.16] bg-[rgba(11,13,20,0.8)] px-4 py-2 text-[length:var(--step--1)] font-medium text-[color:var(--text)] transition-colors hover:border-[color:var(--light-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--light-1)]"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14" className="mr-2 fill-current">
            {paused ? <path d="M4 2.5v11l9-5.5z" /> : <path d="M3.5 2h3v12h-3zm6 0h3v12h-3z" />}
          </svg>
          {pauseLabel}
        </button>
      ) : null}
    </div>
  );
}
