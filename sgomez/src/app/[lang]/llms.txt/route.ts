import { llmsTxt } from "@/lib/machine/llms-txt";

/** /en/llms.txt: el mismo documento que /llms.txt, enlazando las páginas inglesas. */
export const dynamic = "force-static";
export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ lang: "en" }];
}

export function GET(): Response {
  return new Response(llmsTxt("en"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
