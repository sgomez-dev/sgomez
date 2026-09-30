import type { Metadata, Viewport } from "next";
import { Inter_Tight, Instrument_Serif } from "next/font/google";
import { notFound } from "next/navigation";
import { LANGS, isLang, localizedPath, type Lang } from "@/i18n/languages";
import { personGraph } from "../seo";
import { getDictionary } from "@/i18n";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import "../globals.css";

const sans = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", weight: ["400", "500", "600"], display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], variable: "--font-instrument-serif", weight: "400", style: ["normal", "italic"], display: "swap" });

const siteUrl = "https://sgomez.dev";
const siteName = "Santiago Gómez de la Torre Romero - Full-Stack Engineer";
const siteTitle =
  "Santiago Gómez de la Torre Romero — Full-Stack Engineer shipping AI to production";
// Tiene que decir lo mismo que IDENTITY.description en seo.ts: son la meta
// description y el JSON-LD de la MISMA pagina, y si una menciona el rol de
// cofundador y la otra no, el propio documento se contradice.
const siteDescription =
  "Full-stack engineer building and shipping AI/LLM features to production. Co-founder of SkyQuetz Consulting, creator of NudaUI (1,000+ components) and a live semantic search (RAG). React, Next.js, Node.js, Python, Google Cloud.";

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
  authors: [{ name: "Santiago Gómez de la Torre Romero", url: siteUrl }],
  category: "technology",
  referrer: "origin-when-cross-origin",
  manifest: "/manifest.webmanifest",
  formatDetection: { email: false, address: false, telephone: false },
  appleWebApp: {
    capable: true,
    title: "Santiago Gómez",
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
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName,
    type: "website",
    locale: lang === "es" ? "es_ES" : "en_US",
    alternateLocale: [lang === "es" ? "en_US" : "es_ES"],
    images: [
      {
        url: "/Santiago_Gómez_de_la_Torre_Romero.png",
        width: 1200,
        height: 630,
        alt: "Foto de Santiago Gómez - Full-Stack Engineer (AI/LLM)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/Santiago_Gómez_de_la_Torre_Romero.png"],
  },
  alternates: {
    canonical: home,
    languages: {
      "es-ES": siteUrl,
      en: `${siteUrl}${localizedPath("en", "/")}`,
      "x-default": siteUrl,
    },
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
    <html lang={lang === "es" ? "es-ES" : "en"} className={`${sans.variable} ${serif.variable}`}>
      <body className="antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-[color:var(--text)] focus:px-4 focus:py-2 focus:text-sm focus:text-[color:var(--bg)]">
          {getDictionary(lang).nav.skip}
        </a>
        <Nav lang={lang} />
        <main id="main" className="pt-[calc(4rem+var(--safe-top))]">
          {children}
        </main>
        <Footer lang={lang} />
        {/* Relaciones de enlace que anuncian las superficies para agentes.
            React las eleva al <head>. `service-desc` es la relación
            registrada (RFC 8631) con la que un cliente encuentra la
            descripción de una API sin que nadie se la pase a mano: es la
            diferencia entre publicar la especificación y que se pueda
            descubrir. */}
        <link rel="service-desc" type="application/openapi+json" href="/openapi.json" title="OpenAPI 3.1 — sgomez.dev Public API" />
        <link rel="service-doc" type="text/html" href={localizedPath(lang, "/developers")} title="Portal para desarrolladores de sgomez.dev" />
        <link rel="alternate" type="text/markdown" href={localizedPath(lang, "/llms.txt")} title="llms.txt — resumen factual del sitio" />
        <link rel="author" href={localizedPath(lang, "/about")} />
        <link rel="privacy-policy" href={localizedPath(lang, "/privacy")} />
        <script
          type="application/ld+json"
          // Full identity @graph (Person + WebSite + project entities). Ties
          // sgomez.dev to nudaui.dev, the blog, the CLI, GitHub and LinkedIn via
          // sameAs + creator links so they resolve as one entity.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personGraph()) }}
        />
      </body>
    </html>
  );
}
