import Link from "next/link";
import { getDictionary } from "@/i18n";
import { localizedPath, type Lang } from "@/i18n/languages";
import { machineHref } from "@/lib/routing/pages";
import { caseLogicalPaths } from "@/lib/routing/cases";
import LangSwitch from "./LangSwitch";

const LINK = "inline-flex min-h-11 min-w-11 items-center justify-center text-[color:var(--text-2)] hover:text-[color:var(--text)] transition-colors";

export default function Footer({ lang }: { lang: Lang }) {
  const d = getDictionary(lang);
  const internal = [
    { href: localizedPath(lang, "/about"), label: d.nav.about },
    { href: localizedPath(lang, "/contact"), label: d.nav.contact },
    { href: localizedPath(lang, "/developers"), label: d.footer.developers },
    { href: localizedPath(lang, "/privacy"), label: d.footer.privacy },
  ];
  const plain = [
    { href: machineHref("/llms.txt", lang), label: "llms.txt" },
    { href: "/openapi.json", label: "OpenAPI" },
    { href: "https://skills.sgomez.dev", label: d.nav.skills },
    { href: "https://blog.sgomez.dev", label: d.nav.blog },
  ];

  return (
    <footer className="border-t border-[color:var(--line)] bg-[color:var(--bg-2)] pt-12 pb-[calc(3rem+var(--safe-bottom))]">
      <div className="mx-auto w-full max-w-[1200px] pl-[max(var(--gutter),var(--safe-left))] pr-[max(var(--gutter),var(--safe-right))]">
        <p className="text-sm text-[color:var(--serif-ink)]">{d.footer.tagline}</p>
        <nav aria-label={d.footer.ariaLabel} className="mt-6 flex flex-wrap gap-x-6 gap-y-0 text-sm">
          {internal.map((l) => (
            <Link prefetch={false} key={l.href} href={l.href} className={LINK}>
              {l.label}
            </Link>
          ))}
          {plain.map((l) => (
            <a key={l.href} href={l.href} className={LINK}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-[color:var(--text-2)]">
            © {new Date().getFullYear()} Santiago Gómez de la Torre Romero
          </p>
          <LangSwitch lang={lang} label={d.nav.switchTo} casePaths={caseLogicalPaths()} />
        </div>
      </div>
    </footer>
  );
}
