import { llmsTxt } from "@/lib/machine/llms-txt";

/**
 * /llms.txt — la versión de raíz enlaza las páginas en español. El cuerpo lo
 * construye `llmsTxt(lang)`, compartido con /en/llms.txt.
 */
export const dynamic = "force-static";
export const revalidate = 3600;

export function GET(): Response {
  return new Response(llmsTxt("es"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
