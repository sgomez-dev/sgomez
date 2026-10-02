"use client";

import { useRef, useState, type ReactNode } from "react";
import { useLazyMedia } from "@/motion/media/arm";

type State = "poster" | "playing" | "done" | "off";

/**
 * El logotipo de SkyQuetz (children, la `<img>` del servidor) y, con movimiento permitido, un vídeo que lo forma una sola vez
 * al entrar en pantalla. El vídeo acaba en el mismo logotipo, así que al terminar se devuelve el relevo a la `<img>` sin salto.
 * Sin JS, con movimiento reducido o con Save-Data solo existe la `<img>` y no se descarga ningún vídeo.
 *
 * Tras `load` y un hueco ocioso, y a un viewport de distancia, se carga el reproductor (import diferido: no cuesta JS
 * inicial) y este precarga el vídeo (unos 370 KB). Mientras suena, la `<img>` se oculta con `opacity` (sigue en el DOM con su
 * `alt`). Como en GlassStage y ScrollSequence, el `<video>` lo crea y quita el efecto, no React, para sobrevivir a StrictMode.
 */
export default function MonogramReveal({ children }: { children: ReactNode }) {
  const box = useRef<HTMLSpanElement>(null);
  const [state, setState] = useState<State>("poster");

  useLazyMedia(
    box,
    (root) => import("@/motion/media/monogram-player").then((m) => m.startMonogram(root, { onPlaying: () => setState("playing"), onDone: () => setState("done"), onOff: () => setState("off") })),
    true,
    0,
    () => true,
    [],
  );

  return (
    <span ref={box} data-monogram={state} className="group relative inline-flex data-[monogram=playing]:[&>img]:opacity-0">
      {children}
    </span>
  );
}
