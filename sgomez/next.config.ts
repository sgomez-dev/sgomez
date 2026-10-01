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
  experimental: { globalNotFound: true },
  images: {
    // Las portadas del blog viven en el almacenamiento de Supabase. Se listan solo
    // ellas para que el optimizador no sea un proxy abierto: el servidor las
    // descarga y las sirve desde este dominio, así que el navegador no pide nada
    // a terceros (la política de privacidad lo dice).
    remotePatterns: [
      { protocol: "https", hostname: "veelwadirgvhyvquvfnn.supabase.co", pathname: "/storage/v1/object/public/blog/**" },
    ],
  },
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
