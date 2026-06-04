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
  jobTitle: "Software Engineer",
  email: "contact@sgomez.dev",
  image: "https://sgomez.dev/Santiago_Gómez_de_la_Torre_Romero.png",
  description:
    "Santiago Gómez de la Torre Romero — Software Engineer especializado en frontend moderno, cloud y producto. Creador de NudaUI. Developer en Evenbytes y organizador de GDG Santander.",
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
    "Software engineering",
    "Frontend development",
    "React",
    "Angular",
    "Next.js",
    "TypeScript",
    "Node.js",
    "Google Cloud",
    "CSS animations",
    "UI/UX",
    "Open source",
  ],
} as const;

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
      name: `${IDENTITY.name} — Software Engineer`,
      isPartOf: { "@id": WEBSITE },
      mainEntity: { "@id": PERSON },
      inLanguage: "es-ES",
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
      jobTitle: IDENTITY.jobTitle,
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
      worksFor: {
        "@type": "Organization",
        name: "Evenbytes",
        url: "https://evenbytes.com",
      },
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "Universidad Europea del Atlántico",
        url: "https://www.uneatlantico.es",
      },
      memberOf: {
        "@type": "Organization",
        name: "Google Developer Group (GDG) Santander",
      },
      // The projects he authored — linking the Person to the project entities
      // (and their canonical domains) reinforces the whole cluster.
      subjectOf: [
        { "@id": `${IDENTITY.url}/#nudaui` },
        { "@id": `${IDENTITY.url}/#sgomez-cli` },
      ],
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
        "Open-source library of 800+ copy-paste, framework-agnostic UI animations and components. Zero dependencies, zero build step.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      isAccessibleForFree: true,
      license: "https://opensource.org/licenses/MIT",
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
  ];

  return { "@context": "https://schema.org", "@graph": nodes };
}
