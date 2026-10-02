"use client";

import { useRef, useState } from "react";
import { REEL_SIZE, reelSources } from "@/lib/reels";
import { useLazyMedia } from "@/motion/media/arm";

type State = "poster" | "live" | "off";

/** Solo con puntero fino y hover: en táctil no hay hover ni forma de pausar, y el reel no se reproduce nunca. */
const HOVER_QUERY = "(hover: hover) and (pointer: fine)";

/**
 * El marco del reel de un proyecto. El servidor pinta solo la caja a 16:9 con el póster (el fotograma 0 del vídeo): sin JS,
 * con movimiento reducido, con Save-Data o en táctil es lo único que existe y no se pide ningún vídeo. El reel se reproduce
 * solo a petición (WCAG 2.2.2): con puntero fino y hover, tras `load` y un hueco ocioso y con la ficha a un viewport, se carga
 * el reproductor (import diferido, no cuesta JS inicial) y este crea el `<video>` encima del póster la primera vez que el
 * puntero o el foco entran en la ficha. Al salir se pausa y vuelve al fotograma 0. Decorativo: la ficha es el enlace.
 *
 * Como en GlassStage y ScrollSequence, el elemento lo crea y quita el efecto, no React, para sobrevivir a StrictMode.
 */
export default function ProjectReel({ slug, className = "" }: { slug: string; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<State>("poster");
  const src = reelSources(slug);

  useLazyMedia(
    box,
    (root) => import("@/motion/media/reel-player").then((m) => m.startReel(root, reelSources(slug), { onLive: () => setState("live"), onOff: () => setState("off") })),
    true,
    0,
    () => matchMedia(HOVER_QUERY).matches,
    [slug],
  );

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
