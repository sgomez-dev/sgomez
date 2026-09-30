import Link from "next/link";
import { getDictionary } from "@/i18n";
import { localizedPath, type Lang } from "@/i18n/languages";
import LangSwitch from "./LangSwitch";

const LINK = "text-sm text-[color:var(--text-2)] hover:text-[color:var(--text)] transition-colors";

export default function Nav({ lang }: { lang: Lang }) {
  const d = getDictionary(lang);
  const home = localizedPath(lang, "/");
  const anchors = [
    { href: `${home}#work`, label: d.nav.work },
    { href: `${home}#about`, label: d.nav.about },
    { href: `${home}#open-source`, label: d.nav.openSource },
    { href: `${home}#contact`, label: d.nav.contact },
  ];
  const external = [
    { href: "https://skills.sgomez.dev", label: d.nav.skills },
    { href: "https://blog.sgomez.dev", label: d.nav.blog },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-[color:var(--line)] bg-[color-mix(in_oklab,var(--bg)_78%,transparent)] backdrop-blur-[12px]">
      <div className="mx-auto flex h-full w-full max-w-[1200px] items-center justify-between gap-4 px-4 md:px-8">
        <Link
          prefetch={false}
          href={home}
          className="truncate text-sm font-semibold tracking-[-0.02em] text-[color:var(--text)]"
        >
          Santiago Gómez de la Torre
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-6 md:flex">
          {anchors.map((a) => (
            <Link prefetch={false} key={a.href} href={a.href} className={LINK}>
              {a.label}
            </Link>
          ))}
          {external.map((a) => (
            <a key={a.href} href={a.href} className={LINK}>
              {a.label}
            </a>
          ))}
          <LangSwitch lang={lang} label={d.nav.switchTo} />
        </nav>

        <details className="group relative md:hidden">
          <summary
            aria-label="Menu"
            className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-[color:var(--line)] text-[color:var(--text)] [&::-webkit-details-marker]:hidden"
          >
            <span aria-hidden="true" className="text-lg leading-none group-open:hidden">☰</span>
            <span aria-hidden="true" className="hidden text-lg leading-none group-open:inline">✕</span>
          </summary>
          <nav
            aria-label="Principal"
            className="absolute right-0 top-12 flex w-56 flex-col gap-1 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--bg-2)] p-3"
          >
            {anchors.map((a) => (
              <Link prefetch={false} key={a.href} href={a.href} className={`${LINK} rounded-lg px-3 py-2`}>
                {a.label}
              </Link>
            ))}
            {external.map((a) => (
              <a key={a.href} href={a.href} className={`${LINK} rounded-lg px-3 py-2`}>
                {a.label}
              </a>
            ))}
            <div className="px-3 pt-2">
              <LangSwitch lang={lang} label={d.nav.switchTo} />
            </div>
          </nav>
        </details>
      </div>
    </header>
  );
}
