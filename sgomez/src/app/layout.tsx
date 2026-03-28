import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
const siteName = "Santiago Gómez de la Torre Romero - Software Engineer";
const siteTitle =
  "Santiago Gómez de la Torre Romero – Senior Software Engineer & Frontend Developer";
const siteDescription =
  "Portfolio de Santiago Gómez de la Torre Romero, Senior Software Engineer especializado en frontend moderno, UX y productos digitales de alto impacto. Proyectos reales, experiencia y contacto.";

export const metadata: Metadata = {
  title: {
    default: siteTitle,
    template: "%s | " + siteName,
  },
  description: siteDescription,
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  creator: "Santiago Gómez de la Torre Romero",
  authors: [{ name: "Santiago Gómez de la Torre Romero", url: siteUrl }],
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
    "software engineer",
    "senior frontend developer",
    "full-stack developer",
    "TypeScript",
    "React",
    "Angular",
    "Next.js",
    "Node.js",
    "Google Cloud",
    "portfolio",
    "desarrollador web",
    "ingeniero de software",
    "Santander",
    "España",
  ],
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName,
    type: "website",
    locale: "es_ES",
    images: [
      {
        url: "/Santiago_Gómez_de_la_Torre_Romero.png",
        width: 1200,
        height: 630,
        alt: "Foto de Santiago Gómez - Software Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    creator: "@", // rellena tu @ de X/Twitter si quieres
    images: ["/Santiago_Gómez_de_la_Torre_Romero.png"],
  },
  alternates: {
    canonical: siteUrl,
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Santiago Gómez de la Torre Romero",
              url: siteUrl,
              jobTitle: "Senior Software Engineer",
              description: siteDescription,
              sameAs: [
                "https://linkedin.com/in/sgomez-dev",
                "https://github.com/sgomez-dev",
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
