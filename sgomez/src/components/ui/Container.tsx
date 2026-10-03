import type { ReactNode } from "react";

/** Columna de 1200 px con 16 px de margen en móvil y 32 px desde md. */
export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1200px] pl-[max(var(--gutter),var(--safe-left))] pr-[max(var(--gutter),var(--safe-right))] ${className}`}>{children}</div>;
}
