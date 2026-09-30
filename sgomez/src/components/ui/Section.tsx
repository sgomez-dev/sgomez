import type { ReactNode } from "react";

export function Section({
  id,
  labelledBy,
  children,
  className = "",
}: {
  id: string;
  labelledBy?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={`scroll-mt-20 py-[var(--space-section)] ${className}`}>
      {children}
    </section>
  );
}
