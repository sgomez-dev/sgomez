"use client";

import { useEffect, useRef, useState } from "react";
import { MOTION_ATTR } from "@/motion/boot";
import { REEL_SIZE, reelSources } from "@/lib/reels";

type State = "poster" | "live" | "off";
type Idle = (cb: () => void, o?: { timeout: number }) => number;

/**
 * El marco del reel de un proyecto. El servidor pinta solo la caja a 16:9 con el póster (el fotograma 0 del vídeo): sin JS,
 * con movimiento reducido o con Save-Data es lo único que existe y no se pide ningún vídeo. Con movimiento permitido, tras
 * `load` y un hueco ocioso, y solo la primera vez que la caja entra en pantalla, se crea el `<video>` (`preload="none"`, sin
 * audio, en bucle) encima del póster. Se reproduce en pantalla y se pausa fuera. Es decorativo: la ficha es el enlace de al lado.
 *
 * Como en GlassStage y ScrollSequence, el elemento lo crea y quita el efecto, no React, para sobrevivir a StrictMode.
 */
export default function ProjectReel({ slug, className = "" }: { slug: string; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<State>("poster");
  const src = reelSources(slug);

  useEffect(() => {
    const root = box.current;
    if (!root) return;
    const html = document.documentElement;
    const on = () => html.getAttribute(MOTION_ATTR) === "on";
    if (!on()) return;
    let alive = true;
    let idle = 0;
    let io: IntersectionObserver | null = null;
    let video: HTMLVideoElement | null = null;
    let seen = false;
    let intersecting = false;

    const stop = () => {
      video?.pause();
      video?.remove();
      video = null;
      if (alive) setState("off");
    };
    const make = () => {
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
      v.poster = src.poster;
      v.setAttribute("data-reel-video", "");
      v.className = "absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-data-[reel=live]:opacity-100";
      const last = [["video/webm", src.webm], ["video/mp4", src.mp4]].map(([type, url]) => {
        const s = document.createElement("source");
        s.src = url!;
        s.type = type!;
        v.appendChild(s);
        return s;
      }).pop()!;
      v.addEventListener("playing", () => alive && setState("live"), { once: true });
      // Un fallo de la primera fuente solo hace probar la siguiente: se abandona cuando falla la última.
      last.addEventListener("error", stop, { once: true });
      v.addEventListener("error", stop, { once: true });
      root.appendChild(v);
      return v;
    };
    const visible = (v: boolean) => {
      if (!v || document.hidden || !on()) return void video?.pause();
      if (!video) video = make();
      video.play().catch(() => {});
    };
    const onVis = () => seen && visible(intersecting);
    const arm = () => {
      if (!alive || !on()) return;
      io = new IntersectionObserver(([e]) => {
        intersecting = !!e?.isIntersecting;
        if (intersecting) seen = true;
        if (seen) visible(intersecting);
      });
      io.observe(root);
      document.addEventListener("visibilitychange", onVis);
    };
    const w = window as unknown as { requestIdleCallback?: Idle; cancelIdleCallback?: (h: number) => void };
    const schedule = () => {
      idle = w.requestIdleCallback ? w.requestIdleCallback(arm, { timeout: 3000 }) : window.setTimeout(arm, 300);
    };
    if (document.readyState === "complete") schedule();
    else addEventListener("load", schedule, { once: true });
    const mo = new MutationObserver(() => !on() && stop());
    mo.observe(html, { attributes: true, attributeFilter: [MOTION_ATTR] });
    return () => {
      alive = false;
      mo.disconnect();
      io?.disconnect();
      removeEventListener("load", schedule);
      document.removeEventListener("visibilitychange", onVis);
      if (w.cancelIdleCallback) w.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      video?.pause();
      video?.remove();
    };
  }, [src.mp4, src.poster, src.webm]);

  return (
    <div
      ref={box}
      data-reel={state}
      data-reel-slug={slug}
      data-motion="reel"
      aria-hidden="true"
      style={{ aspectRatio: `${REEL_SIZE.width} / ${REEL_SIZE.height}` }}
      className={`group relative w-full overflow-hidden rounded-[8px] border border-[color:var(--line)] bg-[color:var(--bg-2)] ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- póster decorativo ya optimizado en el render, sin optimizador */}
      <img src={src.poster} alt="" width={REEL_SIZE.width} height={REEL_SIZE.height} loading="lazy" decoding="async" className="block h-full w-full object-cover" />
    </div>
  );
}
