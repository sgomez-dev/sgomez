import { llmsFullTxt } from "@/lib/machine/llms-full";

/** /llms-full.txt — todo el contenido del sitio en markdown, en español. Ver `llmsFullTxt(lang)`. */
export const dynamic = "force-static";
export const revalidate = 3600;

export function GET(): Response {
  return new Response(llmsFullTxt("es"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
