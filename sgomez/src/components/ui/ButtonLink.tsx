import Link from "next/link";
import type { ReactNode } from "react";

const BASE =
  "inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-medium transition-colors";
const VARIANTS = {
  primary: "bg-[color:var(--text)] text-[color:var(--bg)] hover:bg-white",
  ghost: "border border-[color:var(--line)] text-[color:var(--text)] hover:bg-white/5",
} as const;

/** Enlace con aspecto de botón. Interno con Link de Next, externo (http o mailto) con ancla. */
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
  if (/^(https?:|mailto:)/.test(href)) {
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
