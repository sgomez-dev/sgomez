import { IDENTITY, IDENTITY_TEXT, SKYQUETZ } from "@/app/seo";
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
import { DEFAULT_LANG, type Lang } from "@/i18n/languages";
import { t } from "@/lib/content/localized";

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
  /** Siempre el texto original, en el idioma en que lo escribió su autor. */
  comment: string;
  original_language: "es";
  /** Solo con `lang=en`: traducción al inglés, que no son palabras del autor. */
  comment_translation?: string;
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

/** Idioma por defecto de todos los getters: lo que la API devolvía antes de tener idioma. */
const ES: Lang = DEFAULT_LANG;

export function getProfile(lang: Lang = ES): Profile {
  return {
    name: IDENTITY.name,
    given_name: IDENTITY.givenName,
    family_name: IDENTITY.familyName,
    headline: t(hero.title, lang),
    job_title: IDENTITY.jobTitle,
    co_founder_of: {
      name: SKYQUETZ.name,
      url: SKYQUETZ.url,
      // Cofundador, no fundador: son cuatro socios y la API es una de las
      // superficies desde las que un modelo se lo puede llevar mal citado.
      role: "Co-founder (one of four founding partners), leads engineering",
    },
    employer: { name: "Evenbytes", url: "https://evenbytes.com" },
    summary: t(IDENTITY_TEXT.description, lang),
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

export function getProjects(lang: Lang = ES): Project[] {
  return projects.map((project) => {
    const slug = slugify(project.title);
    return {
      slug,
      title: project.title,
      description: t(project.desc, lang),
      // `stack` llega como una cadena separada por comas en el contenido de la
      // página; la API la publica como array porque un cliente que filtre por
      // tecnología no debería tener que partir cadenas.
      stack: project.stack.split(",").map((item) => item.trim()).filter(Boolean),
      url: project.link,
      api_url: absolute(`${API_BASE}/projects/${slug}`),
    };
  });
}

export function getProject(slug: string, lang: Lang = ES): Project | undefined {
  return getProjects(lang).find((project) => project.slug === slug);
}

export function getExperience(lang: Lang = ES): ExperienceEntry[] {
  return experience.map((entry) => {
    // `title` del contenido es "Organización - Ubicación"; la organización es
    // lo que va antes del primer guion.
    const organization = entry.title.split(" - ")[0].trim();
    return {
      slug: slugify(`${t(entry.role, "es")}-${organization}`),
      role: t(entry.role, lang),
      organization: entry.title,
      period: t(entry.period, lang),
      description: collapse(t(entry.desc, lang)),
    };
  });
}

export function getSkills(lang: Lang = ES): SkillCategory[] {
  return technologies.map((group) => ({
    category: t(group.category, lang),
    slug: slugify(t(group.category, "es")),
    skills: group.skills.map((skill) => ({ name: skill.name, years: skill.years })),
  }));
}

export function getCertifications(lang: Lang = ES): Certification[] {
  return certifications.map((certification) => ({
    slug: slugify(`${certification.title}-${certification.institution}`),
    title: certification.title,
    institution: certification.institution,
    date: t(certification.date, lang),
    credential_url: certification.url,
  }));
}

export function getEducation(lang: Lang = ES): EducationEntry[] {
  return education.map((entry) => ({
    slug: slugify(entry.title),
    institution: entry.title,
    detail: t(entry.desc, lang),
  }));
}

/** Algunas recomendaciones son un array de párrafos y otras una cadena. */
function joinParagraphs(text: string | string[]): string {
  return Array.isArray(text) ? text.join("\n\n") : text;
}

export function getRecommendations(lang: Lang = ES): Recommendation[] {
  return recommendations.map((entry) => ({
    slug: slugify(entry.name),
    name: entry.name,
    date: entry.date,
    // El comentario es siempre el original: una cita no se atribuye en un
    // idioma que su autor no escribió. La traducción va en un campo aparte.
    comment: joinParagraphs(entry.comment),
    original_language: "es" as const,
    ...(lang === "en" ? { comment_translation: joinParagraphs(entry.commentEn) } : {}),
    recommender_url: entry.recommenderUrl,
  }));
}

export function getAbout(lang: Lang = ES): { summary: string; timeline: { year: string; title: string; description: string }[] } {
  return {
    summary: collapse(t(about.description, lang)),
    timeline: about.timeline.map((item) => ({
      year: item.year,
      title: t(item.title, lang),
      description: t(item.desc, lang),
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
export function search(query: string, limit: number, lang: Lang = ES): SearchResult[] {
  const terms = query
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (terms.length === 0) return [];

  const documents: { result: Omit<SearchResult, "score">; haystack: string; title: string }[] = [];

  for (const project of getProjects(lang)) {
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
  for (const entry of getExperience(lang)) {
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
  for (const group of getSkills(lang)) {
    for (const skill of group.skills) {
      documents.push({
        result: {
          type: "skill",
          slug: slugify(skill.name),
          title: skill.name,
          snippet:
            lang === "en"
              ? `${group.category} — ${skill.years} years of experience`
              : `${group.category} — ${skill.years} años de experiencia`,
          url: absolute(`${API_BASE}/skills`),
        },
        title: skill.name,
        haystack: `${skill.name} ${group.category}`,
      });
    }
  }
  for (const certification of getCertifications(lang)) {
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
  for (const recommendation of getRecommendations(lang)) {
    documents.push({
      result: {
        type: "recommendation",
        slug: recommendation.slug,
        title: lang === "en" ? `Recommendation from ${recommendation.name}` : `Recomendación de ${recommendation.name}`,
        snippet: (recommendation.comment_translation ?? recommendation.comment).slice(0, 240),
        url: absolute(`${API_BASE}/recommendations`),
      },
      title: recommendation.name,
      haystack: `${recommendation.name} ${recommendation.comment} ${recommendation.comment_translation ?? ""}`,
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
