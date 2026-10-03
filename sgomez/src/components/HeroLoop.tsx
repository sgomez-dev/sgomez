"use client";

import { useRef, useState } from "react";
import { LG_QUERY } from "@/lib/three/gate";
import { useLazyMedia } from "@/motion/media/arm";

type State = "poster" | "live" | "off";

/**
 * Reserva del cristal del hero para quien no tiene el 3D en vivo (por debajo de lg). Va dentro de `GlassStage`, antes del
 * póster SVG (hermano suyo), y encima de él. Sin JS, con movimiento reducido o con Save-Data no existe y no se pide ningún
 * vídeo. Con movimiento permitido, tras `load`, un hueco ocioso y 2 s más (el brillo del póster cruza una vez en ese tiempo y el LCP ya está fijado), se carga el reproductor (import diferido, y nunca desde
 * lg) y empieza un bucle mudo con `preload="none"` que suena en pantalla y se pausa fuera. Mientras suena, el cuerpo del
 * póster se apaga (ver motion.css) y se crea «Pausar movimiento» (dentro del reproductor, para no gastar JS inicial en su marcado), porque el bucle dura más de 5 s (spec §6).
 *
 * El reproductor vuelca los fotogramas a un `<canvas>` y no pone el `<video>` en el documento: ver hero-loop-player.ts.
 * El vídeo lo crea y quita el reproductor, no React (StrictMode).
 */
export default function HeroLoop({ pauseLabel }: { pauseLabel: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<State>("poster");

  useLazyMedia(
    box,
    (root) =>
      import("@/motion/media/hero-loop-player").then((m) => m.startHeroLoop(root, { label: pauseLabel, onLive: () => setState("live"), onOff: () => setState("off") })),
    false,
    2000,
    () => !matchMedia(LG_QUERY).matches,
    [pauseLabel],
  );

  return <div ref={box} data-hero-loop={state} aria-hidden={state === "live" ? undefined : "true"} className="group absolute inset-0 z-[1] lg:hidden" style={{ pointerEvents: "none" }} />;
}
