import type { MetadataRoute } from "next";

/**
 * Web App Manifest — installability + richer identity signals for browsers,
 * app stores and crawlers. Served by Next at /manifest.webmanifest.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Santiago Gómez de la Torre Romero — Full-Stack Engineer (AI/LLM)",
    short_name: "Santiago Gómez",
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
      {
        src: "/Santiago_Gómez_de_la_Torre_Romero.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/Santiago_Gómez_de_la_Torre_Romero.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
