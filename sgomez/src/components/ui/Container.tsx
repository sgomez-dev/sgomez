import type { ReactNode } from "react";

/** Columna de 1200 px con 16 px de margen en móvil y 32 px desde md. */
export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1200px] px-4 md:px-8 ${className}`}>{children}</div>;
}
