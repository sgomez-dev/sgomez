import type { CSSProperties, ReactNode } from "react";

export function Section({
  id,
  labelledBy,
  children,
  className = "",
  dataAttrs,
  style,
}: {
  id: string;
  labelledBy?: string;
  children: ReactNode;
  className?: string;
  /** Atributos `data-*` extra, p. ej. `data-pin` en la experiencia. */
  dataAttrs?: Record<`data-${string}`, string>;
  style?: CSSProperties;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} {...dataAttrs} style={style} className={`scroll-mt-[calc(4rem+var(--safe-top))] py-[var(--space-section)] ${className}`}>
      {children}
    </section>
  );
}
