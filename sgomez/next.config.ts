import type { NextConfig } from "next";

/**
 * `Vary` de las páginas incluye `Accept` porque la misma URL sirve HTML o
 * markdown según lo que pida el cliente (ver `src/proxy.ts`). El valor repite
 * los cuatro tokens de RSC que Next añade por su cuenta: la capa que acabe
 * aplicando esta cabecera la fija entera, y quedarse solo con `Accept`
 * rompería el prefetch de la navegación de cliente.
 *
 * Debe coincidir con `PAGE_VARY` de `src/lib/site.ts` y con `vercel.json`;
 * hay un test que lo comprueba. En Vercel quien manda es `vercel.json`: las
 * páginas prerenderizadas salen de la caché con el `Vary` que el builder
 * guarda junto al HTML, y solo una transformación de la respuesta lo pisa.
 * Esta regla cubre `next start` y cualquier otro despliegue.
 */
const PAGE_VARY =
  "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch, Accept, Accept-Encoding";

/**
 * `E2E_FIXTURES=1` monta la ruta de prueba /e2e-sequence y sus fotogramas. Solo es para el build del e2e: un despliegue de
 * Vercel (que define `VERCEL_ENV`) con la variable puesta publicaría una página de pruebas, así que el build se aborta.
 */
if (process.env.E2E_FIXTURES === "1" && process.env.VERCEL_ENV) {
  throw new Error("E2E_FIXTURES=1 no puede usarse en un build de Vercel (VERCEL_ENV está definida).");
}

const nextConfig: NextConfig = {
  experimental: { viewTransition: true },
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
        // El molde del 404 no es una página pública: nunca se indexa ni se cachea en una CDN.
        source: "/:lang(es|en)/perdido",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, follow" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
      {
        // Solo las páginas: /api y los assets con hash sirven su propio Vary.
        source: "/((?!api$|api/|_next/static/|_next/image).*)",
        headers: [{ key: "Vary", value: PAGE_VARY }],
      },
    ];
  },
};

export default nextConfig;
