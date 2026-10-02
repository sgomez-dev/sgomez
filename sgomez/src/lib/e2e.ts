/**
 * Páginas que solo existen en las pruebas e2e. Con E2E_FIXTURES=1 (lo pone playwright.config.ts al construir y servir)
 * `/e2e-sequence` monta el reproductor con una secuencia de prueba. Sin la variable, la ruta no se prerenderiza, el proxy
 * no la deja pasar (responde el 404 de siempre) y la página llama a notFound().
 */
export const E2E_FIXTURE_PATHS = ["/e2e-sequence"] as const;
export const e2eFixturesEnabled = () => process.env.E2E_FIXTURES === "1";
