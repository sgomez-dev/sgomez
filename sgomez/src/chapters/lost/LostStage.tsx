import type { CSSProperties } from "react";
import Link from "next/link";
import { getDictionary } from "@/i18n";
import { localizedPath, type Lang } from "@/i18n/languages";
import { SHARDS, LINES, LINES_MOBILE, HAS_END_POSTER, STAGE_ASPECT_DESKTOP, project, unproject, silhouette, type Shard } from "@/lib/lost/shards";
import { shardHref } from "@/lib/lost/shard-links";
import { Container } from "@/components/ui/Container";
import { Display } from "@/components/ui/Display";
import RequestedPath from "./RequestedPath";
import LostExperience from "./LostExperience";

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

/** Aspecto de referencia de la caja móvil (24rem por 32rem): solo fija la FORMA de la silueta. */
const MOBILE_REF_ASPECT = 0.75;

const r2 = (v: number) => Math.round(v * 100) / 100;

/**
 * Todo sale de `shards.ts`. Escritorio: `project(pose)` en la caja 16:9 y silueta
 * de la pose. Móvil: `stage.mobile` (autorado) y la silueta del fragmento colocado
 * en 3D con `unproject` a su propia profundidad. El tamaño va en % del ALTO de la
 * caja (`h`) y la proporción (`r`), así no depende del ancho.
 */
function layoutOf(s: Shard) {
  const dp = project(s.pose, STAGE_ASPECT_DESKTOP);
  const ds = silhouette(s, STAGE_ASPECT_DESKTOP);
  const mu = unproject(s.stage.mobile.left, s.stage.mobile.top, s.pose.z, MOBILE_REF_ASPECT);
  const ms = silhouette({ ...s, pose: { ...s.pose, x: mu.x, y: mu.y } }, MOBILE_REF_ASPECT);
  return {
    d: { left: r2(dp.left), top: r2(dp.top), sl: r2(ds.left), st: r2(ds.top), h: r2(ds.h), r: r2((ds.w * STAGE_ASPECT_DESKTOP) / ds.h), clip: ds.clip },
    m: { left: s.stage.mobile.left, top: s.stage.mobile.top, sl: r2(ms.left), st: r2(ms.top), h: r2(ms.h), r: r2((ms.w * MOBILE_REF_ASPECT) / ms.h), clip: ms.clip },
  };
}

export function stageVars(s: Shard): CSSProperties {
  const l = layoutOf(s);
  return {
    "--ml": `${l.m.left}%`,
    "--mt": `${l.m.top}%`,
    "--mh": `${l.m.h}%`,
    "--mr": l.m.r,
    "--dl": `${l.d.left}%`,
    "--dt": `${l.d.top}%`,
    "--dh": `${l.d.h}%`,
    "--dr": l.d.r,
  } as CSSProperties;
}

function glassVars(s: Shard): CSSProperties {
  const l = layoutOf(s);
  return {
    "--ml": `${l.m.sl}%`,
    "--mt": `${l.m.st}%`,
    "--mh": `${l.m.h}%`,
    "--mr": l.m.r,
    "--mc": l.m.clip,
    "--dl": `${l.d.sl}%`,
    "--dt": `${l.d.st}%`,
    "--dh": `${l.d.h}%`,
    "--dr": l.d.r,
    "--dc": l.d.clip,
  } as CSSProperties;
}

const BOX =
  "absolute h-[var(--mh)] aspect-[var(--mr)] left-[var(--ml)] top-[var(--mt)] -translate-x-1/2 -translate-y-1/2 lg:h-[var(--dh)] lg:aspect-[var(--dr)] lg:left-[var(--dl)] lg:top-[var(--dt)]";

/** Cristal CSS: silueta recortada con `clip-path` (la de la pose, vista por la cámara). Sin póster, o en móvil. */
function Glass({ shard, hideOnDesktop }: { shard: Shard; hideOnDesktop: boolean }) {
  return (
    <div
      aria-hidden="true"
      data-shard-glass={shard.id}
      {...(shard.target === null ? { "data-shard-id": shard.id } : {})}
      className={`${BOX} [filter:drop-shadow(0_0_14px_rgba(120,150,255,0.5))] ${hideOnDesktop ? "lg:hidden" : ""}`}
      style={glassVars(shard)}
    >
      <div className={`h-full w-full [clip-path:var(--mc)] lg:[clip-path:var(--dc)] ${HUE[shard.hue]}`} />
    </div>
  );
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

export default function LostStage({ lang, hasEndPoster = HAS_END_POSTER }: { lang: Lang; hasEndPoster?: boolean }) {
  const dict = getDictionary(lang);
  const d = dict.notFound;
  const byId = new Map(SHARDS.map((s) => [s.id, s]));

  return (
    <section
      data-stage="lost"
      aria-labelledby="lost-title"
      className="relative isolate overflow-hidden pb-24 pt-12 md:pt-20 lg:min-h-[max(640px,calc(min(100vw,1440px)*0.5625))] lg:pb-0 lg:pt-24"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,#000_65%,transparent)]" style={{ backgroundImage: GLOW }} />
      <div aria-hidden="true" className="absolute inset-0 -z-10" style={{ backgroundImage: STARS }} />
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

      {/* Los dígitos 404 en contorno, detrás de todo y alineados con la columna de texto: decorativos. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-[5]">
        <Container className="relative h-full">
          <p className="absolute bottom-3 left-[max(var(--gutter),var(--safe-left))] select-none text-[clamp(5rem,15vw,9rem)] font-extrabold leading-[0.8] tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_rgba(143,168,255,0.35)] lg:left-[var(--gutter)]">
            404
          </p>
        </Container>
      </div>

      {/*
        Escenario. Móvil: apilado bajo el texto, altura fija (sin CLS), ancho máx. 28rem y SIN vídeo (L5).
        Desde lg: caja 16:9 fija y centrada; en ella el póster final (si existe) se pinta a 100% x 100%,
        con la misma proyección que las posiciones de los enlaces (L7).
      */}
      <div className="pointer-events-none relative mx-auto mt-8 h-[32rem] w-[min(100%,28rem)] lg:absolute lg:z-20 lg:left-1/2 lg:top-1/2 lg:mx-0 lg:mt-0 lg:aspect-video lg:h-auto lg:w-[min(100%,1440px)] lg:-translate-x-1/2 lg:-translate-y-1/2">
        {(["m", "d"] as const).map((variant) => (
          <svg
            key={variant}
            aria-hidden="true"
            data-lost-static=""
            focusable="false"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className={`absolute inset-0 h-full w-full ${variant === "m" ? "lg:hidden" : "hidden lg:block"}`}
            fill="none"
          >
            {(variant === "m" ? LINES_MOBILE : LINES).map(([a, b]) => {
              const from = byId.get(a)!;
              const to = byId.get(b)!;
              const pf = variant === "m" ? from.stage.mobile : project(from.pose, STAGE_ASPECT_DESKTOP);
              const pt = variant === "m" ? to.stage.mobile : project(to.pose, STAGE_ASPECT_DESKTOP);
              return (
                <line
                  key={`${a}-${b}`}
                  x1={r2(pf.left)}
                  y1={r2(pf.top)}
                  x2={r2(pt.left)}
                  y2={r2(pt.top)}
                  className="[stroke:var(--light-1)]"
                  strokeOpacity={0.28}
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>
        ))}

        {hasEndPoster ? (
          <div
            aria-hidden="true"
            data-stage-poster="end"
            data-lost-static=""
            className="absolute inset-0 hidden lg:block"
            style={{ backgroundImage: "url(/media/404/poster-end.webp)", backgroundSize: "100% 100%", backgroundRepeat: "no-repeat" }}
          />
        ) : null}

        {/* Cristal CSS: siempre en móvil, y en escritorio solo si no hay póster. */}
        <div aria-hidden="true" data-lost-static="">
          {SHARDS.map((shard) => (
            <Glass key={shard.id} shard={shard} hideOnDesktop={hasEndPoster} />
          ))}
        </div>

        <ul aria-label={dict.lost.group} className="absolute inset-0 z-10 m-0 list-none p-0">
          {SHARDS.map((shard) => {
            if (shard.target === null) return null;
            const label = dict.lost.shard[shard.target];
            return (
              <li key={shard.id} className={`${BOX} min-h-11 min-w-11`} style={stageVars(shard)}>
                <a
                  href={shardHref(shard.target, lang)}
                  data-shard-id={shard.id}
                  className={`group pointer-events-auto relative block h-full min-h-11 w-full min-w-11 rounded-full ${FOCUS}`}
                >
                  <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/[0.12] bg-[rgba(11,13,20,0.8)] px-2.5 py-1 text-[length:var(--step--1)] font-medium text-[color:var(--text)] transition-colors group-hover:border-[color:var(--light-1)] group-focus-visible:border-[color:var(--light-1)] group-focus-visible:ring-2 group-focus-visible:ring-[color:var(--light-1)]">
                    {label}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>

        {/* «Estás aquí»: el punto cian que pulsa, fuera del mapa. */}
        <div
          className="absolute left-[8%] top-0 z-10 flex items-center gap-2 lg:left-[53%] lg:top-[9%]"
          data-stage-you=""
        >
          <span className="block h-3 w-3 shrink-0 rounded-full bg-[color:var(--light-2)] shadow-[0_0_18px_var(--light-2)] motion-safe:animate-pulse" aria-hidden="true" />
          <span className="whitespace-nowrap rounded-full border border-[rgba(110,240,220,0.35)] bg-[rgba(11,13,20,0.8)] px-2.5 py-1 text-[length:var(--step--1)] font-medium text-[color:var(--light-2)]">
            {dict.lost.here}
          </span>
        </div>

        {/* Vídeo del estallido y escena 3D viva encima de lo estático; los enlaces de arriba siguen siendo LOS enlaces. */}
        <LostExperience lang={lang} pause={dict.lost.pause} resume={dict.lost.resume} gyro={dict.lost.gyro} />
      </div>
    </section>
  );
}
