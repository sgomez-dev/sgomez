import Link from "next/link";
import { getDictionary } from "@/i18n";
import { localizedPath, type Lang } from "@/i18n/languages";
import LangSwitch from "./LangSwitch";

const LINK = "inline-flex min-h-11 min-w-11 items-center justify-center text-sm text-[color:var(--text-2)] hover:text-[color:var(--text)] transition-colors";

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
    <header className="fixed inset-x-0 top-0 z-50 h-[calc(4rem+var(--safe-top))] pt-[var(--safe-top)] border-b border-[color:var(--line)] bg-[color-mix(in_oklab,var(--bg)_78%,transparent)] backdrop-blur-[12px]">
      <div className="mx-auto flex h-full w-full max-w-[1200px] items-center justify-between gap-3 pl-[max(var(--gutter),var(--safe-left))] pr-[max(var(--gutter),var(--safe-right))]">
        <Link
          prefetch={false}
          href={home}
          className="inline-flex min-h-11 items-center truncate text-sm font-semibold tracking-[-0.02em] text-[color:var(--text)]"
        >
          Santiago Gómez de la Torre
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-6 lg:flex">
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

        <details className="group relative lg:hidden">
          <summary
            aria-label="Menu"
            className="flex h-11 w-11 shrink-0 cursor-pointer list-none items-center justify-center rounded-full border border-[color:var(--line)] text-[color:var(--text)] [&::-webkit-details-marker]:hidden"
          >
            <span aria-hidden="true" className="text-lg leading-none group-open:hidden">☰</span>
            <span aria-hidden="true" className="hidden text-lg leading-none group-open:inline">✕</span>
          </summary>
          <nav
            aria-label="Principal"
            className="absolute right-0 top-12 flex w-[min(14rem,calc(100vw-2rem))] max-h-[calc(100dvh-5rem-var(--safe-top)-var(--safe-bottom))] overflow-y-auto overscroll-contain flex-col gap-1 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--bg-2)] p-3"
          >
            {anchors.map((a) => (
              <Link prefetch={false} key={a.href} href={a.href} className={`${LINK} rounded-lg px-3 !justify-start`}>
                {a.label}
              </Link>
            ))}
            {external.map((a) => (
              <a key={a.href} href={a.href} className={`${LINK} rounded-lg px-3 !justify-start`}>
                {a.label}
              </a>
            ))}
            <div className="px-3 py-1">
              <LangSwitch lang={lang} label={d.nav.switchTo} />
            </div>
          </nav>
        </details>
      </div>
    </header>
  );
}
