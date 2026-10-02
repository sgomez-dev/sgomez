import type { CSSProperties } from "react";
import { getDictionary } from "@/i18n";
import { fill } from "@/i18n/fill";
import type { Lang } from "@/i18n/languages";
import { FEATURED_CERTIFICATIONS } from "@/app/content";
import { getCertifications, type Certification } from "@/lib/api/data";

const focus = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--light-1)]";

/** Iniciales de la insignia de un emisor: siglas si ya lo son (NUWE, CIC), mayúsculas internas (HackerRank, freeCodeCamp) o iniciales de palabras. */
export function issuerMark(name: string): string {
  const words = name.split(/[\s.]+/).filter(Boolean);
  const first = words[0] ?? "";
  if (/^[A-ZÁÉÍÓÚ]{2,4}$/.test(first)) return first;
  const caps = (first[0]!.toUpperCase() + first.slice(1).replace(/[^A-Z]/g, "")).slice(0, 3);
  if (caps.length > 1) return caps;
  const big = words.filter((w) => /^[A-ZÁÉÍÓÚ]/.test(w));
  if (big.length > 1) return big.map((w) => w[0]).join("").slice(0, 3);
  return first.slice(0, 2);
}

const year = (date: string) => Number(date.match(/\d{4}/)?.[0] ?? NaN);

/** Tres tonos de la marca para las insignias, por emisor y siempre el mismo. */
const HUES = [
  "from-[#8FA8FF] via-[#FFFFFF] to-[#6EF0DC]",
  "from-[#6EF0DC] via-[#FFFFFF] to-[#5B6CFF]",
  "from-[#5B6CFF] via-[#C9D1E6] to-[#8FA8FF]",
];

function Badge({ issuer, hue, size }: { issuer: string; hue: number; size: "lg" | "md" }) {
  const box = size === "lg" ? "size-16 text-[length:var(--step-1)]" : "size-12 text-[length:var(--step-0)]";
  const mark = issuerMark(issuer);
  return (
    <span aria-hidden="true" className={`relative grid shrink-0 place-items-center rounded-full bg-gradient-to-br p-px ${HUES[hue % HUES.length]} ${box}`}>
      <span className={`grid size-full place-items-center rounded-full bg-[radial-gradient(120%_120%_at_30%_20%,rgba(143,168,255,0.28),rgba(11,13,20,0.96)_62%)] font-semibold tracking-[-0.04em] text-[color:var(--text)] ${mark.length > 2 ? (mark.length > 3 ? "text-[0.62em]" : "text-[0.78em]") : ""}`}>
        {mark}
      </span>
    </span>
  );
}

/**
 * Certificaciones del capítulo 08 como muro de insignias (spec §3.3): un resumen que sale de los datos, tres
 * destacadas en grande, la franja de emisores y el resto plegado y agrupado por emisor. Todo sigue en el HTML
 * (el contenido de `<details>` también) y cada certificado enlaza a su credencial.
 */
export default function Certifications({ lang }: { lang: Lang }) {
  const d = getDictionary(lang).chapters.proof;
  const all = getCertifications(lang);
  const featured = FEATURED_CERTIFICATIONS.map((t) => all.find((c) => c.title === t)).filter((c): c is Certification => !!c);
  const rest = all.filter((c) => !featured.includes(c));
  const issuers = [...new Set(all.map((c) => c.institution))];
  const hueOf = (issuer: string) => issuers.indexOf(issuer);
  const groups = issuers
    .map((issuer) => ({ issuer, certs: rest.filter((c) => c.institution === issuer) }))
    .filter((g) => g.certs.length > 0)
    .sort((a, b) => b.certs.length - a.certs.length);
  const years = all.map((c) => year(c.date)).filter(Number.isFinite);
  const label = (c: Certification) => `${c.title}, ${c.institution}, ${c.date}. ${d.credential}`;

  return (
    <>
      <p className="mt-4 text-[length:var(--step-0)] text-[color:var(--text-2)]">
        {fill(d.certSummary, { n: all.length, k: issuers.length, from: Math.min(...years), to: Math.max(...years) })}
      </p>

      <ul className="mt-6 grid list-none gap-3 sm:gap-4 lg:grid-cols-3">
        {featured.map((c, i) => (
          <li key={c.slug} data-motion="badge" style={{ "--i": i } as CSSProperties} className="flex min-w-0">
            <a
              href={c.credential_url}
              rel="noopener"
              aria-label={label(c)}
              className={`group relative flex min-h-11 w-full flex-col gap-5 overflow-hidden rounded-[var(--radius)] border border-[color-mix(in_oklab,var(--light-1)_35%,transparent)] bg-[color:var(--bg-2)] bg-[radial-gradient(90%_70%_at_0%_0%,color-mix(in_oklab,var(--light-1)_18%,transparent),transparent_70%)] p-5 transition-colors hover:border-[color:var(--light-1)] sm:p-6 ${focus}`}
            >
              <span className="flex items-start justify-between gap-3">
                <Badge issuer={c.institution} hue={hueOf(c.institution)} size="lg" />
                <span aria-hidden="true" className="text-[color:var(--text-2)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
              </span>
              <span className="text-[length:var(--step-1)] font-semibold leading-[1.15] tracking-[-0.02em] text-[color:var(--text)] [overflow-wrap:anywhere]">{c.title}</span>
              <span className="mt-auto flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="text-[length:var(--step--1)] text-[color:var(--text-2)]">{c.institution}</span>
                <span className="text-[length:var(--step--1)] uppercase tracking-[0.1em] text-[color:var(--light-2)]">{c.date}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>

      <ul aria-label={d.certIssuers} className="mt-6 flex list-none flex-wrap gap-2 sm:gap-3">
        {issuers.map((issuer, i) => {
          const n = all.filter((c) => c.institution === issuer).length;
          return (
            <li key={issuer} data-motion="badge" style={{ "--i": i % 3 } as CSSProperties} className="flex items-center gap-2.5 rounded-full border border-[color:var(--line)] bg-[color:var(--bg-2)] py-1.5 pl-1.5 pr-4">
              <Badge issuer={issuer} hue={hueOf(issuer)} size="md" />
              <span className="flex flex-col leading-tight">
                <span className="text-[length:var(--step--1)] font-semibold text-[color:var(--text)]">{issuer}</span>
                <span className="text-[length:var(--step--1)] text-[color:var(--text-2)]">{n === 1 ? d.certCountOne : fill(d.certCount, { n })}</span>
              </span>
            </li>
          );
        })}
      </ul>

      <details className="group/all mt-6">
        <summary className={`inline-flex min-h-11 cursor-pointer items-center text-[length:var(--step-0)] font-medium text-[color:var(--light-2)] underline-offset-4 hover:underline ${focus}`}>
          {fill(d.certAll, { n: rest.length })}
          <svg aria-hidden="true" focusable="false" viewBox="0 0 12 12" className="ml-2 h-[1em] w-[1em] shrink-0 transition-transform group-open/all:rotate-90" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 2 8.5 6 4.5 10" />
          </svg>
        </summary>
        <div className="mt-4 gap-x-8 sm:columns-2 lg:columns-3">
          {groups.map((g) => (
            <section key={g.issuer} aria-label={g.issuer} className="mb-6 break-inside-avoid">
              <p className="text-[length:var(--step--1)] uppercase tracking-[0.12em] text-[color:var(--text-2)]">{g.issuer}</p>
              <ul className="mt-1 flex list-none flex-col">
                {g.certs.map((c) => (
                  <li key={c.slug} className="border-b border-[color:var(--line)] last:border-b-0">
                    <a
                      href={c.credential_url}
                      rel="noopener"
                      aria-label={label(c)}
                      className={`group flex min-h-11 items-center justify-between gap-3 py-2 text-[length:var(--step--1)] text-[color:var(--text-2)] transition-colors hover:text-[color:var(--text)] ${focus}`}
                    >
                      <span className="min-w-0 [overflow-wrap:anywhere]">{c.title}</span>
                      <span className="shrink-0 tabular-nums text-[color:var(--light-2)]">{year(c.date)}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </details>
    </>
  );
}
