import Link from "next/link";
import { getDictionary } from "@/i18n";
import { localizedPath, type Lang } from "@/i18n/languages";
import LangSwitch from "./LangSwitch";

const LINK = "text-[color:var(--text-2)] hover:text-[color:var(--text)] transition-colors";

export default function Footer({ lang }: { lang: Lang }) {
  const d = getDictionary(lang);
  const internal = [
    { href: localizedPath(lang, "/about"), label: d.nav.about },
    { href: localizedPath(lang, "/contact"), label: d.nav.contact },
    { href: localizedPath(lang, "/developers"), label: d.footer.developers },
    { href: localizedPath(lang, "/privacy"), label: d.footer.privacy },
  ];
  const plain = [
    { href: "/llms.txt", label: "llms.txt" },
    { href: "/openapi.json", label: "OpenAPI" },
    { href: "https://skills.sgomez.dev", label: d.nav.skills },
    { href: "https://blog.sgomez.dev", label: d.nav.blog },
  ];

  return (
    <footer className="border-t border-[color:var(--line)] bg-[color:var(--bg-2)] py-12">
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-8">
        <p className="text-sm text-[color:var(--serif-ink)]">{d.footer.tagline}</p>
        <nav aria-label="Footer" className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
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
          <LangSwitch lang={lang} label={d.nav.switchTo} />
        </div>
      </div>
    </footer>
  );
}
