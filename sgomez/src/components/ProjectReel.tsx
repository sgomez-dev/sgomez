"use client";

import { useRef, useState } from "react";
import { REEL_SIZE, reelSources } from "@/lib/reels";
import { useLazyMedia } from "@/motion/media/arm";

type State = "poster" | "live" | "off";

/**
 * El marco del reel de un proyecto. El servidor pinta solo la caja a 16:9 con el póster (el fotograma 0 del vídeo): sin JS,
 * con movimiento reducido o con Save-Data es lo único que existe y no se pide ningún vídeo. Con movimiento permitido, tras
 * `load` y un hueco ocioso, y cuando la ficha está a un viewport, se carga el reproductor (import diferido, no cuesta JS
 * inicial) que crea el `<video>` encima del póster la primera vez que entra en pantalla. Decorativo: la ficha es el enlace.
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
    () => true,
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
