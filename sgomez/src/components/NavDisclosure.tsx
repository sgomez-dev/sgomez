"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * `<details>` del menú móvil. Sin JS funciona igual (abre y cierra con el
 * summary); con JS además se cierra al pulsar un enlace, con Escape y al
 * cambiar de ruta. Solo recibe cadenas y nodos, nunca funciones.
 */
export default function NavDisclosure({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  return (
    <details
      ref={ref}
      className={className}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a")) ref.current?.removeAttribute("open");
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && ref.current?.open) {
          ref.current.open = false;
          ref.current.querySelector("summary")?.focus();
        }
      }}
    >
      {children}
    </details>
  );
}
