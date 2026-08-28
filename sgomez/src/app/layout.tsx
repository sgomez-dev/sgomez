import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { personGraph } from "./seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://sgomez.dev";
const siteName = "Santiago Gómez de la Torre Romero - Full-Stack Engineer";
const siteTitle =
  "Santiago Gómez de la Torre Romero — Full-Stack Engineer shipping AI to production";
// Tiene que decir lo mismo que IDENTITY.description en seo.ts: son la meta
// description y el JSON-LD de la MISMA pagina, y si una menciona el rol de
// cofundador y la otra no, el propio documento se contradice.
const siteDescription =
  "Full-stack engineer building and shipping AI/LLM features to production. Co-founder of SkyQuetz Consulting, creator of NudaUI (1,000+ components) and a live semantic search (RAG). React, Next.js, Node.js, Python, Google Cloud.";

export const metadata: Metadata = {
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
    locale: "es_ES",
    alternateLocale: ["en_US"],
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
    canonical: siteUrl,
    languages: {
      "es-ES": siteUrl,
      "x-default": siteUrl,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        {children}
        {/* Relaciones de enlace que anuncian las superficies para agentes.
            React las eleva al <head>. `service-desc` es la relación
            registrada (RFC 8631) con la que un cliente encuentra la
            descripción de una API sin que nadie se la pase a mano: es la
            diferencia entre publicar la especificación y que se pueda
            descubrir. */}
        <link rel="service-desc" type="application/openapi+json" href="/openapi.json" title="OpenAPI 3.1 — sgomez.dev Public API" />
        <link rel="service-doc" type="text/html" href="/developers" title="Portal para desarrolladores de sgomez.dev" />
        <link rel="alternate" type="text/markdown" href="/llms.txt" title="llms.txt — resumen factual del sitio" />
        <link rel="author" href="/about" />
        <link rel="privacy-policy" href="/privacy" />
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
