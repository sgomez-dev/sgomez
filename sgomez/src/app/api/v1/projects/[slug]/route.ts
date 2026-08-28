import { collectionMeta, getProject, getProjects } from "@/lib/api/data";
import { jsonOk, notFound } from "@/lib/api/http";
import { API_BASE } from "@/lib/site";

export { POST, PUT, PATCH, DELETE, OPTIONS } from "@/lib/api/http";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    // El error lleva los slugs válidos: un agente que se equivoca de slug
    // puede corregirlo con esta misma respuesta, sin una segunda llamada.
    const available = getProjects().map((item) => item.slug).join(", ");
    return notFound(
      `No project with slug "${slug}".`,
      `Known slugs: ${available}. List them with GET ${API_BASE}/projects.`,
    );
  }

  return jsonOk({ data: project, meta: collectionMeta(1, `${API_BASE}/projects/${slug}`) });
}
