"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { MOTION_ATTR } from "@/motion/boot";
import { needsOpaqueVideo } from "@/chapters/lost/media";
import { MONOGRAM_SRC } from "@/lib/monogram";

type State = "poster" | "playing" | "done" | "off";
type Idle = (cb: () => void, o?: { timeout: number }) => number;

/**
 * El logotipo de SkyQuetz (children, la `<img>` del servidor) y, con movimiento permitido, un vídeo que lo forma una sola vez
 * al entrar en pantalla. El vídeo acaba en el mismo logotipo, así que al terminar se devuelve el relevo a la `<img>` sin salto.
 * Sin JS, con movimiento reducido o con Save-Data solo existe la `<img>` y no se descarga ningún vídeo.
 *
 * Tras `load` y un hueco ocioso, y a un viewport de distancia, se precarga el vídeo (unos 370 KB). Se reproduce cuando está
 * listo y la mitad del logotipo está a la vista. Mientras suena, la `<img>` se oculta (`opacity`, sigue en el DOM con su `alt`).
 * Safari ignora el alfa del WebM: ahí va el MP4 sobre negro con `mix-blend-mode: screen`.
 *
 * Como en GlassStage y ScrollSequence, el `<video>` lo crea y quita el efecto, no React, para sobrevivir a StrictMode.
 */
export default function MonogramReveal({ children }: { children: ReactNode }) {
  const box = useRef<HTMLSpanElement>(null);
  const [state, setState] = useState<State>("poster");

  useEffect(() => {
    const root = box.current;
    if (!root) return;
    const html = document.documentElement;
    const on = () => html.getAttribute(MOTION_ATTR) === "on";
    if (!on()) return;
    let alive = true;
    let idle = 0;
    let video: HTMLVideoElement | null = null;
    let near: IntersectionObserver | null = null;
    let seen: IntersectionObserver | null = null;
    let ready = false;
    let visible = false;
    let started = false;

    const finish = (s: State) => {
      near?.disconnect();
      seen?.disconnect();
      video?.pause();
      video?.remove();
      video = null;
      if (alive) setState(s);
    };
    const tryPlay = () => {
      if (started || !ready || !visible || !video || !on()) return;
      started = true;
      video.play().catch(() => finish("off"));
    };
    const make = () => {
      const opaque = needsOpaqueVideo(navigator.userAgent, navigator.maxTouchPoints);
      const v = document.createElement("video");
      v.muted = true;
      v.defaultMuted = true;
      v.playsInline = true;
      v.preload = "auto";
      v.disablePictureInPicture = true;
      v.setAttribute("disableremoteplayback", "");
      v.setAttribute("aria-hidden", "true");
      v.tabIndex = -1;
      v.setAttribute("data-monogram-video", "");
      v.className = `pointer-events-none absolute inset-0 h-full w-full opacity-0 group-data-[monogram=playing]:opacity-100 ${opaque ? "mix-blend-screen" : ""}`;
      const list = opaque ? ([["video/mp4", MONOGRAM_SRC.mp4]] as const) : ([["video/webm", MONOGRAM_SRC.webm], ["video/mp4", MONOGRAM_SRC.mp4]] as const);
      const last = list
        .map(([type, url]) => {
          const s = document.createElement("source");
          s.src = url;
          s.type = type;
          v.appendChild(s);
          return s;
        })
        .pop()!;
      v.addEventListener("canplaythrough", () => ((ready = true), tryPlay()), { once: true });
      // Se oculta la <img> solo cuando ya hay un fotograma pintado, para que no haya un hueco.
      v.addEventListener("playing", () => alive && setState("playing"), { once: true });
      v.addEventListener("ended", () => finish("done"), { once: true });
      last.addEventListener("error", () => finish("off"), { once: true });
      v.addEventListener("error", () => finish("off"), { once: true });
      root.appendChild(v);
      v.load();
      return v;
    };
    const arm = () => {
      if (!alive || !on()) return;
      near = new IntersectionObserver(
        ([e]) => {
          if (!e?.isIntersecting) return;
          near?.disconnect();
          video = make();
        },
        { rootMargin: "100% 0px" },
      );
      near.observe(root);
      seen = new IntersectionObserver(
        ([e]) => {
          visible = !!e?.isIntersecting;
          tryPlay();
        },
        { threshold: 0.5 },
      );
      seen.observe(root);
    };
    const w = window as unknown as { requestIdleCallback?: Idle; cancelIdleCallback?: (h: number) => void };
    const schedule = () => {
      idle = w.requestIdleCallback ? w.requestIdleCallback(arm, { timeout: 3000 }) : window.setTimeout(arm, 300);
    };
    if (document.readyState === "complete") schedule();
    else addEventListener("load", schedule, { once: true });
    const mo = new MutationObserver(() => !on() && finish("off"));
    mo.observe(html, { attributes: true, attributeFilter: [MOTION_ATTR] });
    return () => {
      alive = false;
      mo.disconnect();
      near?.disconnect();
      seen?.disconnect();
      removeEventListener("load", schedule);
      if (w.cancelIdleCallback) w.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      video?.pause();
      video?.remove();
    };
  }, []);

  return (
    <span ref={box} data-monogram={state} className="group relative inline-flex data-[monogram=playing]:[&>img]:opacity-0">
      {children}
    </span>
  );
}
