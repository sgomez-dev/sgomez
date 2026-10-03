import type { CSSProperties, ReactNode } from "react";

/**
 * Antetítulo. `motion`: en un capítulo, el espaciado se cierra mientras sube su titular (motion.css).
 * `intro`: orden de entrada en la carga del hero, por tiempo y no por scroll.
 */
export function Eyebrow({ children, className = "", motion = false, intro }: { children: ReactNode; className?: string; motion?: boolean; intro?: number }) {
  return (
    <p
      data-motion={motion ? "eyebrow" : undefined}
      data-intro={intro === undefined ? undefined : ""}
      style={intro === undefined ? undefined : ({ "--k": intro } as CSSProperties)}
      className={`text-[length:var(--step--1)] uppercase tracking-[0.14em] text-[color:var(--text-2)] ${className}`}
    >
      {children}
    </p>
  );
}
