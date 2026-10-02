"use client";

import { useEffect, useRef, useState } from "react";
import { LG_QUERY } from "@/lib/three/gate";
import { MOTION_ATTR } from "@/motion/boot";
import { needsOpaqueVideo } from "@/chapters/lost/media";
import { HERO_LOOP_SRC } from "@/lib/hero-loop";

type State = "poster" | "live" | "off";
type Idle = (cb: () => void, o?: { timeout: number }) => number;

/**
 * Reserva del cristal del hero para quien no tiene el 3D en vivo (por debajo de lg). Va dentro de `GlassStage`, antes del
 * póster SVG (hermano suyo), y encima de él. Sin JS, con movimiento reducido o con Save-Data no existe y no se pide ningún
 * vídeo. Con movimiento permitido, tras `load` y un hueco ocioso, se crea un `<video>` en bucle, mudo y con `preload="none"`
 * que se reproduce en pantalla y se pausa fuera. Mientras suena, el cuerpo del póster se apaga (ver motion.css) y se muestra
 * «Pausar movimiento», porque el bucle dura más de 5 s (spec §6).
 *
 * El `<video>` no se añade al documento y sus fotogramas se copian a un `<canvas>` visible. Medido con Lighthouse: un
 * `<video>` en el DOM (incluso con opacity 0) se convierte en el candidato a LCP al pintar su primer fotograma, y como llega
 * después del retrato (unos 6,5 s simulados frente a 3,3 s), empeoraba el LCP móvil. Un `<canvas>` no es candidato.
 *
 * El vídeo lo crea y quita el efecto, no React (StrictMode). Cruzar a lg o quitar el movimiento lo retira.
 */
export default function HeroLoop({ pauseLabel }: { pauseLabel: string }) {
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement | null>(null);
  const [state, setState] = useState<State>("poster");
  const [paused, setPaused] = useState(false);
  const userPaused = useRef(false);

  useEffect(() => {
    const root = box.current;
    if (!root) return;
    const html = document.documentElement;
    const lg = matchMedia(LG_QUERY);
    const allowed = () => html.getAttribute(MOTION_ATTR) === "on" && !lg.matches;
    if (!allowed()) return;
    let alive = true;
    let idle = 0;
    let io: IntersectionObserver | null = null;
    let intersecting = false;

    const stop = () => {
      io?.disconnect();
      video.current?.pause();
      video.current?.remove();
      video.current = null;
      canvas?.remove();
      canvas = null;
      cancelAnimationFrame(drawing);
      if (alive) setState("off");
    };
    const sync = () => {
      const v = video.current;
      if (!v) return;
      if (intersecting && !document.hidden && !userPaused.current) v.play().catch(() => {});
      else v.pause();
    };
    let canvas: HTMLCanvasElement | null = null;
    let drawing = 0;
    const draw = (v: HTMLVideoElement) => {
      const ctx = canvas?.getContext("2d");
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    };
    const pump = (v: HTMLVideoElement) => {
      const rvfc = (v as HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => number }).requestVideoFrameCallback;
      const tick = () => {
        if (!alive || video.current !== v) return;
        draw(v);
        if (rvfc) rvfc.call(v, tick);
        else drawing = requestAnimationFrame(tick);
      };
      if (rvfc) rvfc.call(v, tick);
      else drawing = requestAnimationFrame(tick);
    };
    const make = () => {
      const opaque = needsOpaqueVideo(navigator.userAgent, navigator.maxTouchPoints);
      const v = document.createElement("video");
      v.muted = true;
      v.defaultMuted = true;
      v.loop = true;
      v.playsInline = true;
      v.preload = "none";
      v.disablePictureInPicture = true;
      v.setAttribute("disableremoteplayback", "");
      v.setAttribute("aria-hidden", "true");
      v.tabIndex = -1;
      v.setAttribute("data-hero-loop-video", "");
      canvas = document.createElement("canvas");
      canvas.width = 720;
      canvas.height = 720;
      canvas.setAttribute("aria-hidden", "true");
      canvas.setAttribute("data-hero-loop-canvas", "");
      canvas.className = `pointer-events-none absolute inset-0 h-full w-full opacity-0 transition-opacity duration-500 group-data-[hero-loop=live]:opacity-100 ${opaque ? "mix-blend-screen" : ""}`;
      const list = opaque ? ([["video/mp4", HERO_LOOP_SRC.mp4]] as const) : ([["video/webm", HERO_LOOP_SRC.webm], ["video/mp4", HERO_LOOP_SRC.mp4]] as const);
      const last = list
        .map(([type, url]) => {
          const s = document.createElement("source");
          s.src = url;
          s.type = type;
          v.appendChild(s);
          return s;
        })
        .pop()!;
      v.addEventListener("playing", () => {
        pump(v);
        // el primer fotograma ya está en el lienzo cuando se enciende
        const on = () => alive && setState("live");
        if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(on);
        else requestAnimationFrame(on);
      }, { once: true });
      last.addEventListener("error", stop, { once: true });
      v.addEventListener("error", stop, { once: true });
      v.addEventListener("play", () => root.setAttribute("data-playing", "true"));
      v.addEventListener("pause", () => root.setAttribute("data-playing", "false"));
      // El <video> NO se añade al documento: una vez pintado, Chrome lo cuenta como candidato a LCP aunque tenga opacity 0.
      root.appendChild(canvas);
      return v;
    };
    const arm = () => {
      if (!alive || !allowed()) return;
      video.current = make();
      io = new IntersectionObserver(([e]) => {
        intersecting = !!e?.isIntersecting;
        sync();
      });
      io.observe(root);
      document.addEventListener("visibilitychange", sync);
    };
    const w = window as unknown as { requestIdleCallback?: Idle; cancelIdleCallback?: (h: number) => void };
    const schedule = () => {
      idle = w.requestIdleCallback ? w.requestIdleCallback(arm, { timeout: 3000 }) : window.setTimeout(arm, 300);
    };
    if (document.readyState === "complete") schedule();
    else addEventListener("load", schedule, { once: true });
    const check = () => !allowed() && stop();
    const mo = new MutationObserver(check);
    mo.observe(html, { attributes: true, attributeFilter: [MOTION_ATTR] });
    lg.addEventListener("change", check);
    return () => {
      alive = false;
      mo.disconnect();
      io?.disconnect();
      lg.removeEventListener("change", check);
      removeEventListener("load", schedule);
      document.removeEventListener("visibilitychange", sync);
      if (w.cancelIdleCallback) w.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      video.current?.pause();
      video.current?.remove();
      video.current = null;
      canvas?.remove();
      cancelAnimationFrame(drawing);
    };
  }, []);

  const toggle = () => {
    userPaused.current = !userPaused.current;
    setPaused(userPaused.current);
    const v = video.current;
    if (!v) return;
    if (userPaused.current) v.pause();
    else v.play().catch(() => {});
  };

  return (
    <div ref={box} data-hero-loop={state} aria-hidden={state === "live" ? undefined : "true"} className="group absolute inset-0 z-[1] lg:hidden" style={{ pointerEvents: "none" }}>
      {state === "live" ? (
        <button
          type="button"
          aria-pressed={paused}
          onClick={toggle}
          style={{ pointerEvents: "auto" }}
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
