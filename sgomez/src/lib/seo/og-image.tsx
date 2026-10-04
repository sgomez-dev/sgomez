import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getDictionary } from "@/i18n";
import type { Lang } from "@/i18n/languages";
import { OG_SIZE } from "@/lib/seo/metadata";
import { routeTitle, type LogicalPath } from "@/lib/routing/pages";
import { staticPage, type StaticPageSlug } from "@/lib/content/pages";
import { getCaseStudy } from "@/lib/api/data";

/**
 * Imagen Open Graph de un idioma (1200×630).
 *
 * Mismo lenguaje visual que la home: fondo #05060a con el resplandor radial, el
 * titular en Inter Tight 600 y la línea serif en Instrument Serif cursiva, con
 * el retrato a la derecha. Las fuentes son las mismas del sitio pero `next/og`
 * no lee WOFF2, que es lo que entrega `next/font`, así que van como TTF en
 * `src/lib/seo/fonts` (licencia OFL) y se leen del disco: sin red en el build.
 *
 * El nombre es siempre «Santiago Gómez de la Torre»: el primer apellido es
 * compuesto y no se abrevia.
 */

const FONTS_DIR = path.join(process.cwd(), "src", "lib", "seo", "fonts");
/**
 * Versión de la foto para esta imagen: recortada al círculo azul y aplanada sobre ese azul, sin transparencias,
 * porque satori pinta lo transparente de blanco y salía un aro blanco. Si cambia la foto, se regenera con
 * `node scripts/og-portrait.mjs` (lo comprueba tests/og-portrait.test.ts).
 */
const PORTRAIT = path.join(process.cwd(), "src", "lib", "seo", "og-portrait.png");

/** Nombre del titular en dos líneas: «Gómez de la Torre» es UN apellido y no se parte. */
const NAME_LINES = ["Santiago", "Gómez de la Torre."] as const;

const COLORS = {
  bg: "#05060a",
  text: "#f4f6fb",
  text2: "#aab2c6",
  serifInk: "#c9d1e6",
  light1: "#8fa8ff",
  light2: "#6ef0dc",
  line: "rgba(255,255,255,0.14)",
};

/**
 * La de cada página: el mismo diseño, con el nombre de la página arriba y su título en la línea serif
 * (en /about, el lema, porque su título ya repite el nombre; en /contact, la invitación del capítulo,
 * porque su título es el mismo nombre de la página).
 */
export function renderPageOgImage(path: Exclude<LogicalPath, "/">, lang: Lang): Promise<ImageResponse> {
  const ch = getDictionary(lang).chapters;
  const line =
    path === "/about" ? ch.hero.serif
    : path === "/contact" ? `${ch.contact.heading} ${ch.contact.serif}`
    : staticPage(path.slice(1) as StaticPageSlug, lang).title;
  return renderOgImage(lang, { eyebrow: routeTitle(path, lang), line });
}

/** La de un caso de estudio: «Caso de estudio» arriba y el nombre del proyecto en la línea serif. */
export function renderCaseOgImage(slug: string, lang: Lang): Promise<ImageResponse> {
  const study = getCaseStudy(slug, lang);
  if (!study) throw new Error(`renderCaseOgImage: no hay caso publicado para ${slug}`);
  return renderOgImage(lang, { eyebrow: getDictionary(lang).caseStudy.eyebrow, line: study.title });
}

export async function renderOgImage(lang: Lang, page?: { eyebrow: string; line: string }): Promise<ImageResponse> {
  const [sans, serif, portrait] = await Promise.all([
    readFile(path.join(FONTS_DIR, "InterTight-SemiBold.ttf")),
    readFile(path.join(FONTS_DIR, "InstrumentSerif-Italic.ttf")),
    readFile(PORTRAIT),
  ]);
  const d = getDictionary(lang).chapters.hero;
  const portraitSrc = `data:image/png;base64,${portrait.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "64px 72px",
          backgroundColor: COLORS.bg,
          backgroundImage: `radial-gradient(60% 80% at 82% 38%, rgba(143,168,255,0.26), rgba(5,6,10,0) 70%), radial-gradient(40% 50% at 8% 100%, rgba(110,240,220,0.12), rgba(5,6,10,0) 70%)`,
          color: COLORS.text,
          fontFamily: "Inter Tight",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: 720 }}>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: COLORS.light1,
            }}
          >
            {page?.eyebrow ?? d.eyebrow}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              flexDirection: "column",
              fontSize: 84,
              fontWeight: 600,
              lineHeight: 1,
              letterSpacing: -3,
              whiteSpace: "nowrap",
              color: COLORS.text,
            }}
          >
            {NAME_LINES.map((line) => (
              <div key={line} style={{ display: "flex" }}>
                {line}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 22,
              fontFamily: "Instrument Serif",
              fontStyle: "italic",
              fontSize: 60,
              lineHeight: 1.05,
              color: COLORS.serifInk,
            }}
          >
            {page?.line ?? d.serif}
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 48, fontSize: 26, color: COLORS.text2 }}>
            <div
              style={{
                display: "flex",
                width: 14,
                height: 14,
                marginRight: 14,
                borderRadius: 7,
                backgroundColor: COLORS.light2,
              }}
            />
            sgomez.dev
          </div>
        </div>
        <div
          style={{
            display: "flex",
            width: 340,
            height: 340,
            borderRadius: 170,
            overflow: "hidden",
            border: `2px solid ${COLORS.line}`,
            backgroundColor: "#0b0d14",
          }}
        >
          {/* El redondeo va en la propia imagen: satori no recorta un <img> con el overflow redondeado del padre.
              336 = 340 menos los 2 px de borde a cada lado. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- next/og renderiza con satori, no con next/image */}
          <img src={portraitSrc} width={336} height={336} alt="" style={{ objectFit: "cover", borderRadius: 168 }} />
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Inter Tight", data: sans, weight: 600, style: "normal" },
        { name: "Instrument Serif", data: serif, weight: 400, style: "italic" },
      ],
    },
  );
}
