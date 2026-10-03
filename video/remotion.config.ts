import { Config } from "@remotion/cli/config";

// Render local con Chromium headless. ANGLE da un WebGL estable en Windows,
// Linux y macOS (transmission y PMREM necesitan float render targets).
Config.setChromiumOpenGlRenderer("angle");
Config.setConcurrency(2);
Config.setOverwriteOutput(true);

// `src/lib/lost/shards.ts` vive en la app (fuera de `video/`) y no se copia:
// la importamos por ruta relativa. Webpack lo resuelve tal cual, pero lo
// dejamos explícito para que cualquier cambio de layout falle aquí y no a mitad
// de un render.
Config.overrideWebpackConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    extensionAlias: { ".js": [".ts", ".tsx", ".js"] },
  },
}));
