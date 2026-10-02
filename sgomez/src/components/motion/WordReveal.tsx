import type { CSSProperties } from "react";
import { wordSpans } from "@/motion/math";

/** Número de palabras, para el `--n` del párrafo que las contiene. */
export function wordRevealStyle(text: string): CSSProperties {
  return { "--n": wordSpans(text).filter((s) => !s.space).length } as CSSProperties;
}

/** Palabra a palabra. En el servidor ya es el texto final; el CSS solo cambia el color. */
export function WordReveal({ text }: { text: string }) {
  let i = 0;
  return (
    <>
      {wordSpans(text).map((s, k) =>
        s.space ? (
          s.word
        ) : (
          <span key={k} data-w="" style={{ "--i": i++ } as CSSProperties}>
            {s.word}
          </span>
        ),
      )}
    </>
  );
}
