import { existsSync } from "node:fs";
import { join } from "node:path";
import type { CSSProperties } from "react";
import Link from "next/link";
import { getDictionary } from "@/i18n";
import { localizedPath, type Lang } from "@/i18n/languages";
import { SHARDS, LINES, type Shard } from "@/lib/lost/shards";
import { shardHref } from "@/lib/lost/shard-links";
import { Container } from "@/components/ui/Container";
import { Display } from "@/components/ui/Display";
import RequestedPath from "./RequestedPath";

/**
 * Escenario del 404: el cristal roto y sus fragmentos, cada uno un enlace real.
 * Es el estado FINAL y completo: sin JS, con `prefers-reduced-motion`, sin WebGL
 * o con Save-Data es lo que se ve. El vídeo (Task 3) y la escena 3D (Task 4) se
 * montan encima de este mismo escenario y se apoyan en `data-stage` y
 * `data-shard-id`; hasta que la escena avisa de que está lista, estos
 * fragmentos CSS SON el visual.
 */

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--light-1)]";
const BTN = `inline-flex min-h-11 items-center rounded-full px-5 py-2 text-[length:var(--step-0)] font-medium transition-colors ${FOCUS}`;

/** Misma familia cónica que `GlassPoster`, con tres variantes de paleta. */
const HUE: Record<Shard["hue"], string> = {
  a: "[background:conic-gradient(from_120deg,#9fb6ff,#fff,#6ef0dc,#5b6cff,#9fb6ff)]",
  b: "[background:conic-gradient(from_200deg,#8fa8ff,#ffffff,#9fb6ff,#5b6cff,#6ef0dc,#8fa8ff)]",
  c: "[background:conic-gradient(from_40deg,#6ef0dc,#ffffff,#8fa8ff,#5b6cff,#6ef0dc)]",
};

/** Contornos irregulares: el fragmento no es nunca un círculo. */
const RADII = [
  "30% 70% 60% 40%",
  "60% 40% 30% 70%",
  "40% 60% 70% 30%",
  "70% 30% 40% 60%",
  "50% 50% 40% 60%",
  "60% 40% 50% 50%",
];

const POS =
  "absolute left-[var(--ml)] top-[var(--mt)] -translate-x-1/2 -translate-y-1/2 lg:left-[var(--dl)] lg:top-[var(--dt)]";

function posStyle(s: Shard): CSSProperties {
  return {
    "--ml": `${s.stage.mobile.left}%`,
    "--mt": `${s.stage.mobile.top}%`,
    "--dl": `${s.stage.desktop.left}%`,
    "--dt": `${s.stage.desktop.top}%`,
    "--s": s.scale,
  } as CSSProperties;
}

function Glass({ shard, index }: { shard: Shard; index: number }) {
  return (
    <span
      aria-hidden="true"
      className={`block h-[calc(var(--s)*2.75rem)] w-[calc(var(--s)*2.75rem)] rounded-full shadow-[0_0_28px_rgba(120,150,255,0.55)] transition-[transform,box-shadow] duration-200 lg:h-[calc(var(--s)*3.5rem)] lg:w-[calc(var(--s)*3.5rem)] ${HUE[shard.hue]}`}
      style={{ borderRadius: RADII[index % RADII.length], rotate: `${Math.round(shard.pose.rz * 57)}deg` }}
    />
  );
}

// El póster de fondo solo se referencia si existe (CSS `background-image`, nunca
// `<img>`): antes de que se renderice (Task 3) no debe pedirse un fichero que no está.
// El 404 se prerenderiza en el build, que es donde se evalúa esto.
const POSTER = "/media/404/constellation.webp";
function posterExists(): boolean {
  try {
    return existsSync(join(process.cwd(), "public", POSTER));
  } catch {
    return false;
  }
}

const STARS = [
  "radial-gradient(1px 1px at 12% 20%,#fff6,transparent)",
  "radial-gradient(1px 1px at 33% 78%,#fff5,transparent)",
  "radial-gradient(1px 1px at 58% 12%,#fff5,transparent)",
  "radial-gradient(1.5px 1.5px at 88% 30%,#fff7,transparent)",
  "radial-gradient(1px 1px at 76% 86%,#fff4,transparent)",
  "radial-gradient(1px 1px at 48% 44%,#fff3,transparent)",
  "radial-gradient(1px 1px at 92% 64%,#fff4,transparent)",
  "radial-gradient(1px 1px at 5% 60%,#fff3,transparent)",
].join(",");

const GLOW =
  "radial-gradient(circle 380px at 64% 48%,rgba(98,140,255,.28),transparent),radial-gradient(circle 420px at 70% 60%,rgba(0,220,200,.12),transparent)";

export default function LostStage({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  const d = dict.notFound;
  const byId = new Map(SHARDS.map((s) => [s.id, s]));
  const poster = posterExists();

  return (
    <section
      data-stage="lost"
      aria-labelledby="lost-title"
      className="relative isolate overflow-hidden pb-4 pt-12 md:pt-20 lg:min-h-[640px] lg:pb-0 lg:pt-24"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,#000_65%,transparent)]" style={{ backgroundImage: GLOW }} />
      <div aria-hidden="true" className="absolute inset-0 -z-10" style={{ backgroundImage: STARS }} />
      {poster ? (
        <div
          aria-hidden="true"
          data-stage-poster=""
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${POSTER})` }}
        />
      ) : null}

      <Container className="relative z-10">
        <div className="max-w-[30rem]">
          <p className="block overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[length:var(--step--1)] uppercase tracking-[0.14em] text-[color:var(--text-2)]">
            <RequestedPath label={d.eyebrow} />
          </p>
          <Display
            as="h1"
            id="lost-title"
            lead={d.heading}
            serif={d.headingSerif}
            size="text-[length:var(--step-4)]"
            className="mt-4"
          />
          <p data-answer className="mt-6 text-[length:var(--step-1)] leading-[1.55] text-[color:var(--serif-ink)]">
            {d.body}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              prefetch={false}
              href={localizedPath(lang, "/")}
              className={`${BTN} bg-[color:var(--text)] text-[color:var(--bg)] hover:bg-white`}
            >
              {d.home}
            </Link>
            <a
              href="#mapa"
              className={`${BTN} border border-[color:var(--line)] text-[color:var(--text)] hover:bg-white/5`}
            >
              {d.map}
            </a>
          </div>
        </div>
      </Container>

      {/* Los dígitos 404 en contorno, detrás de todo: decorativos. */}
      <p
        aria-hidden="true"
        className="pointer-events-none absolute bottom-3 left-[max(var(--gutter),var(--safe-left))] -z-[5] select-none text-[clamp(5rem,15vw,9rem)] font-extrabold leading-[0.8] tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_rgba(143,168,255,0.35)]"
      >
        404
      </p>

      {/* Escenario: apilado bajo el texto en móvil (altura fija, sin CLS) y a pantalla completa desde lg. */}
      <div className="pointer-events-none relative mt-8 h-[30rem] lg:absolute lg:inset-0 lg:mt-0 lg:h-auto">
        {(["m", "d"] as const).map((variant) => (
          <svg
            key={variant}
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className={`absolute inset-0 h-full w-full ${variant === "m" ? "lg:hidden" : "hidden lg:block"}`}
            fill="none"
          >
            {LINES.map(([a, b]) => {
              const from = byId.get(a)!;
              const to = byId.get(b)!;
              const k = variant === "m" ? "mobile" : "desktop";
              return (
                <line
                  key={`${a}-${b}`}
                  x1={from.stage[k].left}
                  y1={from.stage[k].top}
                  x2={to.stage[k].left}
                  y2={to.stage[k].top}
                  className="[stroke:var(--light-1)]"
                  strokeOpacity={0.28}
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>
        ))}

        <ul aria-label={dict.lost.group} className="absolute inset-0 m-0 list-none p-0">
          {SHARDS.map((shard, i) => {
            if (shard.target === null) return null;
            const label = dict.lost.shard[shard.target];
            return (
              <li key={shard.id} className={POS} style={posStyle(shard)}>
                <a
                  href={shardHref(shard.target, lang)}
                  data-shard-id={shard.id}
                  className={`group pointer-events-auto relative grid min-h-11 min-w-11 place-items-center rounded-full ${FOCUS}`}
                >
                  <Glass shard={shard} index={i} />
                  <span className="absolute left-1/2 top-[calc(50%+var(--s)*1.4rem+0.25rem)] -translate-x-1/2 whitespace-nowrap rounded-full border border-white/[0.12] bg-[rgba(11,13,20,0.8)] px-2.5 py-1 text-[length:var(--step--1)] font-medium text-[color:var(--text)] transition-colors group-hover:border-[color:var(--light-1)] group-focus-visible:border-[color:var(--light-1)] lg:top-[calc(50%+var(--s)*1.75rem+0.25rem)]">
                    {label}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>

        <div aria-hidden="true">
          {SHARDS.map((shard, i) => {
            if (shard.target !== null) return null;
            return (
              <div key={shard.id} data-shard-id={shard.id} className={`${POS} opacity-80`} style={posStyle(shard)}>
                <Glass shard={shard} index={i + 3} />
              </div>
            );
          })}
        </div>

        {/* «Estás aquí»: el punto cian que pulsa, fuera del mapa. */}
        <div
          className="absolute left-[8%] top-[3%] flex items-center gap-2 lg:left-[53%] lg:top-[9%]"
          data-stage-you=""
        >
          <span className="block h-3 w-3 shrink-0 rounded-full bg-[color:var(--light-2)] shadow-[0_0_18px_var(--light-2)] motion-safe:animate-pulse" aria-hidden="true" />
          <span className="whitespace-nowrap rounded-full border border-[rgba(110,240,220,0.35)] bg-[rgba(11,13,20,0.8)] px-2.5 py-1 text-[length:var(--step--1)] font-medium text-[color:var(--light-2)]">
            {dict.lost.here}
          </span>
        </div>
      </div>
    </section>
  );
}
