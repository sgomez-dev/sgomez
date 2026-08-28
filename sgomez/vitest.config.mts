import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * Vitest corre los módulos de `src/lib` y las route handlers directamente en
 * Node: no hay JSDOM porque nada de lo que se prueba aquí toca el DOM. Las
 * handlers de App Router son funciones `(Request) => Response`, así que se
 * pueden invocar tal cual sin levantar un servidor.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
