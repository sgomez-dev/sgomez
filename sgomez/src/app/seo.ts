/**
 * Canonical identity + JSON-LD entity graph for sgomez.dev.
 *
 * This is the SEO/GEO hub: one @graph that ties the Person to every property he
 * owns (NudaUI, the CLI, the blog, GitHub, LinkedIn) via sameAs + creator/author
 * links, so search engines and LLMs resolve them as ONE entity and the authority
 * flows between them. Keep this in sync with the same identity used on
 * nudaui.dev, blog.sgomez.dev and the CLI landing so everything stays "in line".
 */

export const IDENTITY = {
  name: "Santiago Gómez de la Torre Romero",
  givenName: "Santiago",
  familyName: "Gómez de la Torre Romero",
  url: "https://sgomez.dev",
  jobTitle: "Full-Stack Engineer (AI/LLM)",
  // Segundo título real, no un adorno del primero: `jobTitle` acepta varios
  // valores y este es el que conecta a la persona con una organización que
  // existe y que ya lo declara cofundador desde su lado.
  coFounderTitle: "Cofundador de SkyQuetz Consulting",
  email: "contact@sgomez.dev",
  image: "https://sgomez.dev/Santiago_Gómez_de_la_Torre_Romero.png",
  description:
    "Santiago Gómez de la Torre Romero es un full-stack engineer que lleva la IA a producción. Cofundador de SkyQuetz Consulting, creador de NudaUI y de una búsqueda semántica (RAG) en vivo sobre su catálogo. Developer en Evenbytes y organizador de GDG Santander.",
  location: { city: "Santander", region: "Cantabria", country: "ES" },
  // sameAs cluster — every profile/property that is "also him". This is what
  // merges the domains into a single entity graph.
  sameAs: [
    "https://nudaui.dev",
    "https://blog.sgomez.dev",
    "https://github.com/sgomez-dev",
    "https://linkedin.com/in/sgomez-dev",
    "https://www.npmjs.com/package/sgomez-cli",
    "https://instagram.com/santigt1503",
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
  synentria: {
    name: "Synentria",
    url: "https://synentria.skyquetz.com",
    description:
      "Motor de auditoría SEO y GEO: analiza un sitio y devuelve hallazgos priorizados más parches aplicables. Ningún hallazgo lo decide un modelo de lenguaje; todos salen de comprobaciones deterministas.",
  },
  packatrack: {
    name: "Packatrack",
    url: "https://packatrack.skyquetz.com",
    description:
      "SaaS B2B de conciliación de liquidaciones para operadores de última milla: calcula lo que una operación debía facturar a partir de sus rutas, tarifas e incidencias, lo compara con la liquidación recibida del carrier y documenta cada diferencia con su dato de origen.",
  },
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

export function personGraph(): JsonLd {
  const PERSON = `${IDENTITY.url}/#person`;
  const WEBSITE = `${IDENTITY.url}/#website`;

  const nodes: JsonLd[] = [
    {
      "@type": "WebSite",
      "@id": WEBSITE,
      url: IDENTITY.url,
      name: IDENTITY.name,
      inLanguage: "es-ES",
      publisher: { "@id": PERSON },
      about: { "@id": PERSON },
    },
    {
      "@type": "ProfilePage",
      "@id": `${IDENTITY.url}/#profilepage`,
      url: IDENTITY.url,
      name: `${IDENTITY.name} — Full-Stack Engineer (AI/LLM)`,
      isPartOf: { "@id": WEBSITE },
      mainEntity: { "@id": PERSON },
      primaryImageOfPage: IDENTITY.image,
      inLanguage: "es-ES",
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", "#about"],
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
      jobTitle: [IDENTITY.jobTitle, IDENTITY.coFounderTitle],
      description: IDENTITY.description,
      sameAs: [...IDENTITY.sameAs],
      knowsAbout: [...IDENTITY.knowsAbout],
      knowsLanguage: ["Spanish", "English"],
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
        { "@type": "Organization", name: "Evenbytes", url: "https://evenbytes.com" },
        { "@id": SKYQUETZ_NODE },
      ],
      affiliation: { "@id": SKYQUETZ_NODE },
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "Universidad Europea del Atlántico",
        url: "https://www.uneatlantico.es",
      },
      memberOf: [
        { "@type": "Organization", name: "Google Developer Group (GDG) Santander" },
        { "@id": SKYQUETZ_NODE },
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
        name: "Cantabria, España",
      },
      workLocation: {
        "@type": "Place",
        name: "Remote / Cantabria, España",
      },
      seeks: {
        "@type": "Demand",
        name: "Freelance and collaboration on AI/LLM and full-stack projects",
      },
      mainEntityOfPage: { "@id": `${IDENTITY.url}/#profilepage` },
      // The projects he authored — linking the Person to the project entities
      // (and their canonical domains) reinforces the whole cluster.
      subjectOf: [
        { "@id": `${IDENTITY.url}/#nudaui` },
        { "@id": `${IDENTITY.url}/#nudaui-rag` },
        { "@id": `${IDENTITY.url}/#sgomez-cli` },
        { "@id": SKYQUETZ_NODE },
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
      description: SKYQUETZ.description,
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
        { "@type": "Country", name: "España" },
        { "@type": "AdministrativeArea", name: "Latinoamérica" },
      ],
      knowsLanguage: ["Spanish", "English"],
      owns: [
        { "@id": `${IDENTITY.url}/#synentria` },
        { "@id": `${IDENTITY.url}/#packatrack` },
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
      description: SKYQUETZ.synentria.description,
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
      description: SKYQUETZ.packatrack.description,
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
        "Open-source library of 1,000+ copy-paste, framework-agnostic UI components and animations across 81 categories. Zero dependencies, zero build step.",
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
      "@type": "SoftwareApplication",
      "@id": `${IDENTITY.url}/#sgomez-cli`,
      name: "sgomez-cli",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      url: "https://www.npmjs.com/package/sgomez-cli",
      description:
        "CLI publicada en npm para inicializar proyectos frontend y backend con múltiples frameworks.",
      isAccessibleForFree: true,
      author: { "@id": PERSON },
      creator: { "@id": PERSON },
    },
    {
      "@type": "Blog",
      "@id": `${IDENTITY.url}/#blog`,
      name: "Blog — Santiago Gómez",
      url: "https://blog.sgomez.dev",
      author: { "@id": PERSON },
      inLanguage: "es-ES",
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${IDENTITY.url}/#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: IDENTITY.url },
        { "@type": "ListItem", position: 2, name: "Proyectos", item: `${IDENTITY.url}/#projects` },
        { "@type": "ListItem", position: 3, name: "SkyQuetz", item: `${IDENTITY.url}/#skyquetz` },
        { "@type": "ListItem", position: 4, name: "Open Source", item: `${IDENTITY.url}/#open-source` },
        { "@type": "ListItem", position: 5, name: "Contacto", item: `${IDENTITY.url}/#contact` },
      ],
    },
    {
      // FAQ = declarative Q&A that LLMs and search engines quote verbatim. Keep
      // answers factual and self-contained so they can be cited out of context.
      "@type": "FAQPage",
      "@id": `${IDENTITY.url}/#faq`,
      inLanguage: "es-ES",
      isPartOf: { "@id": WEBSITE },
      about: { "@id": PERSON },
      mainEntity: [
        {
          "@type": "Question",
          name: "¿Quién es Santiago Gómez de la Torre Romero?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Santiago Gómez de la Torre Romero es un full-stack engineer afincado en Cantabria, España. Lleva la IA a producción, no a demos. Cofundó SkyQuetz Consulting, una consultora de software a medida, y es el creador de NudaUI y de una búsqueda semántica (RAG) en vivo sobre su catálogo. Trabaja como developer en Evenbytes y organiza el GDG Santander.",
          },
        },
        {
          "@type": "Question",
          name: "¿Qué hace Santiago Gómez con IA y LLMs?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Construye sistemas de IA medibles en producción. Diseña pipelines de RAG con embeddings y retrieval, evalúa con golden sets propios e integra LLMs en producto real. Levantó la búsqueda semántica de NudaUI y subió la precisión del primer resultado del 67% al 80% (hit@1). También mantiene en producción un asistente conversacional B2B sobre la API de Claude.",
          },
        },
        {
          "@type": "Question",
          name: "¿Qué es SkyQuetz Consulting y qué papel tiene Santiago Gómez en ella?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "SkyQuetz Consulting es una consultora de software a medida que Santiago Gómez cofundó en 2026 con tres socios más, cuatro fundadores en total. Trabaja 100% en remoto para clientes de habla hispana y cada proyecto lo lidera en persona el ingeniero que lo construye. Santiago lleva la ingeniería: arquitectura, código y los productos propios de la casa, entre ellos Synentria, un motor de auditoría SEO y GEO, y Packatrack, un SaaS de conciliación de liquidaciones para operadores de última milla. Es cofundador, no fundador único.",
          },
        },
        {
          "@type": "Question",
          name: "¿Qué es NudaUI?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "NudaUI es una librería open-source creada y mantenida por Santiago Gómez. Reúne más de 1.000 componentes y animaciones UI copy-paste, framework-agnósticos, organizados en 81 categorías. No tiene dependencias ni paso de build y funciona en React, Vue, Svelte, Astro, Laravel, Django o un simple archivo HTML.",
          },
        },
        {
          "@type": "Question",
          name: "¿Qué es NudaUI Semantic Search (RAG)?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Es una búsqueda en lenguaje natural sobre más de 1.000 componentes de NudaUI. Es un pipeline de RAG completo construido sin frameworks de RAG: embeddings con Voyage, retrieval por coseno, evaluación con un golden set propio, un servicio en FastAPI y una UI en vivo.",
          },
        },
        {
          "@type": "Question",
          name: "¿Con qué tecnologías trabaja Santiago Gómez?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Trabaja con React, Next.js, Node.js, TypeScript, Python y FastAPI, además de Google Cloud. En IA usa RAG, embeddings, evals y prompt engineering.",
          },
        },
        {
          "@type": "Question",
          name: "¿Dónde está y está disponible para trabajar?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Santiago está en Cantabria, España, y trabaja en remoto. Está disponible para colaboraciones y proyectos freelance de IA/LLM y full-stack. Se le puede contactar por email en contact@sgomez.dev o por LinkedIn.",
          },
        },
      ],
    },
  ];

  return { "@context": "https://schema.org", "@graph": nodes };
}
