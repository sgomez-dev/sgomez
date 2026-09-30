import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NotFoundBody from "@/app/components/NotFoundBody";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

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

export default function GlobalNotFound() {
  return (
    <html lang="es-ES">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}>
        <main>
          <NotFoundBody lang="es" />
          <div lang="en">
            <NotFoundBody lang="en" />
          </div>
        </main>
      </body>
    </html>
  );
}
