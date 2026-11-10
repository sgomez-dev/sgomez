import Link from "next/link";
import type { ReactNode } from "react";

const BASE =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-6 py-2 text-[length:var(--step-0)] font-medium transition-[background-color,box-shadow,transform] duration-300";
const VARIANTS = {
  primary: "bg-[color:var(--text)] text-[color:var(--bg)] shadow-[6px_6px_16px_var(--lo),-6px_-6px_16px_var(--hi)] hover:bg-[color:var(--serif-ink)] active:translate-y-px",
  ghost: "neu-sm neu-press text-[color:var(--text)]",
} as const;

/**
 * Enlace con aspecto de botón. Interno con Link de Next; externo (http o
 * mailto) y ancla de página (`#work`) con `<a>`: el router de Next duplica el
 * fragmento cuando la URL ya lleva uno.
 */
export function ButtonLink({
  href,
  variant = "primary",
  children,
}: {
  href: string;
  variant?: keyof typeof VARIANTS;
  children: ReactNode;
}) {
  const className = `${BASE} ${VARIANTS[variant]}`;
  if (/^(https?:|mailto:|#)/.test(href)) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link prefetch={false} href={href} className={className}>
      {children}
    </Link>
  );
}
