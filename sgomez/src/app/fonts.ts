import localFont from "next/font/local";

/**
 * Fuentes autoalojadas (OFL, ver fonts/OFL.txt). Antes venían de Google Fonts y
 * el build del CI fallaba cuando no podía descargarlas. Mismos pesos, mismo subconjunto
 * latino y mismas variables CSS: tokens.css no cambia.
 */
export const sans = localFont({
  src: [
    { path: "./fonts/inter-tight-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/inter-tight-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/inter-tight-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-inter-tight",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: "Arial",
});

export const serif = localFont({
  src: [
    { path: "./fonts/instrument-serif-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/instrument-serif-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-instrument-serif",
  display: "swap",
  fallback: ["Georgia", "serif"],
  adjustFontFallback: "Times New Roman",
});
