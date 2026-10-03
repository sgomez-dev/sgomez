"use client";

import { usePathname } from "next/navigation";
import { PAGES } from "@/lib/routing/pages";
import { isLang, normalizePathname, switchLangHref } from "@/i18n/languages";

/**
 * Selector de idioma. Es cliente porque solo el cliente conoce la ruta actual
 * (el layout no la sabe). Recibe cadenas: `lang` es el idioma actual y `label`
 * el texto del enlace al otro idioma. Sin JS el href apunta a la home del otro
 * idioma y se corrige al hidratar.
 */
export default function LangSwitch({ lang, label, casePaths = [] }: { lang: string; label: string; casePaths?: readonly string[] }) {
  const pathname = usePathname() ?? "/";
  const other = lang === "es" ? "en" : "es";
  if (!isLang(other)) return null;
  const href = switchLangHref(normalizePathname(pathname), other, [...PAGES, ...casePaths]);
  return (
    <a
      href={href}
      hrefLang={other}
      lang={other}
      className="rounded-full border border-[color:var(--line)] inline-flex min-h-11 min-w-11 items-center justify-center px-4 text-sm font-medium text-[color:var(--text)] hover:bg-white/5"
    >
      {label}
    </a>
  );
}
