import { llmsFullTxt } from "@/lib/machine/llms-full";

/** /en/llms-full.txt: el mismo documento que /llms-full.txt, con el contenido en inglés. */
export const dynamic = "force-static";
export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ lang: "en" }];
}

export function GET(): Response {
  return new Response(llmsFullTxt("en"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
