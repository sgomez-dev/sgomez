/**
 * Canonical identity + JSON-LD entity graph for sgomez.dev.
 *
 * This is the SEO/GEO hub: one @graph that ties the Person to every property he
 * owns (NudaUI, the CLI, the blog, GitHub, LinkedIn) via sameAs + creator/author
 * links, so search engines and LLMs resolve them as ONE entity and the authority
 * flows between them. Keep this in sync with the same identity used on
 * nudaui.dev, blog.sgomez.dev and the CLI landing so everything stays "in line".
 */

import type { Localized } from "@/lib/content/localized";
import { localizedPath, type Lang } from "@/i18n/languages";
import { CONTENT_UPDATED, ROUTE_CATALOGUE, latestContentUpdate, type LogicalPath } from "@/lib/routing/pages";

/**
 * Textos de la identidad que se muestran a una persona y por tanto existen en
 * los dos idiomas. `IDENTITY.description` y `IDENTITY.coFounderTitle` son la
 * versión española (compatibilidad); el JSON-LD y los documentos markdown leen
 * `IDENTITY_TEXT[campo][lang]`, así que nada en inglés cae al español.
 */
export const IDENTITY_TEXT = {
  description: {
    es: "Santiago Gómez de la Torre Romero es un full-stack engineer que lleva la IA a producción. Cofundador de SkyQuetz Consulting, creador de NudaUI y de una búsqueda semántica (RAG) en vivo sobre su catálogo. Developer en Evenbytes y organizador de GDG Santander.",
    en: "Santiago Gómez de la Torre Romero is a full-stack engineer who takes AI to production. Co-founder of SkyQuetz Consulting, creator of NudaUI and of a live semantic search (RAG) over its catalog. Developer at Evenbytes and organizer of GDG Santander.",
  } satisfies Localized,
  // Segundo título real de la persona (ver `IDENTITY.coFounderTitle`), en los dos idiomas.
  coFounderTitle: {
    es: "Cofundador de SkyQuetz Consulting",
    en: "Co-founder of SkyQuetz Consulting",
  } satisfies Localized,
  // Tercer título real: cofundador de Forgia, en los dos idiomas.
  coFounderForgiaTitle: {
    es: "Cofundador de Forgia",
    en: "Co-founder of Forgia",
  } satisfies Localized,
};

export const IDENTITY = {
  name: "Santiago Gómez de la Torre Romero",
  givenName: "Santiago",
  familyName: "Gómez de la Torre Romero",
  url: "https://sgomez.dev",
  jobTitle: "Full-Stack Engineer (AI/LLM)",
  // Segundo título real, no un adorno del primero: `jobTitle` acepta varios
  // valores y este es el que conecta a la persona con una organización que
  // existe y que ya lo declara cofundador desde su lado.
  coFounderTitle: IDENTITY_TEXT.coFounderTitle.es,
  email: "contact@sgomez.dev",
  image: "https://sgomez.dev/Santiago_Gómez_de_la_Torre_Romero.png",
  description: IDENTITY_TEXT.description.es,
  location: { city: "Santander", region: "Cantabria", country: "ES" },
  // sameAs cluster — every profile/property that is "also him". This is what
  // merges the domains into a single entity graph.
  sameAs: [
    "https://nudaui.dev",
    "https://claude-canvas.sgomez.dev",
    "https://blog.sgomez.dev",
    "https://github.com/sgomez-dev",
    "https://linkedin.com/in/sgomez-dev",
    "https://www.npmjs.com/package/sgomez-cli",
    "https://instagram.com/santigt1503",
    // La web de las skills y la forma canónica del perfil de LinkedIn (la misma
    // cuenta que la forma sin `www` de arriba, que se conserva).
    "https://skills.sgomez.dev",
    // Su página de enlaces (tarjeta NFC y redes): declara esta misma persona con este mismo @id.
    "https://links.sgomez.dev/",
    "https://www.linkedin.com/in/sgomez-dev/",
  ],
  knowsAbout: [
    "RAG (retrieval augmented generation)",
    "Large Language Models (LLMs)",
    "Embeddings",
    "Semantic search",
    "Evals",
    "Prompt engineering",
    "Full-stack development",
    "Node.js",
    "React",
    "Next.js",
    "TypeScript",
    "Python",
    "FastAPI",
    "Google Cloud",
    "Open source",
    "Developer tooling",
    "Claude Code plugins",
    "Terminal user interfaces (TUI)",
  ],
} as const;

/**
 * SkyQuetz Consulting — la organización que cofundó.
 *
 * DOS ENTIDADES, NO UNA. Este sitio es el perfil de una persona; SkyQuetz es una
 * empresa con cuatro socios fundadores. Lo que se declara entre ellas es la
 * relación (founder / worksFor / memberOf), nunca una identidad: `skyquetz.com`
 * no aparece en el `sameAs` del Person, y no debe aparecer, porque ese campo
 * significa "esto también es él".
 *
 * `orgId` NO es un @id inventado para este sitio: es el @id que skyquetz.com usa
 * para sí misma en su propio @graph. Al declararlo como `sameAs` del nodo local
 * de la ORGANIZACIÓN, los dos grafos coinciden en que hablan de la misma
 * empresa, en vez de tratarla como dos compañías distintas con el mismo nombre.
 *
 * La otra mitad de la relación ya existía: skyquetz.com declara su nodo
 * `#founder` (Santiago, jobTitle "Cofundador") con `sameAs` apuntando a
 * https://sgomez.dev. Lo que faltaba era la vuelta, y una afirmación en un
 * solo sentido vale mucho menos que la misma afirmación hecha por las dos
 * partes con los mismos identificadores.
 */
export const SKYQUETZ = {
  name: "SkyQuetz Consulting",
  url: "https://skyquetz.com",
  orgId: "https://skyquetz.com/#org",
  founderId: "https://skyquetz.com/#founder",
  foundingDate: "2026",
  slogan: "Estándar internacional, trato cercano.",
  description:
    "Consultora tecnológica de software a medida con estándar internacional: sistemas, plataformas, automatizaciones e integraciones, además de páginas web, tiendas en línea, aplicaciones y mantenimiento. Atención 100% remota a clientes de habla hispana.",
  // El mismo texto en inglés, para la narración de /llms.txt, que va en inglés.
  // Antes se colaba ahí la versión castellana y la frase quedaba a medias
  // entre los dos idiomas.
  descriptionEn:
    "A software consultancy building custom systems, platforms, automations and integrations, plus websites, online stores, apps and maintenance. Fully remote, serving Spanish-speaking clients.",
  /**
   * Contacto y sede de la empresa, copiados del nodo `#org` que publica
   * skyquetz.com (revisado el 4 de octubre de 2026). Antes este sitio daba el
   * email personal de Santiago y una sede en Santander; skyquetz.com ya publica
   * su propio `contactPoint` y su dirección, así que mandan esos.
   *
   * La dirección es solo el país, porque es lo único que skyquetz.com declara
   * en su `PostalAddress` (Guatemala). No se completa con ciudad ni calle: una
   * dirección que la propia empresa no publica sería un dato inventado.
   */
  contactType: "sales",
  contactEmail: "contacto@skyquetz.com",
  contactUrl: "https://wa.me/34600013216",
  address: { country: "GT" },
  synentria: {
    name: "Synentria",
    url: "https://synentria.skyquetz.com",
    description:
      "Motor de auditoría SEO y GEO: analiza un sitio y devuelve hallazgos priorizados más parches aplicables. Ningún hallazgo lo decide un modelo de lenguaje; todos salen de comprobaciones deterministas.",
    descriptionEn:
      "SEO and GEO audit engine: it analyzes a site and returns prioritized findings plus applicable patches. No finding is decided by a language model; all of them come from deterministic checks.",
  },
  packatrack: {
    name: "Packatrack",
    url: "https://packatrack.skyquetz.com",
    description:
      "SaaS B2B de conciliación de liquidaciones para operadores de última milla: calcula lo que una operación debía facturar a partir de sus rutas, tarifas e incidencias, lo compara con la liquidación recibida del carrier y documenta cada diferencia con su dato de origen.",
    descriptionEn:
      "B2B SaaS for settlement reconciliation for last-mile operators: it computes what an operation should have invoiced from its routes, rates and incidents, compares it with the settlement received from the carrier and documents every difference with its source data.",
  },
} as const;

/**
 * Forgia — la segunda empresa que cofundó (junio de 2026).
 *
 * Lo que se afirma sale de forgia.es y de nada más. Son DOS socios fundadores,
 * y Santiago lleva toda la parte técnica. `forgia.es` NO entra en `sameAs` de
 * la persona: ese campo significa "esto también es él", y una empresa no lo es.
 * No se publican las cifras de marketing de su web ni su eslogan.
 */
export const FORGIA = {
  name: "Forgia",
  url: "https://forgia.es",
  address: { city: "Santander", region: "Cantabria", country: "ES" },
  /**
   * El único canal de contacto de Forgia es WhatsApp. El número es el nuevo
   * español que dio el dueño el 4 de octubre de 2026 (+34 644 636 000); el
   * ecuatoriano que aún sale en forgia.es se retira. No publica email ni JSON-LD propio.
   */
  contactType: "sales",
  contactUrl: "https://wa.me/34644636000",
  description:
    "Sistema de bots de IA que atiende a clientes y cualifica leads por WhatsApp, con un bot inbound, un bot outbound para prospección B2B y un panel CRM.",
  descriptionEn:
    "An AI bot system that answers customers and qualifies leads over WhatsApp, with an inbound bot, an outbound bot for B2B prospecting and a CRM panel.",
} as const;

/** @id local del nodo de Forgia en este grafo (mismo criterio que SKYQUETZ_NODE). */
const FORGIA_NODE = `${IDENTITY.url}/#forgia-org`;

/**
 * Claude Canvas — el proyecto open source, y por qué NO cuelga de SkyQuetz.
 *
 * Es suyo, no de la empresa. El repositorio está bajo su cuenta personal, la
 * licencia es MIT y no hay cliente detrás. SkyQuetz `owns` Synentria y
 * Packatrack porque esos dos SÍ son productos de la casa; colgar de ahí un
 * proyecto personal afirmaría que la empresa es su proveedora, y eso es falso
 * en el único sentido que un grafo entiende. Aquí la única relación declarada
 * es `author`/`creator` desde la persona, igual que NudaUI y el CLI.
 *
 * `basedOn` no es cortesía: esto es un fork del proof of concept de David
 * Siegel, el LICENSE conserva su copyright y tanto el README como la landing
 * lo dicen de entrada. Un grafo que se atribuyera la autoría entera
 * contradiría a las dos fuentes que enlaza, y una contradicción comprobable
 * es exactamente lo que hunde una cita.
 *
 * Los números son los que el repositorio sostiene hoy. `tests` va como "600+"
 * a propósito y no como una cifra exacta: una suite crece, y un dato que solo
 * es cierto la semana que se escribe es peor que uno redondeado a la baja.
 */
export const CLAUDE_CANVAS = {
  name: "Claude Canvas",
  url: "https://claude-canvas.sgomez.dev",
  repo: "https://github.com/sgomez-dev/claude-canvas",
  basedOn: "https://github.com/dvdsgl/claude-canvas",
  basedOnAuthor: "David Siegel",
  license: "https://opensource.org/licenses/MIT",
  install: "/plugin marketplace add sgomez-dev/claude-canvas",
  kinds: 9,
  tests: "600+",
  description:
    "Plugin de Claude Code que le da a Claude una pantalla propia. Abre un panel interactivo de terminal junto a la conversación, tú actúas en él y tu respuesta vuelve como un valor exacto en vez de prosa que el modelo tiene que interpretar. Nueve tipos de panel (picker, form, table, image, diff, dashboard, calendar, document y flight), transporte propio por socket local y CI en Linux, macOS y Windows.",
  descriptionEn:
    "A Claude Code plugin that gives Claude a display of its own. It opens an interactive terminal pane beside the conversation, you act in it, and your answer comes back as an exact value instead of prose the model has to interpret. Nine canvas kinds (picker, form, table, image, diff, dashboard, calendar, document, flight), one length-prefixed JSON transport over a local socket, and CI on Linux, macOS and Windows.",
  /** Lo que un modelo se lleva mal si nadie se lo dice. */
  attributionEs:
    "Es un fork de dvdsgl/claude-canvas, de David Siegel, ampliado a fondo y con licencia MIT conservando el copyright original. Es un proyecto open source personal de Santiago, no un producto de SkyQuetz.",
  attribution:
    "It is a fork of David Siegel's dvdsgl/claude-canvas, substantially extended and MIT licensed with the original copyright retained. It is Santiago's personal open-source project, not a SkyQuetz product.",
} as const;

/**
 * @id local del nodo de SkyQuetz dentro de ESTE grafo. Es una URL de sgomez.dev
 * a propósito: el nodo es la versión que este sitio afirma de esa empresa, y se
 * ata a la versión canónica (skyquetz.com/#org) con `sameAs`. Reutilizar el @id
 * ajeno aquí sería afirmar que este documento es la fuente de ese nodo, que no
 * lo es.
 *
 * El sufijo `-org` no es decorativo: `#skyquetz` es el ancla de la sección de
 * la página (`<section id="skyquetz">`), y el breadcrumb apunta ahí. Si el nodo
 * de la organización usara ese mismo IRI, el `item` del breadcrumb dejaría de
 * señalar un trozo de página y señalaría a la empresa, que es otra cosa.
 */
const SKYQUETZ_NODE = `${IDENTITY.url}/#skyquetz-org`;

type JsonLd = Record<string, unknown>;

export type GraphFaq = { q: string; a: string };
export type GraphPageType = "ProfilePage" | "WebPage" | "ContactPage" | "AboutPage";

/** La página a la que pertenece el grafo. `path` es la ruta LÓGICA, sin prefijo de idioma. */
export type GraphPage = {
  path: string;
  title: string;
  description?: string;
  type: GraphPageType;
  faq?: GraphFaq[];
  /** Fecha real del contenido de esta página (AAAA-MM-DD), cuando no sale de `CONTENT_UPDATED` (los casos de estudio). */
  dateModified?: string;
  /** Migas entre la home y la página (Inicio, Proyectos, esta página). */
  trail?: { name: string; item: string }[];
  /** `@id` del nodo que esta página describe (`mainEntity`), si no es la persona. */
  mainEntityId?: string;
  /** Nodos propios de la página (el caso de estudio), añadidos al final del grafo. */
  extraNodes?: JsonLd[];
};

const PERSON = `${IDENTITY.url}/#person`;
const WEBSITE = `${IDENTITY.url}/#website`;

/** La página por defecto: la home, que es el ProfilePage de la persona. */
const HOME_PAGE: GraphPage = {
  path: "/",
  title: `${IDENTITY.name} · Full-Stack Engineer (AI/LLM)`,
  type: "ProfilePage",
};

/**
 * FAQ de la home: Q&A declarativa que los LLM y los buscadores citan
 * literalmente. Las respuestas son factuales y se sostienen solas, fuera de
 * contexto. La versión española es la de siempre, palabra por palabra; la
 * inglesa dice lo mismo y no añade ninguna afirmación.
 */
export const HOME_FAQ: Record<Lang, GraphFaq[]> = {
  es: [
    {
      q: "¿Quién es Santiago Gómez de la Torre Romero?",
      a: "Santiago Gómez de la Torre Romero es un full-stack engineer afincado en Cantabria, España. Lleva la IA a producción, no a demos. Cofundó SkyQuetz Consulting, una consultora de software a medida, y es el creador de NudaUI y de una búsqueda semántica (RAG) en vivo sobre su catálogo. Trabaja como developer en Evenbytes y organiza el GDG Santander.",
    },
    {
      q: "¿Qué hace Santiago Gómez de la Torre con IA y LLMs?",
      a: "Construye sistemas de IA medibles en producción. Diseña pipelines de RAG con embeddings y retrieval, evalúa con golden sets propios e integra LLMs en producto real. Levantó la búsqueda semántica de NudaUI y subió la precisión del primer resultado del 67% al 80% (hit@1). También mantiene en producción un asistente conversacional B2B sobre la API de Claude.",
    },
    {
      q: "¿Qué es SkyQuetz Consulting y qué papel tiene Santiago Gómez de la Torre en ella?",
      a: "SkyQuetz Consulting es una consultora de software a medida que Santiago Gómez de la Torre cofundó en 2026 con tres socios más, cuatro fundadores en total. Trabaja 100% en remoto para clientes de habla hispana y cada proyecto lo lidera en persona el ingeniero que lo construye. Santiago lleva la ingeniería, que incluye arquitectura, código y los productos propios de la casa, entre ellos Synentria, un motor de auditoría SEO y GEO, y Packatrack, un SaaS de conciliación de liquidaciones para operadores de última milla. Es cofundador, no fundador único.",
    },
    {
      q: "¿Qué es NudaUI?",
      a: "NudaUI es una librería open-source creada y mantenida por Santiago Gómez de la Torre. Reúne más de 1.500 componentes y animaciones UI copy-paste, framework-agnósticos, organizados en 81 categorías. No tiene dependencias ni paso de build y funciona en React, Vue, Svelte, Astro, Laravel, Django o un simple archivo HTML.",
    },
    {
      q: "¿Qué es NudaUI Semantic Search (RAG)?",
      a: "Es una búsqueda en lenguaje natural sobre más de 1.000 componentes de NudaUI. Es un pipeline de RAG completo construido sin frameworks de RAG. Incluye embeddings con Voyage, retrieval por coseno, evaluación con un golden set propio, un servicio en FastAPI y una UI en vivo.",
    },
    {
      q: "¿Qué es Claude Canvas?",
      a: "Claude Canvas es un plugin open source de Claude Code, creado y mantenido por Santiago Gómez de la Torre, que le da a Claude una pantalla propia. Abre un panel interactivo de terminal junto a la conversación y la respuesta de la persona vuelve al modelo como un valor exacto (qué fichero, qué hunks de un diff, qué campos de un formulario) en vez de prosa que tenga que interpretar. Trae nueve tipos de panel (picker, form, table, image, diff, dashboard, calendar, document y flight), un transporte propio por socket local, más de 600 tests y CI en Linux, macOS y Windows. Es MIT y es un fork del proof of concept de David Siegel (dvdsgl/claude-canvas), ampliado a fondo y conservando su copyright. Es un proyecto personal de Santiago, no un producto de SkyQuetz Consulting.",
    },
    {
      q: "¿Con qué tecnologías trabaja Santiago Gómez de la Torre?",
      a: "Trabaja con React, Next.js, Node.js, TypeScript, Python y FastAPI, además de Google Cloud. En IA usa RAG, embeddings, evals y prompt engineering.",
    },
    {
      q: "¿Dónde está y está disponible para trabajar?",
      a: "Santiago está en Cantabria, España, y trabaja en remoto. Está disponible para colaboraciones y proyectos freelance de IA/LLM y full-stack. Se le puede contactar por email en contact@sgomez.dev o por LinkedIn.",
    },
  ],
  en: [
    {
      q: "Who is Santiago Gómez de la Torre Romero?",
      a: "Santiago Gómez de la Torre Romero is a full-stack engineer based in Cantabria, Spain. He takes AI to production, not to demos. He co-founded SkyQuetz Consulting, a custom software consultancy, and is the creator of NudaUI and of a live semantic search (RAG) over its catalog. He works as a developer at Evenbytes and organizes GDG Santander.",
    },
    {
      q: "What does Santiago Gómez de la Torre do with AI and LLMs?",
      a: "He builds measurable AI systems in production. He designs RAG pipelines with embeddings and retrieval, evaluates with his own golden sets and integrates LLMs into real products. He built NudaUI's semantic search and raised first-result precision from 67% to 80% (hit@1). He also runs a B2B conversational assistant in production on the Claude API.",
    },
    {
      q: "What is SkyQuetz Consulting and what is Santiago Gómez de la Torre's role in it?",
      a: "SkyQuetz Consulting is a custom software consultancy that Santiago Gómez de la Torre co-founded in 2026 with three more partners, four founders in total. It works 100% remotely for Spanish-speaking clients and every project is led in person by the engineer who builds it. Santiago leads engineering, which covers architecture, code and the company's own products, among them Synentria, an SEO and GEO audit engine, and Packatrack, a settlement reconciliation SaaS for last-mile operators. He is a co-founder, not the sole founder.",
    },
    {
      q: "What is NudaUI?",
      a: "NudaUI is an open-source library created and maintained by Santiago Gómez de la Torre. It gathers more than 1,500 copy-paste, framework-agnostic UI components and animations, organized in 81 categories. It has no dependencies and no build step and works in React, Vue, Svelte, Astro, Laravel, Django or a plain HTML file.",
    },
    {
      q: "What is NudaUI Semantic Search (RAG)?",
      a: "It is a natural-language search over more than 1,000 NudaUI components. It is a complete RAG pipeline built without RAG frameworks. It includes Voyage embeddings, cosine retrieval, evaluation with a custom golden set, a FastAPI service and a live UI.",
    },
    {
      q: "What is Claude Canvas?",
      a: "Claude Canvas is an open-source Claude Code plugin, created and maintained by Santiago Gómez de la Torre, that gives Claude a display of its own. It opens an interactive terminal pane beside the conversation and the person's answer comes back to the model as an exact value (which file, which hunks of a diff, which form fields) instead of prose it has to interpret. It has nine canvas kinds (picker, form, table, image, diff, dashboard, calendar, document and flight), a transport of its own over a local socket, more than 600 tests and CI on Linux, macOS and Windows. It is MIT licensed and a fork of David Siegel's proof of concept (dvdsgl/claude-canvas), substantially extended, keeping his copyright. It is a personal project of Santiago's, not a SkyQuetz Consulting product.",
    },
    {
      q: "Which technologies does Santiago Gómez de la Torre work with?",
      a: "He works with React, Next.js, Node.js, TypeScript, Python and FastAPI, plus Google Cloud. In AI he uses RAG, embeddings, evals and prompt engineering.",
    },
    {
      q: "Where is he based and is he available for work?",
      a: "Santiago is based in Cantabria, Spain, and works remotely. He is available for collaborations and freelance AI/LLM and full-stack projects. He can be reached by email at contact@sgomez.dev or on LinkedIn.",
    },
  ],
};

/**
 * Las entidades (persona, empresa, proyectos) más la página que se está
 * describiendo. `pageGraph` de `lib/seo/jsonld.ts` es la puerta de entrada de
 * las páginas; sin argumentos esto es el grafo de la home española, que es lo
 * que siempre fue.
 */
export function personGraph(lang: Lang = "es", page: GraphPage = HOME_PAGE): JsonLd {
  const x = <T,>(es: T, en: T): T => (lang === "es" ? es : en);
  const isHome = page.path === "/";

  // El español de la home es exactamente IDENTITY.url, sin barra; la barra solo
  // existe en el @id (IDENTITY.url + "/"), por compatibilidad con los grafos de
  // siempre. El resto de URLs van sin barra final.
  const publicPath = localizedPath(lang, page.path);
  const pageUrl = publicPath === "/" ? IDENTITY.url : `${IDENTITY.url}${publicPath}`;
  const pageBase = publicPath === "/" ? `${IDENTITY.url}/` : pageUrl;
  const pageId = `${pageBase}#${page.type.toLowerCase()}`;
  const homeUrl = lang === "es" ? IDENTITY.url : `${IDENTITY.url}/en`;
  const homeBase = lang === "es" ? `${IDENTITY.url}/` : `${IDENTITY.url}/en`;
  const inLanguage = x("es-ES", "en");
  const faq = page.faq ?? (isHome ? HOME_FAQ[lang] : undefined);
  const logical = page.path as LogicalPath;

  const nodes: JsonLd[] = [
    {
      "@type": "WebSite",
      "@id": WEBSITE,
      url: IDENTITY.url,
      name: IDENTITY.name,
      // Un solo WebSite para los dos idiomas: la entidad es el sitio, no cada versión.
      inLanguage: ["es-ES", "en"],
      publisher: { "@id": PERSON },
      about: { "@id": PERSON },
    },
    {
      "@type": page.type,
      "@id": pageId,
      url: pageUrl,
      name: page.title,
      ...(page.description ? { description: page.description } : {}),
      isPartOf: { "@id": WEBSITE },
      ...(page.type === "ProfilePage" ? { mainEntity: { "@id": PERSON } } : {}),
      ...(page.mainEntityId ? { mainEntity: { "@id": page.mainEntityId } } : {}),
      ...(page.type === "AboutPage" || page.type === "ContactPage" ? { about: { "@id": PERSON } } : {}),
      ...(page.type === "ProfilePage" ? { primaryImageOfPage: IDENTITY.image } : {}),
      breadcrumb: { "@id": `${pageBase}#breadcrumb` },
      inLanguage,
      dateModified: page.dateModified ?? CONTENT_UPDATED[logical] ?? latestContentUpdate(),
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", "[data-answer]"],
      },
    },
    {
      "@type": "Person",
      "@id": PERSON,
      name: IDENTITY.name,
      givenName: IDENTITY.givenName,
      familyName: IDENTITY.familyName,
      url: IDENTITY.url,
      image: IDENTITY.image,
      email: IDENTITY.email,
      jobTitle: [
        IDENTITY.jobTitle,
        IDENTITY_TEXT.coFounderTitle[lang],
        IDENTITY_TEXT.coFounderForgiaTitle[lang],
      ],
      description: IDENTITY_TEXT.description[lang],
      sameAs: [...IDENTITY.sameAs],
      knowsAbout: [...IDENTITY.knowsAbout],
      knowsLanguage: ["es", "en"],
      address: {
        "@type": "PostalAddress",
        addressLocality: IDENTITY.location.city,
        addressRegion: IDENTITY.location.region,
        addressCountry: IDENTITY.location.country,
      },
      // Dos organizaciones, las dos reales: el empleo y la empresa cofundada.
      // La segunda va por referencia al nodo #skyquetz de más abajo (no
      // repetida en línea) para que la organización exista UNA vez en el grafo
      // y todo lo que la señale apunte al mismo sitio.
      worksFor: [
        {
          "@type": "Organization",
          name: "Evenbytes",
          url: "https://evenbytes.com",
          // La localidad no es un dato nuevo: la sección de experiencia ya la
          // publica en texto. Aquí solo se declara en el formato que una
          // máquina puede leer.
          address: {
            "@type": "PostalAddress",
            addressLocality: "Santa Cruz de Bezana",
            addressRegion: "Cantabria",
            addressCountry: "ES",
          },
        },
        { "@id": SKYQUETZ_NODE },
        { "@id": FORGIA_NODE },
      ],
      affiliation: { "@id": SKYQUETZ_NODE },
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "Universidad Europea del Atlántico",
        url: "https://www.uneatlantico.es",
      },
      memberOf: [
        {
          "@type": "Organization",
          name: "Google Developer Group (GDG) Santander",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Santander",
            addressRegion: "Cantabria",
            addressCountry: "ES",
          },
        },
        { "@id": SKYQUETZ_NODE },
        { "@id": FORGIA_NODE },
      ],
      hasOccupation: {
        "@type": "Occupation",
        name: "Full-Stack Engineer (AI/LLM)",
        // O*NET-SOC code for Software Developers.
        occupationalCategory: "15-1252.00",
        skills:
          "RAG, LLMs, embeddings, evals, prompt engineering, Node.js, React, Next.js, TypeScript, Python, FastAPI, Google Cloud",
      },
      homeLocation: {
        "@type": "Place",
        name: x("Cantabria, España", "Cantabria, Spain"),
      },
      workLocation: {
        "@type": "Place",
        name: x("Remote / Cantabria, España", "Remote / Cantabria, Spain"),
      },
      seeks: {
        "@type": "Demand",
        name: "Freelance and collaboration on AI/LLM and full-stack projects",
      },
      // Solo la página que ES el perfil declara que es la entidad principal:
      // apuntar desde /about o /contact a un nodo que ese grafo no contiene
      // sería una referencia colgando.
      ...(page.type === "ProfilePage" ? { mainEntityOfPage: { "@id": pageId } } : {}),
      // The projects he authored — linking the Person to the project entities
      // (and their canonical domains) reinforces the whole cluster.
      subjectOf: [
        { "@id": `${IDENTITY.url}/#nudaui` },
        { "@id": `${IDENTITY.url}/#nudaui-rag` },
        { "@id": `${IDENTITY.url}/#claude-canvas` },
        { "@id": `${IDENTITY.url}/#sgomez-cli` },
        { "@id": SKYQUETZ_NODE },
        { "@id": FORGIA_NODE },
        { "@id": `${IDENTITY.url}/#synentria` },
        { "@id": `${IDENTITY.url}/#packatrack` },
      ],
    },
    {
      // La empresa cofundada, como entidad propia y separada de la persona.
      // `sameAs` apunta al @id que skyquetz.com usa para sí misma: eso empareja
      // esta ORGANIZACIÓN con esa, y nada más. `founder` la devuelve a la
      // persona, cerrando el círculo que skyquetz.com ya abría desde su lado.
      "@type": ["Organization", "ProfessionalService"],
      "@id": SKYQUETZ_NODE,
      name: SKYQUETZ.name,
      alternateName: "SkyQuetz",
      url: SKYQUETZ.url,
      sameAs: [SKYQUETZ.orgId],
      description: x(SKYQUETZ.description, SKYQUETZ.descriptionEn),
      // El eslogan es la frase de marca y solo existe en español: se conserva
      // tal cual en los dos idiomas en vez de inventar una traducción.
      slogan: SKYQUETZ.slogan,
      foundingDate: SKYQUETZ.foundingDate,
      // Cofundador, no fundador único: son cuatro socios. Declarar solo a uno
      // como `founder` sería más vistoso y falso, y skyquetz.com declara a los
      // cuatro, así que las dos webs se contradirían.
      founder: { "@id": PERSON },
      member: { "@id": PERSON },
      employee: { "@id": PERSON },
      numberOfEmployees: { "@type": "QuantitativeValue", value: 4 },
      areaServed: [
        { "@type": "Country", name: x("España", "Spain") },
        { "@type": "AdministrativeArea", name: x("Latinoamérica", "Latin America") },
      ],
      knowsLanguage: ["es", "en"],
      // contactPoint + address: las dos propiedades con las que un agente
      // comprueba que detrás del nombre hay una empresa a la que se puede
      // escribir y un sitio donde opera. Sin ellas el nodo describe una marca,
      // no un negocio.
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: SKYQUETZ.contactType,
          email: SKYQUETZ.contactEmail,
          url: SKYQUETZ.contactUrl,
          availableLanguage: ["Spanish", "English"],
          areaServed: ["ES", "419"],
        },
      ],
      email: SKYQUETZ.contactEmail,
      address: {
        "@type": "PostalAddress",
        addressCountry: SKYQUETZ.address.country,
      },
      owns: [
        { "@id": `${IDENTITY.url}/#synentria` },
        { "@id": `${IDENTITY.url}/#packatrack` },
      ],
    },
    {
      // Forgia: otra empresa cofundada, entidad propia. Son dos socios
      // fundadores; Santiago es uno de ellos, no el fundador único.
      "@type": "Organization",
      "@id": FORGIA_NODE,
      name: FORGIA.name,
      url: FORGIA.url,
      description: x(FORGIA.description, FORGIA.descriptionEn),
      founder: { "@id": PERSON },
      member: { "@id": PERSON },
      employee: { "@id": PERSON },
      address: {
        "@type": "PostalAddress",
        addressLocality: FORGIA.address.city,
        addressRegion: FORGIA.address.region,
        addressCountry: FORGIA.address.country,
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: FORGIA.contactType,
          url: FORGIA.contactUrl,
        },
      ],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${IDENTITY.url}/#synentria`,
      name: SKYQUETZ.synentria.name,
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "SEO and GEO website analysis",
      operatingSystem: "Any",
      url: SKYQUETZ.synentria.url,
      description: x(SKYQUETZ.synentria.description, SKYQUETZ.synentria.descriptionEn),
      inLanguage: "es-ES",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
      // creator = él; provider = la empresa. skyquetz.com declara exactamente
      // lo mismo desde su lado (creator apunta a su nodo #founder, que es esta
      // misma persona), así que las dos webs coinciden en quién lo construyó.
      creator: { "@id": PERSON },
      author: { "@id": PERSON },
      provider: { "@id": SKYQUETZ_NODE },
      publisher: { "@id": SKYQUETZ_NODE },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${IDENTITY.url}/#packatrack`,
      name: SKYQUETZ.packatrack.name,
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Last-mile settlement reconciliation",
      operatingSystem: "Any",
      url: SKYQUETZ.packatrack.url,
      description: x(SKYQUETZ.packatrack.description, SKYQUETZ.packatrack.descriptionEn),
      inLanguage: "es-ES",
      creator: { "@id": PERSON },
      author: { "@id": PERSON },
      provider: { "@id": SKYQUETZ_NODE },
      publisher: { "@id": SKYQUETZ_NODE },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${IDENTITY.url}/#nudaui`,
      name: "NudaUI",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      url: "https://nudaui.dev",
      sameAs: ["https://github.com/sgomez-dev/nudaui"],
      description:
        "Open-source library of more than 1,500 copy-paste, framework-agnostic UI components and animations across 81 categories. Zero dependencies, zero build step.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      isAccessibleForFree: true,
      license: "https://opensource.org/licenses/MIT",
      author: { "@id": PERSON },
      creator: { "@id": PERSON },
    },
    {
      "@type": "SoftwareSourceCode",
      "@id": `${IDENTITY.url}/#nudaui-rag`,
      name: "NudaUI Semantic Search (RAG)",
      url: "https://blog.sgomez.dev/rag-busqueda-semantica-nudaui",
      codeRepository: "https://github.com/sgomez-dev/nudaui-rag",
      programmingLanguage: "Python",
      runtimePlatform: "FastAPI",
      description:
        "Natural-language semantic search over 1,000+ NudaUI components. Full RAG pipeline built without RAG frameworks: Voyage embeddings, cosine retrieval, evaluation with a custom golden set, a FastAPI service and a live UI. Improved first-result precision from 67% to 80% (hit@1).",
      about: { "@id": `${IDENTITY.url}/#nudaui` },
      author: { "@id": PERSON },
      creator: { "@id": PERSON },
    },
    {
      // Dos tipos a la vez, y los dos son ciertos: se instala y se usa como
      // aplicación, y lo que se publica es el código. Un solo tipo dejaría
      // fuera la mitad de las propiedades que un agente viene a comprobar
      // aquí (`codeRepository` y `runtimePlatform` no existen en
      // SoftwareApplication; `softwareRequirements` no existe en
      // SoftwareSourceCode).
      "@type": ["SoftwareApplication", "SoftwareSourceCode"],
      "@id": `${IDENTITY.url}/#claude-canvas`,
      name: CLAUDE_CANVAS.name,
      alternateName: "claude-canvas",
      applicationCategory: "DeveloperApplication",
      applicationSubCategory: "Claude Code plugin / terminal UI toolkit",
      url: CLAUDE_CANVAS.url,
      sameAs: [CLAUDE_CANVAS.repo],
      codeRepository: CLAUDE_CANVAS.repo,
      description: CLAUDE_CANVAS.descriptionEn,
      programmingLanguage: ["TypeScript", "TSX"],
      runtimePlatform: "Bun",
      // Esta es la pregunta que la gente falla, así que se declara en vez de
      // dejarla en la prosa: tener tmux instalado no basta, tiene que estar
      // corriendo (o ser Windows Terminal).
      softwareRequirements: "Bun; an active tmux 3.1+ session or Windows Terminal",
      operatingSystem: "Linux, macOS, Windows",
      license: CLAUDE_CANVAS.license,
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      // El fork, declarado en el grafo y no solo en el texto. `isBasedOn`
      // existe justo para esto, y omitirlo sería la única afirmación de este
      // documento que sus propias fuentes desmienten.
      isBasedOn: {
        "@type": "SoftwareSourceCode",
        name: "dvdsgl/claude-canvas",
        url: CLAUDE_CANVAS.basedOn,
        codeRepository: CLAUDE_CANVAS.basedOn,
        author: { "@type": "Person", name: CLAUDE_CANVAS.basedOnAuthor },
      },
      author: { "@id": PERSON },
      creator: { "@id": PERSON },
      maintainer: { "@id": PERSON },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${IDENTITY.url}/#sgomez-cli`,
      name: "sgomez-cli",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      url: "https://www.npmjs.com/package/sgomez-cli",
      description: x(
        "CLI publicada en npm para inicializar proyectos frontend y backend con múltiples frameworks.",
        "CLI published on npm to scaffold frontend and backend projects with multiple frameworks.",
      ),
      isAccessibleForFree: true,
      author: { "@id": PERSON },
      creator: { "@id": PERSON },
    },
    {
      "@type": "Blog",
      "@id": `${IDENTITY.url}/#blog`,
      name: "Blog · Santiago Gómez de la Torre",
      url: "https://blog.sgomez.dev",
      author: { "@id": PERSON },
      inLanguage: "es-ES",
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageBase}#breadcrumb`,
      itemListElement: isHome
        ? [
            { "@type": "ListItem", position: 1, name: x("Inicio", "Home"), item: homeUrl },
            { "@type": "ListItem", position: 2, name: x("Proyectos", "Projects"), item: `${homeBase}#work` },
            { "@type": "ListItem", position: 3, name: "Forgia", item: `${homeBase}#forgia` },
            { "@type": "ListItem", position: 4, name: "SkyQuetz", item: `${homeBase}#skyquetz` },
            { "@type": "ListItem", position: 5, name: "Open Source", item: `${homeBase}#open-source` },
            { "@type": "ListItem", position: 6, name: x("Contacto", "Contact"), item: `${homeBase}#contact` },
          ]
        : [
            { "@type": "ListItem", position: 1, name: x("Inicio", "Home"), item: homeUrl },
            ...(page.trail ?? []).map((step, index) => ({
              "@type": "ListItem",
              position: index + 2,
              name: step.name,
              item: step.item,
            })),
            {
              "@type": "ListItem",
              position: (page.trail?.length ?? 0) + 2,
              name: ROUTE_CATALOGUE[logical]?.title[lang] ?? page.title,
              item: pageUrl,
            },
          ],
    },
    ...(faq
      ? [
          {
            // FAQ = declarative Q&A that LLMs and search engines quote verbatim. Keep
            // answers factual and self-contained so they can be cited out of context.
            "@type": "FAQPage",
            "@id": `${pageBase}#faq`,
            inLanguage,
            isPartOf: { "@id": WEBSITE },
            about: { "@id": PERSON },
            mainEntity: faq.map((entry) => ({
              "@type": "Question",
              name: entry.q,
              acceptedAnswer: { "@type": "Answer", text: entry.a },
            })),
          },
        ]
      : []),
    ...(page.extraNodes ?? []),
  ];

  return { "@context": "https://schema.org", "@graph": nodes };
}
