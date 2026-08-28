import type { NextConfig } from "next";

/**
 * `Vary` de las páginas incluye `Accept` porque la misma URL sirve HTML o
 * markdown según lo que pida el cliente (ver `src/proxy.ts`). El valor repite
 * los cuatro tokens de RSC que Next añade por su cuenta: la capa que acabe
 * aplicando esta cabecera la fija entera, y quedarse solo con `Accept`
 * rompería el prefetch de la navegación de cliente.
 *
 * Debe coincidir con `PAGE_VARY` de `src/lib/site.ts` y con `vercel.json`;
 * hay un test que lo comprueba.
 */
const PAGE_VARY =
  "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch, Accept, Accept-Encoding";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Solo las páginas: /api y los assets con hash sirven su propio Vary.
        source: "/((?!api/|_next/static/|_next/image).*)",
        headers: [{ key: "Vary", value: PAGE_VARY }],
      },
    ];
  },
};

export default nextConfig;
