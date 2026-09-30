import { agentsMd } from "@/lib/machine/agents-md";

/** /en/agents.md: el mismo documento que /agents.md, enlazando las páginas inglesas. */
export const dynamic = "force-static";
export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ lang: "en" }];
}

export function GET(): Response {
  return new Response(agentsMd("en"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
      Vary: "Accept, Accept-Encoding",
    },
  });
}
