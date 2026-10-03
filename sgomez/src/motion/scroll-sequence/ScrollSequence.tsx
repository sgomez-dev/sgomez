"use client";

import { useEffect, useRef, useState } from "react";
import { LG_QUERY, readGlassEnv } from "@/lib/three/gate";
import { MOTION_ATTR } from "@/motion/boot";
import type { SequenceManifest } from "./manifest";

type State = "poster" | "loading" | "live" | "off";
type Idle = (cb: () => void, o?: { timeout: number }) => number;

/**
 * El póster (el último fotograma) va en el SSR, con la caja ya a su proporción: sin JS, con movimiento reducido o con
 * Save-Data es lo único que existe y no se pide ningún fotograma. Si pasa la puerta, tras `load` y un hueco ocioso, y al
 * estar a un viewport de la sección, se carga el reproductor (import diferido) y un `<canvas>` en la misma caja pinta el
 * fotograma que toca según el scroll. Decorativo: el contenido real es el DOM de al lado.
 *
 * Como en GlassStage, el canvas lo crea y quita el efecto, no React, para sobrevivir al doble efecto de StrictMode.
 */
export default function ScrollSequence({ manifest, className = "", trackSelector }: { manifest: SequenceManifest; className?: string; trackSelector?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<State>("poster");
  const active = state === "loading" || state === "live";

  // 1. Puerta y arranque: al estar a un viewport de la sección, tras load y un hueco ocioso.
  useEffect(() => {
    let cancelled = false;
    let idle = 0;
    let gate: typeof import("./player") | null = null;
    const go = () => {
      if (!cancelled && gate && gate.sequenceGatePasses(readGlassEnv())) setState("loading");
    };
    const w = window as unknown as { requestIdleCallback?: Idle; cancelIdleCallback?: (h: number) => void };
    const schedule = () => {
      // La puerta se decide con el entorno de AHORA (el atributo de movimiento ya está puesto por el script del head).
      import("./player").then((m) => {
        gate = m;
        idle = w.requestIdleCallback ? w.requestIdleCallback(go, { timeout: 3000 }) : window.setTimeout(go, 300);
      });
    };
    const arm = () => {
      if (document.readyState === "complete") schedule();
      else addEventListener("load", schedule, { once: true });
    };
    // El chunk del reproductor solo se pide cuando la caja está a un viewport: lejos no cuesta ni un byte de JS.
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        io.disconnect();
        arm();
      },
      { rootMargin: "100% 0px" },
    );
    if (box.current) io.observe(box.current);
    return () => {
      cancelled = true;
      io.disconnect();
      removeEventListener("load", schedule);
      if (w.cancelIdleCallback) w.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, []);

  // 2. Montaje del reproductor. Cruzar lg cambia de tamaño de secuencia; quitar el movimiento lo apaga para siempre.
  useEffect(() => {
    const root = box.current;
    if (!active || !root) return;
    const el = document.createElement("canvas");
    el.setAttribute("aria-hidden", "true");
    el.setAttribute("data-sequence-canvas", "");
    el.className = "absolute inset-0 h-full w-full";
    root.appendChild(el);

    let alive = true;
    let player: { dispose(): void } | null = null;
    let mod: typeof import("./player") | null = null;
    const off = () => {
      player?.dispose();
      player = null;
      if (alive) setState("off");
    };
    const lg = matchMedia(LG_QUERY);
    const mount = () => {
      player?.dispose();
      if (!mod) return;
      player = mod.createPlayer({
        root,
        canvas: el,
        manifest,
        size: lg.matches ? "desktop" : "mobile",
        // Desde lg la caja va pegajosa dentro de un capítulo alto: el progreso es el del capítulo.
        track: lg.matches && trackSelector ? document.querySelector<HTMLElement>(trackSelector) : null,
        onLive: () => alive && setState("live"),
        onFail: off,
      });
    };
    import("./player")
      .then((m) => {
        if (!alive) return;
        mod = m;
        mount();
      })
      .catch(off);
    lg.addEventListener("change", mount);
    const html = document.documentElement;
    const mo = new MutationObserver(() => html.getAttribute(MOTION_ATTR) !== "on" && off());
    mo.observe(html, { attributes: true, attributeFilter: [MOTION_ATTR] });
    return () => {
      alive = false;
      mo.disconnect();
      lg.removeEventListener("change", mount);
      player?.dispose();
      el.remove();
    };
  }, [active, manifest, trackSelector]);

  return (
    <div
      ref={box}
      data-sequence={state}
      data-sequence-id={manifest.id}
      aria-hidden="true"
      style={{ aspectRatio: `${manifest.width} / ${manifest.height}` }}
      className={`group relative w-full overflow-hidden ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- póster decorativo ya optimizado en el render, sin optimizador */}
      <img src={manifest.poster} alt="" width={manifest.width} height={manifest.height} loading="lazy" decoding="async" className="block h-full w-full object-cover group-data-[sequence=live]:opacity-0" />
    </div>
  );
}
