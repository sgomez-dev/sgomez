import type { Metadata, Viewport } from "next";
import { ViewTransition } from "react";
import { notFound } from "next/navigation";
import { LANGS, isLang, localizedPath, type Lang } from "@/i18n/languages";
import { getDictionary } from "@/i18n";
import { machineHref } from "@/lib/routing/pages";
import { OG_ALT, OG_SIZE, SITE_NAME, ogImagePath } from "@/lib/seo/metadata";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import MotionDirector from "@/motion/MotionDirector";
import MotionBoot from "@/motion/MotionBoot";
import { sans, serif } from "../fonts";
import "../globals.css";

const siteUrl = "https://sgomez.dev";
const siteName = SITE_NAME;
const siteTitle =
  "Santiago Gómez de la Torre Romero · Full-Stack Engineer shipping AI to production";
// Tiene que decir lo mismo que IDENTITY.description en seo.ts: son la meta
// description y el JSON-LD de la MISMA pagina, y si una menciona el rol de
// cofundador y la otra no, el propio documento se contradice.
const siteDescription =
  "Full-stack engineer building and shipping AI/LLM features to production. Co-founder of SkyQuetz Consulting, creator of NudaUI (more than 1,500 components) and a live semantic search (RAG). React, Next.js, Node.js, Python, Google Cloud.";

/**
 * Metadata del sitio para un idioma. Se mantienen los valores de siempre y solo
 * se localiza lo que no puede ser igual en los dos idiomas (el `locale` de
 * Open Graph y la canónica); la reescritura completa llega con el SEO por idioma.
 */
function siteMetadata(lang: Lang): Metadata {
  const home = lang === "es" ? siteUrl : `${siteUrl}${localizedPath(lang, "/")}`;
  return {
  title: {
    default: siteTitle,
    template: "%s | " + siteName,
  },
  description: siteDescription,
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  creator: "Santiago Gómez de la Torre Romero",
  publisher: "Santiago Gómez de la Torre Romero",
  // Sin `url`: con ella Next añade un segundo <link rel="author"> (a la raíz) que
  // contradice al del layout (a /about). El único rel="author" es el del <body>.
  authors: [{ name: "Santiago Gómez de la Torre Romero" }],
  category: "technology",
  referrer: "origin-when-cross-origin",
  manifest: "/manifest.webmanifest",
  formatDetection: { email: false, address: false, telephone: false },
  appleWebApp: {
    capable: true,
    title: "sgomez.dev",
    statusBarStyle: "black-translucent",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/Santiago_Gómez_de_la_Torre_Romero.png" },
      { url: "/Santiago_Gómez_de_la_Torre_Romero.png", sizes: "32x32", type: "image/png" },
      { url: "/Santiago_Gómez_de_la_Torre_Romero.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/Santiago_Gómez_de_la_Torre_Romero.png",
    apple: "/Santiago_Gómez_de_la_Torre_Romero.png",
  },
  keywords: [
    "Santiago Gómez de la Torre Romero",
    "sgomez.dev",
    "AI engineer",
    "LLM engineer",
    "RAG",
    "retrieval augmented generation",
    "semantic search",
    "embeddings",
    "evals",
    "prompt engineering",
    "MCP",
    "full-stack developer",
    "Next.js",
    "React",
    "Node.js",
    "TypeScript",
    "Python",
    "NudaUI",
    "Claude Canvas",
    "claude-canvas",
    "Claude Code plugin",
    "TUI",
    "SkyQuetz",
    "SkyQuetz Consulting",
    "cofundador",
    "Cantabria",
    "Spain",
    "remote",
  ],
  // Valores por defecto del sitio. Cada página los sustituye por los suyos con
  // `buildMetadata` (canónica, hreflang, Open Graph): `alternates`,
  // `openGraph` y `twitter` de una página REEMPLAZAN a estos, no se mezclan.
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: home,
    siteName,
    type: "website",
    locale: lang === "es" ? "es_ES" : "en_US",
    alternateLocale: [lang === "es" ? "en_US" : "es_ES"],
    images: [{ url: ogImagePath(lang), ...OG_SIZE, alt: OG_ALT[lang] }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [{ url: ogImagePath(lang), alt: OG_ALT[lang] }],
  },
  };
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return siteMetadata(lang);
}

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export const dynamicParams = false;

export const viewport: Viewport = {
  themeColor: "#05060a",
  colorScheme: "dark",
  width: "device-width",
  viewportFit: "cover",
  initialScale: 1,
};

export default async function LangLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <html lang={lang === "es" ? "es-ES" : "en"} data-scroll-behavior="smooth" className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        {/* Antes del primer pintado: decide si hay movimiento (ver src/motion/boot.ts). */}
        <MotionBoot />
      </head>
      <body className="antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-[color:var(--text)] focus:px-4 focus:py-2 focus:text-sm focus:text-[color:var(--bg)]">
          {getDictionary(lang).nav.skip}
        </a>
        <Nav lang={lang} />
        <main id="main" className="pt-[calc(4rem+var(--safe-top))]">
          <ViewTransition name="page">{children}</ViewTransition>
        </main>
        <Footer lang={lang} />
        <MotionDirector />
        {/* Relaciones de enlace que anuncian las superficies para agentes.
            React las eleva al <head>. `service-desc` es la relación
            registrada (RFC 8631) con la que un cliente encuentra la
            descripción de una API sin que nadie se la pase a mano: es la
            diferencia entre publicar la especificación y que se pueda
            descubrir. */}
        <link rel="service-desc" type="application/openapi+json" href="/openapi.json" title="OpenAPI 3.1 · sgomez.dev Public API" />
        <link rel="service-doc" type="text/html" href={localizedPath(lang, "/developers")} title={lang === "es" ? "Portal para desarrolladores de sgomez.dev" : "sgomez.dev developer portal"} />
        {/* Sin `type="text/markdown"`: el único alternate de ese tipo debe ser el `.md` de la propia página. */}
        <link rel="alternate" href={machineHref("/llms.txt", lang)} title={lang === "es" ? "llms.txt · resumen factual del sitio" : "llms.txt · factual summary of the site"} />
        <link rel="author" href={localizedPath(lang, "/about")} />
        <link rel="privacy-policy" href={localizedPath(lang, "/privacy")} />
        {/* El JSON-LD ya no vive aquí: lo pinta cada página (un solo @graph por
            página, con sus propios nodos). Ver `lib/seo/jsonld.ts`. */}
      </body>
    </html>
  );
}
