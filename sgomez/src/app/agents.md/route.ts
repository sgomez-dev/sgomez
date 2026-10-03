import { agentsMd } from "@/lib/machine/agents-md";

/** /agents.md — versión de raíz, con las páginas en español. Ver `agentsMd(lang)`. */
export const dynamic = "force-static";
export const revalidate = 3600;

export function GET(): Response {
  return new Response(agentsMd("es"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
      Vary: "Accept, Accept-Encoding",
    },
  });
}
