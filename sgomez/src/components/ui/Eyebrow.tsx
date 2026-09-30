import type { ReactNode } from "react";

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-[length:var(--step--1)] uppercase tracking-[0.14em] text-[color:var(--text-2)] ${className}`}>{children}</p>
  );
}
