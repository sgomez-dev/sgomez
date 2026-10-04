import type { MetadataRoute } from "next";

/**
 * Web App Manifest — installability + richer identity signals for browsers,
 * app stores and crawlers. Served by Next at /manifest.webmanifest.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Santiago Gómez de la Torre Romero · Full-Stack Engineer (AI/LLM)",
    short_name: "sgomez.dev",
    description:
      "Full-stack engineer que lleva la IA a producción. Creador de NudaUI y de una búsqueda semántica (RAG) en vivo sobre su catálogo.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    lang: "es-ES",
    dir: "ltr",
    categories: ["technology", "developer", "portfolio", "productivity"],
    icons: [
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // A sangre y con el cristal dentro de la zona segura: Android lo recorta con su propia forma.
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
