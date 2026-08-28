import { IDENTITY, SKYQUETZ } from "@/app/seo";
import {
  about,
  certifications,
  contactLinks,
  education,
  experience,
  hero,
  projects,
  recommendations,
  technologies,
} from "@/app/content";
import { API_BASE, SITE_URL, absolute } from "@/lib/site";
import { slugify } from "@/lib/api/slug";

/**
 * Capa de datos de la API pública.
 *
 * No hay base de datos ni una segunda copia del contenido: todo sale de
 * `content/index.tsx` y de `seo.ts`, que son los mismos módulos que renderiza
 * la home y que alimentan el JSON-LD y /llms.txt. Si esta capa duplicara los
 * textos, la API y la página se contradirían en cuanto alguien editara uno de
 * los dos, que es exactamente el problema que /llms.txt ya resuelve así.
 */

export type Profile = {
  name: string;
  given_name: string;
  family_name: string;
  headline: string;
  job_title: string;
  co_founder_of: { name: string; url: string; role: string };
  employer: { name: string; url: string };
  summary: string;
  location: { city: string; region: string; country: string; remote: boolean };
  languages: string[];
  email: string;
  url: string;
  image: string;
  availability: { open_to_work: boolean; statement: string };
  knows_about: string[];
  profiles: { label: string; url: string }[];
};

export type Project = {
  slug: string;
  title: string;
  description: string;
  stack: string[];
  url: string;
  api_url: string;
};

export type ExperienceEntry = {
  slug: string;
  role: string;
  organization: string;
  period: string;
  description: string;
};

export type SkillCategory = {
  category: string;
  slug: string;
  skills: { name: string; years: string }[];
};

export type Certification = {
  slug: string;
  title: string;
  institution: string;
  date: string;
  credential_url: string;
};

export type EducationEntry = { slug: string; institution: string; detail: string };

export type Recommendation = {
  slug: string;
  name: string;
  date: string;
  comment: string;
  recommender_url: string;
};

export type SearchResult = {
  type: "project" | "experience" | "skill" | "certification" | "recommendation";
  slug: string;
  title: string;
  snippet: string;
  url: string;
  score: number;
};

/** Aplana el texto multilínea de `about.description` a una sola línea. */
function collapse(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function getProfile(): Profile {
  return {
    name: IDENTITY.name,
    given_name: IDENTITY.givenName,
    family_name: IDENTITY.familyName,
    headline: hero.title,
    job_title: IDENTITY.jobTitle,
    co_founder_of: {
      name: SKYQUETZ.name,
      url: SKYQUETZ.url,
      // Cofundador, no fundador: son cuatro socios y la API es una de las
      // superficies desde las que un modelo se lo puede llevar mal citado.
      role: "Co-founder (one of four founding partners), leads engineering",
    },
    employer: { name: "Evenbytes", url: "https://evenbytes.com" },
    summary: IDENTITY.description,
    location: {
      city: IDENTITY.location.city,
      region: IDENTITY.location.region,
      country: IDENTITY.location.country,
      remote: true,
    },
    languages: ["es", "en"],
    email: IDENTITY.email,
    url: IDENTITY.url,
    image: IDENTITY.image,
    availability: {
      open_to_work: true,
      statement:
        "Open to freelance work and collaboration on AI/LLM and full-stack projects. Contact by email or LinkedIn.",
    },
    knows_about: [...IDENTITY.knowsAbout],
    profiles: [
      { label: "Portfolio", url: IDENTITY.url },
      { label: "Blog", url: "https://blog.sgomez.dev" },
      { label: "NudaUI", url: "https://nudaui.dev" },
      { label: SKYQUETZ.name, url: SKYQUETZ.url },
      ...contactLinks.map((link) => ({ label: link.label, url: link.url })),
    ],
  };
}

export function getProjects(): Project[] {
  return projects.map((project) => {
    const slug = slugify(project.title);
    return {
      slug,
      title: project.title,
      description: project.desc,
      // `stack` llega como una cadena separada por comas en el contenido de la
      // página; la API la publica como array porque un cliente que filtre por
      // tecnología no debería tener que partir cadenas.
      stack: project.stack.split(",").map((item) => item.trim()).filter(Boolean),
      url: project.link,
      api_url: absolute(`${API_BASE}/projects/${slug}`),
    };
  });
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((project) => project.slug === slug);
}

export function getExperience(): ExperienceEntry[] {
  return experience.map((entry) => {
    // `title` del contenido es "Organización - Ubicación"; la organización es
    // lo que va antes del primer guion.
    const organization = entry.title.split(" - ")[0].trim();
    return {
      slug: slugify(`${entry.role}-${organization}`),
      role: entry.role,
      organization: entry.title,
      period: entry.period,
      description: collapse(entry.desc),
    };
  });
}

export function getSkills(): SkillCategory[] {
  return technologies.map((group) => ({
    category: group.category,
    slug: slugify(group.category),
    skills: group.skills.map((skill) => ({ name: skill.name, years: skill.years })),
  }));
}

export function getCertifications(): Certification[] {
  return certifications.map((certification) => ({
    slug: slugify(`${certification.title}-${certification.institution}`),
    title: certification.title,
    institution: certification.institution,
    date: certification.date,
    credential_url: certification.url,
  }));
}

export function getEducation(): EducationEntry[] {
  return education.map((entry) => ({
    slug: slugify(entry.title),
    institution: entry.title,
    detail: entry.desc,
  }));
}

export function getRecommendations(): Recommendation[] {
  return recommendations.map((entry) => ({
    slug: slugify(entry.name),
    name: entry.name,
    date: entry.date,
    // Algunas recomendaciones son un array de párrafos y otras una cadena.
    comment: Array.isArray(entry.comment) ? entry.comment.join("\n\n") : entry.comment,
    recommender_url: entry.recommenderUrl,
  }));
}

export function getAbout(): { summary: string; timeline: { year: string; title: string; description: string }[] } {
  return {
    summary: collapse(about.description),
    timeline: about.timeline.map((item) => ({
      year: item.year,
      title: item.title,
      description: item.desc,
    })),
  };
}

/**
 * Búsqueda de texto sobre todo el contenido publicado.
 *
 * Determinista y sin dependencias: cuenta cuántos de los términos de la
 * consulta aparecen en el documento y por dónde (el título pesa más que el
 * cuerpo). No es un ranking semántico y no pretende serlo; es lo que un
 * agente necesita para localizar el recurso concreto que va a pedir después
 * por su endpoint.
 */
export function search(query: string, limit: number): SearchResult[] {
  const terms = query
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (terms.length === 0) return [];

  const documents: { result: Omit<SearchResult, "score">; haystack: string; title: string }[] = [];

  for (const project of getProjects()) {
    documents.push({
      result: {
        type: "project",
        slug: project.slug,
        title: project.title,
        snippet: project.description,
        url: project.api_url,
      },
      title: project.title,
      haystack: `${project.title} ${project.description} ${project.stack.join(" ")}`,
    });
  }
  for (const entry of getExperience()) {
    documents.push({
      result: {
        type: "experience",
        slug: entry.slug,
        title: `${entry.role} — ${entry.organization}`,
        snippet: entry.description,
        url: absolute(`${API_BASE}/experience`),
      },
      title: `${entry.role} ${entry.organization}`,
      haystack: `${entry.role} ${entry.organization} ${entry.description} ${entry.period}`,
    });
  }
  for (const group of getSkills()) {
    for (const skill of group.skills) {
      documents.push({
        result: {
          type: "skill",
          slug: slugify(skill.name),
          title: skill.name,
          snippet: `${group.category} — ${skill.years} años de experiencia`,
          url: absolute(`${API_BASE}/skills`),
        },
        title: skill.name,
        haystack: `${skill.name} ${group.category}`,
      });
    }
  }
  for (const certification of getCertifications()) {
    documents.push({
      result: {
        type: "certification",
        slug: certification.slug,
        title: certification.title,
        snippet: `${certification.institution} — ${certification.date}`,
        url: absolute(`${API_BASE}/certifications`),
      },
      title: certification.title,
      haystack: `${certification.title} ${certification.institution}`,
    });
  }
  for (const recommendation of getRecommendations()) {
    documents.push({
      result: {
        type: "recommendation",
        slug: recommendation.slug,
        title: `Recomendación de ${recommendation.name}`,
        snippet: recommendation.comment.slice(0, 240),
        url: absolute(`${API_BASE}/recommendations`),
      },
      title: recommendation.name,
      haystack: `${recommendation.name} ${recommendation.comment}`,
    });
  }

  const normalize = (value: string) =>
    value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const scored: SearchResult[] = [];
  for (const document of documents) {
    const haystack = normalize(document.haystack);
    const title = normalize(document.title);
    let score = 0;
    for (const term of terms) {
      if (title.includes(term)) score += 2;
      else if (haystack.includes(term)) score += 1;
    }
    if (score > 0) scored.push({ ...document.result, score });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit);
}

/** Metadatos comunes a toda respuesta correcta de la API. */
export function collectionMeta(count: number, path: string) {
  return {
    count,
    self: absolute(path),
    source: SITE_URL,
    documentation_url: absolute("/developers"),
  };
}
