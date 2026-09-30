import { CLAUDE_CANVAS, IDENTITY, SKYQUETZ } from "@/app/seo";
import { about } from "@/app/content";
import { LANGS, localizedPath, type Lang } from "@/i18n/languages";
import { t } from "./localized";
import { API_BASE, SITE_URL } from "@/lib/site";

/**
 * Contenido de las páginas estáticas, como datos y no como JSX.
 *
 * Cada una de estas páginas se publica DOS veces: en HTML para una persona y
 * en markdown para un agente que negocia `Accept: text/markdown`. Si el texto
 * viviera dentro del componente de React, la variante markdown tendría que
 * repetirlo, y a la tercera edición una de las dos estaría desactualizada.
 * Viviendo aquí, las dos representaciones se generan del mismo objeto y no
 * pueden decir cosas distintas.
 *
 * Y cada página existe en cada idioma del sitio: un constructor por página que
 * recibe el idioma, con el español y el inglés juntos para que una edición de
 * uno no se quede sin su gemela.
 */

export type Block =
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "table"; head: string[]; rows: string[][] }
  | { kind: "code"; language: string; code: string }
  | { kind: "links"; items: { label: string; href: string; note?: string }[] };

export type Section = { id: string; heading: string; blocks: Block[] };

export type StaticPage = {
  slug: string;
  lang: Lang;
  /** Ruta localizada: `/about` en español, `/en/about` en inglés. */
  path: string;
  /** Título del <h1> y del encabezado markdown. */
  title: string;
  /** Título del <title> y de OpenGraph: lleva la marca para las búsquedas por nombre. */
  metaTitle: string;
  description: string;
  lead: string;
  sections: Section[];
};

const EMAIL = IDENTITY.email;

function buildAbout(lang: Lang): StaticPage {
  const x = (es: string, en: string) => (lang === "es" ? es : en);
  return {
    slug: "about",
    lang,
    path: localizedPath(lang, "/about"),
    title: x("Sobre Santiago Gómez de la Torre Romero", "About Santiago Gómez de la Torre Romero"),
    metaTitle: x(
      "Sobre mí — Santiago Gómez de la Torre Romero | sgomez.dev",
      "About — Santiago Gómez de la Torre Romero | sgomez.dev",
    ),
    description: x(
      "Quién es Santiago Gómez de la Torre Romero: full-stack engineer en Evenbytes, cofundador de SkyQuetz Consulting, creador de NudaUI y organizador de GDG Santander. Trayectoria, formación y en qué trabaja hoy.",
      "Who Santiago Gómez de la Torre Romero is: full-stack engineer at Evenbytes, co-founder of SkyQuetz Consulting, creator of NudaUI and organizer of GDG Santander. Career, education and what he works on today.",
    ),
    lead: x(
      "Full-stack engineer en Cantabria, España. Llevo la IA a producción, no a demos. Cofundador de SkyQuetz Consulting y creador de NudaUI.",
      "Full-stack engineer in Cantabria, Spain. I take AI to production, not to demos. Co-founder of SkyQuetz Consulting and creator of NudaUI.",
    ),
    sections: [
      {
        id: "quien-soy",
        heading: x("Quién soy", "Who I am"),
        blocks: [
          {
            kind: "paragraph",
            text: x(
              "Me llamo Santiago Gómez de la Torre Romero — «Gómez de la Torre» es un apellido compuesto, no dos apellidos sueltos — y soy full-stack engineer. Vivo en Cantabria, España, y trabajo en remoto. Hoy desarrollo software en Evenbytes con Angular, Node.js y Google Cloud, y en 2026 cofundé SkyQuetz Consulting con tres socios más, donde llevo la parte de ingeniería.",
              "My name is Santiago Gómez de la Torre Romero — “Gómez de la Torre” is a compound surname, not separate surnames — and I'm a full-stack engineer. I live in Cantabria, Spain, and work remotely. Today I build software at Evenbytes with Angular, Node.js and Google Cloud, and in 2026 I co-founded SkyQuetz Consulting with three more partners, where I handle the engineering.",
            ),
          },
          {
            kind: "paragraph",
            text: x(
              "Hay personas que llegan a la tecnología por casualidad. Yo no. A mí siempre me atrapó entender cómo funciona todo por dentro: cómo se despliega un servicio, por qué un sistema falla, qué hace que una interfaz fluya o se rompa. Con el tiempo, esa curiosidad dejó de ser un impulso y se convirtió en mi forma de trabajar: entender para construir, y construir para mejorar.",
              "Some people come to technology by chance. I didn't. I have always been hooked on understanding how everything works on the inside: how a service gets deployed, why a system fails, what makes an interface flow or break. Over time, that curiosity stopped being an impulse and became my way of working: understand in order to build, and build in order to improve.",
            ),
          },
          {
            kind: "paragraph",
            text: x(
              "Mi trayectoria combina administración de sistemas, desarrollo web y arquitectura en la nube. Empecé en FUNIBER en el equipo de redacción técnica, pasé a sysadmin y QA, seguí como técnico de soporte IT en la Universidad Europea del Atlántico —donde además estudio Ingeniería Informática— y desde junio de 2025 soy desarrollador en Evenbytes. Esa mezcla de operar sistemas antes de escribirlos es la razón de que me interesen tanto el despliegue y la observabilidad como el código.",
              "My career combines systems administration, web development and cloud architecture. I started at FUNIBER on the technical writing team, moved on to sysadmin and QA, continued as an IT support technician at Universidad Europea del Atlántico —where I am also studying Computer Engineering— and since June 2025 I have been a developer at Evenbytes. That mix of running systems before writing them is why I care as much about deployment and observability as about code.",
            ),
          },
        ],
      },
      {
        id: "en-que-trabajo",
        heading: x("En qué trabajo ahora", "What I work on now"),
        blocks: [
          {
            kind: "paragraph",
            text: x(
              "Construyo IA que llega a producto, no a demos. Diseño sistemas que se pueden medir: pipelines de RAG con embeddings y retrieval por coseno, evaluación con golden sets propios y modelos de lenguaje integrados en el producto real. La búsqueda semántica de NudaUI responde en lenguaje natural sobre más de 1.000 componentes, y con evals propias subí la precisión del primer resultado del 67% al 80% (hit@1), reportando también la categoría que empeoró. También mantengo en producción un asistente conversacional B2B construido sobre la API de Claude. Todo esto sin frameworks mágicos, entendiendo cada pieza del pipeline.",
              "I build AI that reaches the product, not just demos. I design systems that can be measured: RAG pipelines with embeddings and cosine retrieval, evaluation with my own golden sets, and language models integrated into the real product. NudaUI's semantic search answers in natural language over more than 1,000 components, and with my own evals I raised first-result accuracy from 67% to 80% (hit@1), also reporting the category that got worse. I also run a B2B conversational assistant built on the Claude API in production. All of this without magic frameworks, understanding every piece of the pipeline.",
            ),
          },
          {
            kind: "paragraph",
            text: x(
              `En 2026 cofundé ${SKYQUETZ.name} con tres socios más: una consultora de software a medida para negocios de habla hispana, en remoto y sin intermediarios. Soy cofundador, uno de cuatro socios, no fundador único. Llevo la ingeniería, y de ahí han salido dos productos propios: Synentria, un motor de auditoría SEO y GEO cuyos hallazgos son deterministas y no los decide ningún modelo, y Packatrack, un SaaS de conciliación de liquidaciones para operadores de última milla.`,
              `In 2026 I co-founded ${SKYQUETZ.name} with three more partners: a custom software consultancy for Spanish-speaking businesses, fully remote and with no intermediaries. I am a co-founder, one of four partners, not the sole founder. I handle the engineering, and two in-house products have come out of it: Synentria, an SEO and GEO audit engine whose findings are deterministic and not decided by any model, and Packatrack, a settlement reconciliation SaaS for last-mile operators.`,
            ),
          },
          {
            kind: "paragraph",
            text: x(
              "Y cuando no construyo para clientes, construyo para la comunidad: soy el creador y único mantenedor de NudaUI, una librería open-source con más de 1.000 componentes UI copy-paste en 81 categorías que funcionan en cualquier framework, y de sgomez-cli, una herramienta publicada en npm para arrancar proyectos full-stack en un solo comando. Además organizo eventos con GDG Santander y he competido en Hack2Progress.",
              "And when I'm not building for clients, I build for the community: I am the creator and sole maintainer of NudaUI, an open-source library with more than 1,000 copy-paste UI components in 81 categories that work in any framework, and of sgomez-cli, a tool published on npm to start full-stack projects with a single command. I also organize events with GDG Santander and have competed in Hack2Progress.",
            ),
          },
          {
            kind: "paragraph",
            text: x(
              `El tercero es ${CLAUDE_CANVAS.name} (${CLAUDE_CANVAS.url}), un plugin de Claude Code que le da al modelo una pantalla propia: abre un panel interactivo de terminal junto a la conversación —eliges un fichero, apruebas hunk a hunk un diff, rellenas un formulario— y tu respuesta le vuelve como un valor exacto en vez de prosa que tenga que interpretar. Son nueve tipos de panel, un transporte propio por socket local, más de 600 tests y CI en Linux, macOS y Windows. Partí del proof of concept de ${CLAUDE_CANVAS.basedOnAuthor} (${CLAUDE_CANVAS.basedOn}), que lo publicó como prueba de concepto sin soporte, y lo llevé a algo que aguanta el uso diario. Lo digo siempre que lo cuento: la idea es suya, la licencia es MIT y conserva su copyright. Es un proyecto mío, no un producto de ${SKYQUETZ.name}.`,
              `The third is ${CLAUDE_CANVAS.name} (${CLAUDE_CANVAS.url}), a Claude Code plugin that gives the model a screen of its own: it opens an interactive terminal pane beside the conversation —you pick a file, approve a diff hunk by hunk, fill in a form— and your answer comes back to it as an exact value instead of prose it has to interpret. There are nine pane kinds, a transport of its own over a local socket, more than 600 tests and CI on Linux, macOS and Windows. I started from ${CLAUDE_CANVAS.basedOnAuthor}'s proof of concept (${CLAUDE_CANVAS.basedOn}), which he published as an unsupported proof of concept, and took it to something that holds up under daily use. I say this every time I tell the story: the idea is his, the license is MIT and it keeps his copyright. It is a project of mine, not a ${SKYQUETZ.name} product.`,
            ),
          },
        ],
      },
      {
        id: "trayectoria",
        heading: x("Trayectoria", "Career"),
        blocks: [
          {
            kind: "list",
            items: about.timeline.map((item) => `**${item.year}** — ${t(item.title, lang)}: ${t(item.desc, lang)}`),
          },
        ],
      },
      {
        id: "datos",
        heading: x("Datos verificables", "Verifiable facts"),
        blocks: [
          {
            kind: "list",
            items: [
              x("Nombre completo: Santiago Gómez de la Torre Romero.", "Full name: Santiago Gómez de la Torre Romero."),
              x("Rol: Full-Stack Engineer (AI/LLM) en Evenbytes.", "Role: Full-Stack Engineer (AI/LLM) at Evenbytes."),
              x(
                `Cofundador de ${SKYQUETZ.name} (${SKYQUETZ.url}), fundada en ${SKYQUETZ.foundingDate} por cuatro socios.`,
                `Co-founder of ${SKYQUETZ.name} (${SKYQUETZ.url}), founded in ${SKYQUETZ.foundingDate} by four partners.`,
              ),
              x(
                "Formación: Grado en Ingeniería Informática, Universidad Europea del Atlántico (desde 2021).",
                "Education: Bachelor's degree in Computer Engineering, Universidad Europea del Atlántico (since 2021).",
              ),
              x(
                "Comunidad: organizador de Google Developer Group (GDG) Santander.",
                "Community: organizer of Google Developer Group (GDG) Santander.",
              ),
              x(
                "Ubicación: Santander, Cantabria, España. Trabajo en remoto.",
                "Location: Santander, Cantabria, Spain. I work remotely.",
              ),
              x("Idiomas: español (nativo) e inglés.", "Languages: Spanish (native) and English."),
              x(`Contacto: ${EMAIL}.`, `Contact: ${EMAIL}.`),
            ],
          },
          {
            kind: "paragraph",
            text: x(
              `Los mismos datos, en formato legible por máquina, están en ${SITE_URL}/llms.txt y en el endpoint ${SITE_URL}${API_BASE}/profile de la API pública.`,
              `The same facts, in machine-readable form, are at ${SITE_URL}/llms.txt and at the ${SITE_URL}${API_BASE}/profile endpoint of the public API.`,
            ),
          },
        ],
      },
    ],
  };
}

function buildContact(lang: Lang): StaticPage {
  const x = (es: string, en: string) => (lang === "es" ? es : en);
  return {
    slug: "contact",
    lang,
    path: localizedPath(lang, "/contact"),
    title: x("Contacto", "Contact"),
    metaTitle: x(
      "Contacto — Santiago Gómez de la Torre Romero | sgomez.dev",
      "Contact — Santiago Gómez de la Torre Romero | sgomez.dev",
    ),
    description: x(
      "Cómo contactar con Santiago Gómez de la Torre Romero: email, LinkedIn y GitHub. Disponible para freelance y colaboraciones de IA/LLM y full-stack desde Cantabria, España.",
      "How to contact Santiago Gómez de la Torre Romero: email, LinkedIn and GitHub. Available for freelance work and AI/LLM and full-stack collaborations from Cantabria, Spain.",
    ),
    lead: x(
      "La vía directa es el email. Respondo en español o en inglés.",
      "The direct route is email. I reply in Spanish or English.",
    ),
    sections: [
      {
        id: "vias",
        heading: x("Vías de contacto", "Ways to get in touch"),
        blocks: [
          {
            kind: "links",
            items: [
              {
                label: EMAIL,
                href: `mailto:${EMAIL}`,
                note: x(
                  "Email directo. La vía preferente para propuestas de trabajo.",
                  "Direct email. The preferred route for work proposals.",
                ),
              },
              {
                label: "linkedin.com/in/sgomez-dev",
                href: "https://linkedin.com/in/sgomez-dev",
                note: x("Para contacto profesional y referencias.", "For professional contact and references."),
              },
              {
                label: "github.com/sgomez-dev",
                href: "https://github.com/sgomez-dev",
                note: x(
                  "Para incidencias y contribuciones en mis proyectos open source.",
                  "For issues and contributions on my open source projects.",
                ),
              },
              {
                label: SKYQUETZ.url,
                href: SKYQUETZ.url,
                note: x(
                  "Para encargos de la consultora que cofundé, con contrato y equipo detrás.",
                  "For commissions to the consultancy I co-founded, with a contract and a team behind it.",
                ),
              },
            ],
          },
          {
            kind: "paragraph",
            text: x(
              "No hay formulario en esta web y no se recoge ningún dato al visitarla. Escribir un email es todo lo que hace falta, y así el mensaje queda en tu bandeja de enviados y no en una base de datos que no puedes consultar.",
              "There is no form on this website and no data is collected when you visit it. Sending an email is all it takes, so the message stays in your sent folder and not in a database you can't look at.",
            ),
          },
        ],
      },
      {
        id: "para-que",
        heading: x("Para qué escribirme", "What to write to me about"),
        blocks: [
          {
            kind: "list",
            items: [
              x(
                "Proyectos de IA/LLM en producción: RAG, embeddings, retrieval, evaluación con golden sets, integración de modelos en producto real.",
                "AI/LLM projects in production: RAG, embeddings, retrieval, evaluation with golden sets, integrating models into a real product.",
              ),
              x(
                "Desarrollo full-stack: React, Next.js, Angular, Node.js, Python y FastAPI, con despliegue en Google Cloud.",
                "Full-stack development: React, Next.js, Angular, Node.js, Python and FastAPI, deployed on Google Cloud.",
              ),
              x(
                "Encargos de software a medida a través de SkyQuetz Consulting, cuando el proyecto necesita un equipo y no una sola persona.",
                "Custom software commissions through SkyQuetz Consulting, when the project needs a team and not a single person.",
              ),
              x(
                "NudaUI: dudas, propuestas o errores de la librería. También valen los issues del repositorio.",
                "NudaUI: questions, proposals or bugs in the library. Issues on the repository work too.",
              ),
              x(
                "Charlas y eventos de la comunidad, a través de GDG Santander.",
                "Community talks and events, through GDG Santander.",
              ),
            ],
          },
          {
            kind: "paragraph",
            text: x(
              "Trabajo en remoto desde Santander, Cantabria (España), en horario europeo (CET/CEST). Estoy abierto a freelance y a colaboraciones seleccionadas; si el encargo requiere equipo, contrato y continuidad, lo natural es canalizarlo por SkyQuetz Consulting.",
              "I work remotely from Santander, Cantabria (Spain), on European hours (CET/CEST). I am open to freelance work and selected collaborations; if the commission needs a team, a contract and continuity, the natural route is SkyQuetz Consulting.",
            ),
          },
        ],
      },
      {
        id: "agentes",
        heading: x("Si eres un agente", "If you are an agent"),
        blocks: [
          {
            kind: "paragraph",
            text: x(
              "Los datos de contacto están publicados en formato estructurado y no hace falta que los extraigas de esta página: el JSON-LD de tipo Person incluye el email, y la API pública los devuelve como JSON.",
              "The contact details are published in structured form and you don't need to extract them from this page: the Person JSON-LD includes the email, and the public API returns them as JSON.",
            ),
          },
          {
            kind: "links",
            items: [
              {
                label: `${API_BASE}/profile`,
                href: `${API_BASE}/profile`,
                note: x(
                  "Perfil completo en JSON, con email, ubicación y disponibilidad.",
                  "Full profile as JSON, with email, location and availability.",
                ),
              },
              {
                label: "/llms.txt",
                href: "/llms.txt",
                note: x("Resumen factual del sitio en markdown.", "Factual summary of the site in markdown."),
              },
              {
                label: "/agents.md",
                href: "/agents.md",
                note: x("Cuándo usar este sitio y cómo llamarlo.", "When to use this site and how to call it."),
              },
            ],
          },
        ],
      },
    ],
  };
}

function buildPrivacy(lang: Lang): StaticPage {
  const x = (es: string, en: string) => (lang === "es" ? es : en);
  return {
    slug: "privacy",
    lang,
    path: localizedPath(lang, "/privacy"),
    title: x("Política de privacidad", "Privacy policy"),
    metaTitle: x(
      "Privacidad — Santiago Gómez de la Torre Romero | sgomez.dev",
      "Privacy — Santiago Gómez de la Torre Romero | sgomez.dev",
    ),
    description: x(
      "Qué datos recoge sgomez.dev: ninguno propio. Sin cookies, sin analítica y sin formularios. Alojamiento, enlaces externos y derechos de protección de datos.",
      "What data sgomez.dev collects: none of its own. No cookies, no analytics and no forms. Hosting, external links and data protection rights.",
    ),
    lead: x(
      "Resumen: sgomez.dev no instala cookies, no ejecuta analítica y no tiene formularios. No hay ningún dato tuyo que yo pueda consultar.",
      "In short: sgomez.dev sets no cookies, runs no analytics and has no forms. There is no data of yours that I can look at.",
    ),
    sections: [
      {
        id: "responsable",
        heading: x("Responsable", "Data controller"),
        blocks: [
          {
            kind: "paragraph",
            text: x(
              `El responsable de este sitio es Santiago Gómez de la Torre Romero, en Santander, Cantabria (España). Para cualquier cuestión relativa a esta política, el canal es ${EMAIL}. Este sitio es un portafolio personal: no vende nada, no registra usuarios y no tiene área privada.`,
              `The person responsible for this site is Santiago Gómez de la Torre Romero, in Santander, Cantabria (Spain). For any question about this policy, the channel is ${EMAIL}. This site is a personal portfolio: it sells nothing, registers no users and has no private area.`,
            ),
          },
        ],
      },
      {
        id: "que-no-se-recoge",
        heading: x("Qué NO se recoge", "What is NOT collected"),
        blocks: [
          {
            kind: "list",
            items: [
              x(
                "Cookies propias: ninguna. El sitio no escribe cookies ni usa localStorage o sessionStorage para seguirte.",
                "First-party cookies: none. The site writes no cookies and does not use localStorage or sessionStorage to track you.",
              ),
              x(
                "Analítica: ninguna. No hay Google Analytics, ni Tag Manager, ni Plausible, ni ningún otro script de medición.",
                "Analytics: none. There is no Google Analytics, no Tag Manager, no Plausible and no other measurement script.",
              ),
              x(
                "Formularios: ninguno. El contacto es un enlace mailto, así que el mensaje sale de tu cliente de correo y no pasa por este servidor.",
                "Forms: none. Contact is a mailto link, so the message leaves from your email client and does not pass through this server.",
              ),
              x(
                "Publicidad y perfilado: ninguno. No se venden ni se ceden datos, porque no hay datos que ceder.",
                "Advertising and profiling: none. No data is sold or shared, because there is no data to share.",
              ),
              x(
                "Tipografías remotas: ninguna. Inter Tight e Instrument Serif, que Next.js descarga al compilar y sirve desde este mismo dominio, así que tu navegador no pide nada a un tercero para renderizar la página.",
                "Remote fonts: none. Inter Tight and Instrument Serif, which Next.js downloads at build time and serves from this same domain, so your browser requests nothing from a third party to render the page.",
              ),
            ],
          },
        ],
      },
      {
        id: "que-si-ocurre",
        heading: x("Qué sí ocurre, y conviene que sepas", "What does happen, and worth knowing"),
        blocks: [
          {
            kind: "paragraph",
            text: x(
              "El sitio está alojado en Vercel. Como cualquier servidor web, su infraestructura registra las peticiones que recibe —dirección IP, agente de usuario, ruta pedida, fecha y hora— para servir la página y protegerse de abusos. Esos registros los genera y conserva el proveedor de alojamiento conforme a sus propias políticas, no una herramienta instalada por mí, y yo no los uso para identificar a nadie ni los cruzo con ninguna otra fuente.",
              "The site is hosted on Vercel. Like any web server, its infrastructure logs the requests it receives —IP address, user agent, requested path, date and time— to serve the page and protect itself from abuse. Those logs are generated and kept by the hosting provider under its own policies, not by a tool I installed, and I do not use them to identify anyone or cross them with any other source.",
            ),
          },
          {
            kind: "paragraph",
            text: x(
              "Si me escribes un email, trato tu dirección y el contenido del mensaje con la única finalidad de responderte y, en su caso, gestionar la relación profesional que se derive. La base jurídica es tu propia solicitud (interés legítimo y, cuando proceda, la ejecución de un contrato). No uso esa dirección para enviarte comunicaciones comerciales y conservo el correo solo mientras la conversación tenga sentido.",
              "If you email me, I process your address and the content of the message for the sole purpose of replying and, where applicable, managing the professional relationship that follows. The legal basis is your own request (legitimate interest and, where relevant, performance of a contract). I do not use that address to send you commercial communications and I keep the email only for as long as the conversation makes sense.",
            ),
          },
          {
            kind: "paragraph",
            text: x(
              "La web enlaza a sitios de terceros (GitHub, LinkedIn, npm, Google Drive para los certificados): cuando sigues uno de esos enlaces sales de sgomez.dev y pasas a regirte por la política de privacidad de ese tercero.",
              "The site links to third-party sites (GitHub, LinkedIn, npm, Google Drive for the certificates): when you follow one of those links you leave sgomez.dev and that third party's privacy policy applies.",
            ),
          },
        ],
      },
      {
        id: "derechos",
        heading: x("Tus derechos", "Your rights"),
        blocks: [
          {
            kind: "paragraph",
            text: x(
              `Conforme al Reglamento General de Protección de Datos (UE) 2016/679 y a la Ley Orgánica 3/2018, puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad escribiendo a ${EMAIL}. En la práctica, si nunca me has escrito no tengo ningún dato tuyo que rectificar o suprimir. Si consideras que el tratamiento no se ajusta a la normativa, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).`,
              `Under the General Data Protection Regulation (EU) 2016/679 and Spain's Organic Law 3/2018, you can exercise your rights of access, rectification, erasure, objection, restriction of processing and portability by writing to ${EMAIL}. In practice, if you have never written to me I hold no data of yours to rectify or erase. If you believe the processing does not comply with the rules, you can complain to the Spanish Data Protection Agency (aepd.es).`,
            ),
          },
          {
            kind: "paragraph",
            text: x(
              "Esta política se actualizará si algún día el sitio incorpora analítica, formularios o cualquier otro tratamiento. Mientras el texto diga lo que dice, es porque no los hay: puedes comprobarlo tú mismo, el código de esta web es público en github.com/sgomez-dev.",
              "This policy will be updated if the site ever adds analytics, forms or any other processing. As long as the text says what it says, it is because there are none: you can check for yourself, the code of this website is public at github.com/sgomez-dev.",
            ),
          },
        ],
      },
    ],
  };
}

function buildDevelopers(lang: Lang): StaticPage {
  const x = <T extends string | string[]>(es: T, en: T): T => (lang === "es" ? es : en);
  const aboutUrl = `${SITE_URL}${localizedPath(lang, "/about")}`;
  return {
    slug: "developers",
    lang,
    path: localizedPath(lang, "/developers"),
    title: x("Portal para desarrolladores y agentes", "Portal for developers and agents"),
    metaTitle: x(
      "Developers — API pública de sgomez.dev | Santiago Gómez de la Torre Romero",
      "Developers — sgomez.dev public API | Santiago Gómez de la Torre Romero",
    ),
    description: x(
      "Portal para desarrolladores de sgomez.dev: API REST pública y sin autenticación, especificación OpenAPI 3.1, errores en JSON, negociación de contenido en markdown y ficheros de instrucciones para agentes.",
      "Developer portal for sgomez.dev: a public REST API with no authentication, an OpenAPI 3.1 specification, JSON errors, markdown content negotiation and instruction files for agents.",
    ),
    lead: x(
      "Todo lo que esta web publica sobre mí está también disponible como JSON, como OpenAPI y como markdown. Sin claves, sin registro y con CORS abierto.",
      "Everything this website publishes about me is also available as JSON, as OpenAPI and as markdown. No keys, no sign-up and with open CORS.",
    ),
    sections: [
      {
        id: "quickstart",
        heading: "Quickstart",
        blocks: [
          {
            kind: "paragraph",
            text: x(
              "Tres llamadas y ya tienes el mapa completo: comprueba que la API responde, léela desde su especificación y pide el perfil.",
              "Three calls and you have the whole map: check that the API responds, read it from its specification and ask for the profile.",
            ),
          },
          {
            kind: "code",
            language: "bash",
            code: [
              `curl -s ${SITE_URL}${API_BASE}/health`,
              `curl -s ${SITE_URL}/openapi.json`,
              `curl -s ${SITE_URL}${API_BASE}/profile`,
            ].join("\n"),
          },
          {
            kind: "paragraph",
            text: x(
              "No hay sandbox aparte ni claves de prueba: la API es de solo lectura y todo su contenido ya es público, así que el entorno de producción ES el entorno de pruebas. No hay nada que puedas romper con un GET.",
              "There is no separate sandbox or test keys: the API is read-only and all of its content is already public, so the production environment IS the test environment. There is nothing you can break with a GET.",
            ),
          },
        ],
      },
      {
        id: "endpoints",
        heading: "Endpoints",
        blocks: [
          {
            kind: "table",
            head: x(["Método y ruta", "operationId", "Qué devuelve"], ["Method and path", "operationId", "What it returns"]),
            rows: [
              [`GET ${API_BASE}/health`, "getHealth", x("Estado del servicio y enlaces de entrada.", "Service status and entry links.")],
              [`GET ${API_BASE}/profile`, "getProfile", x("Identidad, rol, ubicación, contacto y disponibilidad.", "Identity, role, location, contact and availability.")],
              [`GET ${API_BASE}/about`, "getAbout", x("Biografía larga y cronología por años.", "Long biography and year-by-year timeline.")],
              [`GET ${API_BASE}/projects`, "listProjects", x("Proyectos publicados, con stack y enlace.", "Published projects, with stack and link.")],
              [`GET ${API_BASE}/projects/{slug}`, "getProject", x("Un proyecto concreto por su slug.", "A single project by its slug.")],
              [`GET ${API_BASE}/experience`, "listExperience", x("Puestos, organizaciones y periodos.", "Positions, organizations and periods.")],
              [`GET ${API_BASE}/skills`, "listSkills", x("Tecnologías por categoría, con años de uso.", "Technologies by category, with years of use.")],
              [`GET ${API_BASE}/certifications`, "listCertifications", x("Certificaciones con enlace al credencial.", "Certifications with a link to the credential.")],
              [`GET ${API_BASE}/education`, "listEducation", x("Formación reglada.", "Formal education.")],
              [`GET ${API_BASE}/recommendations`, "listRecommendations", x("Recomendaciones escritas por colegas y clientes.", "Recommendations written by colleagues and clients.")],
              [`GET ${API_BASE}/search?q=`, "searchContent", x("Búsqueda por palabras clave sobre todo lo anterior.", "Keyword search over all of the above.")],
            ],
          },
          {
            kind: "paragraph",
            text: x(
              "Las colecciones aceptan `limit` (1–100) y `offset` (0–1000). `search` acepta `q` (obligatorio) y `limit` (1–50). Toda respuesta correcta va envuelta en `{ \"data\": …, \"meta\": … }`, y `meta` incluye `count`, `total`, `self` y `documentation_url`.",
              "Collections accept `limit` (1–100) and `offset` (0–1000). `search` accepts `q` (required) and `limit` (1–50). Every successful response is wrapped in `{ \"data\": …, \"meta\": … }`, and `meta` includes `count`, `total`, `self` and `documentation_url`.",
            ),
          },
        ],
      },
      {
        id: "errores",
        heading: x("Errores", "Errors"),
        blocks: [
          {
            kind: "paragraph",
            text: x(
              "Los errores también son JSON, con el mismo sobre siempre. `code` es estable y se puede usar en un `switch`; `hint` dice qué hacer para arreglarlo, que es lo que a un agente le falta cuando recibe un 404 vacío.",
              "Errors are JSON too, always in the same envelope. `code` is stable and can be used in a `switch`; `hint` says what to do to fix it, which is what an agent lacks when it gets an empty 404.",
            ),
          },
          {
            kind: "code",
            language: "json",
            code: [
              "{",
              '  "error": {',
              '    "status": 404,',
              '    "code": "not_found",',
              '    "message": "No project with slug \\"nope\\".",',
              '    "hint": "Known slugs: nudaui, sortlab, … List them with GET /api/v1/projects.",',
              `    "documentation_url": "${SITE_URL}/developers"`,
              "  }",
              "}",
            ].join("\n"),
          },
          {
            kind: "list",
            items: [
              x(
                "`400 invalid_parameter` — un parámetro falta o está fuera de rango.",
                "`400 invalid_parameter` — a parameter is missing or out of range.",
              ),
              x(
                "`404 not_found` — el recurso o el endpoint no existe. Cualquier ruta desconocida bajo /api responde JSON, nunca HTML.",
                "`404 not_found` — the resource or the endpoint does not exist. Any unknown route under /api responds with JSON, never HTML.",
              ),
              x(
                "`405 method_not_allowed` — la API es de solo lectura; la respuesta incluye la cabecera `Allow`.",
                "`405 method_not_allowed` — the API is read-only; the response includes the `Allow` header.",
              ),
            ],
          },
        ],
      },
      {
        id: "autenticacion",
        heading: x("Autenticación y límites", "Authentication and limits"),
        blocks: [
          {
            kind: "paragraph",
            text: x(
              "No hay autenticación ni claves de API: no existe ningún dato privado detrás, así que una clave solo sería un trámite. Tampoco hay límite de peticiones por cliente más allá de la protección ordinaria de la CDN. A cambio, las respuestas se sirven cacheadas (`Cache-Control: public, max-age=300, s-maxage=3600`): si necesitas el catálogo entero, una llamada por colección basta, y repetir la misma llamada en bucle no te dará datos más frescos.",
              "There is no authentication or API keys: there is no private data behind it, so a key would only be red tape. There is no per-client rate limit either, beyond the CDN's ordinary protection. In exchange, responses are served cached (`Cache-Control: public, max-age=300, s-maxage=3600`): if you need the whole catalog, one call per collection is enough, and repeating the same call in a loop won't give you fresher data.",
            ),
          },
          {
            kind: "paragraph",
            text: x(
              "CORS está abierto a cualquier origen (`Access-Control-Allow-Origin: *`) para GET, HEAD y OPTIONS, así que la API se puede llamar desde el navegador. Los datos se publican bajo licencia CC BY 4.0: úsalos citando la fuente.",
              "CORS is open to any origin (`Access-Control-Allow-Origin: *`) for GET, HEAD and OPTIONS, so the API can be called from the browser. The data is published under the CC BY 4.0 license: use it with attribution.",
            ),
          },
        ],
      },
      {
        id: "openapi",
        heading: x("Especificación OpenAPI", "OpenAPI specification"),
        blocks: [
          {
            kind: "paragraph",
            text: x(
              "La especificación es OpenAPI 3.1 y se genera desde el mismo código que sirve los endpoints, así que no puede describir una ruta que ya no existe. Cada operación tiene `operationId` único, `summary`, `description`, parámetros tipados y un esquema de respuesta por código, que es justo lo que necesita un cliente de function calling para convertirla en herramientas.",
              "The specification is OpenAPI 3.1 and is generated from the same code that serves the endpoints, so it cannot describe a route that no longer exists. Each operation has a unique `operationId`, a `summary`, a `description`, typed parameters and a response schema per status code, which is exactly what a function-calling client needs to turn it into tools.",
            ),
          },
          {
            kind: "links",
            items: [
              { label: "/openapi.json", href: "/openapi.json", note: x("Ubicación canónica.", "Canonical location.") },
              { label: "/api/openapi.json", href: "/api/openapi.json", note: x("El mismo documento bajo /api.", "The same document under /api.") },
              { label: "/api/openapi.yaml", href: "/api/openapi.yaml", note: x("El mismo documento en YAML.", "The same document as YAML.") },
            ],
          },
        ],
      },
      {
        id: "markdown",
        heading: x("Markdown para agentes", "Markdown for agents"),
        blocks: [
          {
            kind: "paragraph",
            text: x(
              "Las páginas de contenido se sirven en markdown cuando la petición lo pide, siguiendo la convención de acceptmarkdown.com. La URL canónica no cambia y la respuesta lleva `Vary: Accept`, para que una CDN no le dé a un agente la variante HTML que guardó para un navegador.",
              "Content pages are served as markdown when the request asks for it, following the acceptmarkdown.com convention. The canonical URL does not change and the response carries `Vary: Accept`, so a CDN does not hand an agent the HTML variant it cached for a browser.",
            ),
          },
          {
            kind: "code",
            language: "bash",
            code: [
              `curl -s -H "Accept: text/markdown" ${aboutUrl}`,
              "",
              x("# o, si prefieres una URL explícita:", "# or, if you prefer an explicit URL:"),
              `curl -s ${aboutUrl}.md`,
            ].join("\n"),
          },
          {
            kind: "paragraph",
            text: x(
              "Funciona en `/`, `/about`, `/contact`, `/privacy` y `/developers`, y en sus gemelas inglesas bajo `/en/…`. Las rutas que ya son markdown (`/llms.txt`, `/agents.md`) se sirven tal cual. Una ruta que no existe devuelve 404 con un cuerpo markdown que dice a dónde ir, en vez de una página de error que un agente no sabe leer.",
              "It works on `/`, `/about`, `/contact`, `/privacy` and `/developers`, and on their English twins under `/en/…`. Routes that are already markdown (`/llms.txt`, `/agents.md`) are served as they are. A route that does not exist returns 404 with a markdown body that says where to go, instead of an error page an agent can't read.",
            ),
          },
        ],
      },
      {
        id: "ficheros",
        heading: x("Ficheros para agentes", "Files for agents"),
        blocks: [
          {
            kind: "links",
            items: [
              { label: "/llms.txt", href: "/llms.txt", note: x("Resumen factual del sitio, con la sección «when to use this».", "Factual summary of the site, with the “when to use this” section.") },
              { label: "/agents.md", href: "/agents.md", note: x("Instrucciones de uso: para qué sirve este sitio y cómo llamarlo.", "Usage instructions: what this site is for and how to call it.") },
              { label: "/sitemap.xml", href: "/sitemap.xml", note: x("Todas las URLs publicadas.", "All published URLs.") },
              { label: "/robots.txt", href: "/robots.txt", note: x("Crawlers de IA explícitamente permitidos.", "AI crawlers explicitly allowed.") },
              { label: "/manifest.webmanifest", href: "/manifest.webmanifest", note: x("Manifiesto de la aplicación web.", "Web app manifest.") },
            ],
          },
        ],
      },
      {
        id: "versionado",
        heading: x("Versionado", "Versioning"),
        blocks: [
          {
            kind: "paragraph",
            text: x(
              "La versión va en la ruta (`/api/v1`). Dentro de v1 solo se añaden campos y endpoints: quitar un campo o renombrar un `operationId` sería un cambio incompatible y saldría en `/api/v2`. Los `code` de error forman parte del contrato y no se renombran.",
              "The version is in the path (`/api/v1`). Within v1 only fields and endpoints are added: removing a field or renaming an `operationId` would be a breaking change and would ship as `/api/v2`. Error `code` values are part of the contract and are not renamed.",
            ),
          },
        ],
      },
    ],
  };
}

const BUILDERS = {
  about: buildAbout,
  contact: buildContact,
  privacy: buildPrivacy,
  developers: buildDevelopers,
} as const;

export type StaticPageSlug = keyof typeof BUILDERS;

/** Las páginas de contenido en un idioma, en el orden en que se anuncian. */
export function staticPages(lang: Lang): StaticPage[] {
  return [BUILDERS.about(lang), BUILDERS.contact(lang), BUILDERS.privacy(lang), BUILDERS.developers(lang)];
}

export function staticPage(slug: StaticPageSlug, lang: Lang): StaticPage {
  return BUILDERS[slug](lang);
}

export const aboutPage: StaticPage = buildAbout("es");
export const contactPage: StaticPage = buildContact("es");
export const privacyPage: StaticPage = buildPrivacy("es");
export const developersPage: StaticPage = buildDevelopers("es");

/** Alias de las páginas españolas: las rutas actuales sin prefijo las siguen usando. */
export const STATIC_PAGES: StaticPage[] = staticPages("es");

/** Resuelve una ruta localizada (`/en/contact`) a su página, en cualquier idioma. */
export function findStaticPage(path: string): StaticPage | undefined {
  for (const lang of LANGS) {
    const found = staticPages(lang).find((page) => page.path === path);
    if (found) return found;
  }
  return undefined;
}
