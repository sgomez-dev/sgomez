import type { Metadata, Viewport } from "next";
import { Inter_Tight, Instrument_Serif } from "next/font/google";
import NotFoundBody from "@/app/components/NotFoundBody";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getDictionary } from "@/i18n";
import "./globals.css";

const sans = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", weight: ["400", "500", "600"], display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], variable: "--font-instrument-serif", weight: "400", style: ["normal", "italic"], display: "swap" });

/**
 * 404 global. Con `app/[lang]/layout.tsx` como layout raíz, Next 16 no
 * renderiza en servidor un `notFound()` lanzado desde una página (el HTML sale
 * como el esqueleto `__next_error__`, vacío, y lo pinta el cliente); las rutas
 * que no casan con nada sí pasan por este fichero, que sale completo en el
 * HTML. Se prerenderiza una sola vez y no recibe `params`, así que lleva los
 * dos idiomas: el español primero, que es el idioma por defecto.
 */
export const metadata: Metadata = {
  title: "404 — Página no encontrada / Page not found | sgomez.dev",
  description:
    "La ruta pedida no existe en sgomez.dev. / The requested route does not exist on sgomez.dev. Inicio, páginas, sitemap, llms.txt y API pública.",
  robots: { index: false, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#05060a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function GlobalNotFound() {
  return (
    <html lang="es-ES">
      <body className={`${sans.variable} ${serif.variable} antialiased`}>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-[color:var(--text)] focus:px-4 focus:py-2 focus:text-sm focus:text-[color:var(--bg)]">
          {getDictionary("es").nav.skip}
        </a>
        <Nav lang="es" />
        <main id="main" className="pt-16">
          <NotFoundBody lang="es" />
          <div lang="en">
            <NotFoundBody lang="en" />
          </div>
        </main>
        <Footer lang="es" />
      </body>
    </html>
  );
}
