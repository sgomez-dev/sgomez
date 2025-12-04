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
  keywords: [
    "Santiago Gómez de la Torre Romero",
    "Santiago Gómez de la Torre Romero developer",
    "software engineer",
    "frontend developer",
    "TypeScript",
    "React",
    "Next.js",
    "portfolio",
    "desarrollador web",
    "ingeniero de software",
    "Santiago Gómez de la Torre Romero",
    "Santiago Gómez de la Torre Romero developer",
    "software engineer",
    "frontend developer",
    "TypeScript",
    "React",
    "Next.js",
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
      </body>
    </html>
  );
}
