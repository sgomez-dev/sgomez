import { collectionMeta, getProject, getProjects } from "@/lib/api/data";
import { jsonOk, notFound, resolveLang } from "@/lib/api/http";
import { API_BASE } from "@/lib/site";

export { POST, PUT, PATCH, DELETE, OPTIONS } from "@/lib/api/http";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  const lang = resolveLang(request);
  const project = getProject(slug, lang);

  if (!project) {
    // El error lleva los slugs válidos: un agente que se equivoca de slug
    // puede corregirlo con esta misma respuesta, sin una segunda llamada.
    const available = getProjects(lang).map((item) => item.slug).join(", ");
    return notFound(
      `No project with slug "${slug}".`,
      `Known slugs: ${available}. List them with GET ${API_BASE}/projects.`,
    );
  }

  return jsonOk({ data: project, meta: collectionMeta(1, `${API_BASE}/projects/${slug}`) });
}
