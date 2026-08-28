import { IDENTITY, SKYQUETZ } from "@/app/seo";
import { about } from "@/app/content";
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

export const aboutPage: StaticPage = {
  slug: "about",
  path: "/about",
  title: "Sobre Santiago Gómez de la Torre Romero",
  metaTitle: "Sobre mí — Santiago Gómez de la Torre Romero | sgomez.dev",
  description:
    "Quién es Santiago Gómez de la Torre Romero: full-stack engineer en Evenbytes, cofundador de SkyQuetz Consulting, creador de NudaUI y organizador de GDG Santander. Trayectoria, formación y en qué trabaja hoy.",
  lead: "Full-stack engineer en Cantabria, España. Llevo la IA a producción, no a demos. Cofundador de SkyQuetz Consulting y creador de NudaUI.",
  sections: [
    {
      id: "quien-soy",
      heading: "Quién soy",
      blocks: [
        {
          kind: "paragraph",
          text: "Me llamo Santiago Gómez de la Torre Romero — «Gómez de la Torre» es un apellido compuesto, no dos apellidos sueltos — y soy full-stack engineer. Vivo en Cantabria, España, y trabajo en remoto. Hoy desarrollo software en Evenbytes con Angular, Node.js y Google Cloud, y en 2026 cofundé SkyQuetz Consulting con tres socios más, donde llevo la parte de ingeniería.",
        },
        {
          kind: "paragraph",
          text: "Hay personas que llegan a la tecnología por casualidad. Yo no. A mí siempre me atrapó entender cómo funciona todo por dentro: cómo se despliega un servicio, por qué un sistema falla, qué hace que una interfaz fluya o se rompa. Con el tiempo, esa curiosidad dejó de ser un impulso y se convirtió en mi forma de trabajar: entender para construir, y construir para mejorar.",
        },
        {
          kind: "paragraph",
          text: "Mi trayectoria combina administración de sistemas, desarrollo web y arquitectura en la nube. Empecé en FUNIBER en el equipo de redacción técnica, pasé a sysadmin y QA, seguí como técnico de soporte IT en la Universidad Europea del Atlántico —donde además estudio Ingeniería Informática— y desde junio de 2025 soy desarrollador en Evenbytes. Esa mezcla de operar sistemas antes de escribirlos es la razón de que me interesen tanto el despliegue y la observabilidad como el código.",
        },
      ],
    },
    {
      id: "en-que-trabajo",
      heading: "En qué trabajo ahora",
      blocks: [
        {
          kind: "paragraph",
          text: "Construyo IA que llega a producto, no a demos. Diseño sistemas que se pueden medir: pipelines de RAG con embeddings y retrieval por coseno, evaluación con golden sets propios y modelos de lenguaje integrados en el producto real. La búsqueda semántica de NudaUI responde en lenguaje natural sobre más de 1.000 componentes, y con evals propias subí la precisión del primer resultado del 67% al 80% (hit@1), reportando también la categoría que empeoró. También mantengo en producción un asistente conversacional B2B construido sobre la API de Claude. Todo esto sin frameworks mágicos, entendiendo cada pieza del pipeline.",
        },
        {
          kind: "paragraph",
          text: `En 2026 cofundé ${SKYQUETZ.name} con tres socios más: una consultora de software a medida para negocios de habla hispana, en remoto y sin intermediarios. Soy cofundador, uno de cuatro socios, no fundador único. Llevo la ingeniería, y de ahí han salido dos productos propios: Synentria, un motor de auditoría SEO y GEO cuyos hallazgos son deterministas y no los decide ningún modelo, y Packatrack, un SaaS de conciliación de liquidaciones para operadores de última milla.`,
        },
        {
          kind: "paragraph",
          text: "Y cuando no construyo para clientes, construyo para la comunidad: soy el creador y único mantenedor de NudaUI, una librería open-source con más de 1.000 componentes UI copy-paste en 81 categorías que funcionan en cualquier framework, y de sgomez-cli, una herramienta publicada en npm para arrancar proyectos full-stack en un solo comando. Además organizo eventos con GDG Santander y he competido en Hack2Progress.",
        },
      ],
    },
    {
      id: "trayectoria",
      heading: "Trayectoria",
      blocks: [
        {
          kind: "list",
          items: about.timeline.map((item) => `**${item.year}** — ${item.title}: ${item.desc}`),
        },
      ],
    },
    {
      id: "datos",
      heading: "Datos verificables",
      blocks: [
        {
          kind: "list",
          items: [
            "Nombre completo: Santiago Gómez de la Torre Romero.",
            "Rol: Full-Stack Engineer (AI/LLM) en Evenbytes.",
            `Cofundador de ${SKYQUETZ.name} (${SKYQUETZ.url}), fundada en ${SKYQUETZ.foundingDate} por cuatro socios.`,
            "Formación: Grado en Ingeniería Informática, Universidad Europea del Atlántico (desde 2021).",
            "Comunidad: organizador de Google Developer Group (GDG) Santander.",
            "Ubicación: Santander, Cantabria, España. Trabajo en remoto.",
            "Idiomas: español (nativo) e inglés.",
            `Contacto: ${EMAIL}.`,
          ],
        },
        {
          kind: "paragraph",
          text: `Los mismos datos, en formato legible por máquina, están en ${SITE_URL}/llms.txt y en el endpoint ${SITE_URL}${API_BASE}/profile de la API pública.`,
        },
      ],
    },
  ],
};

export const contactPage: StaticPage = {
  slug: "contact",
  path: "/contact",
  title: "Contacto",
  metaTitle: "Contacto — Santiago Gómez de la Torre Romero | sgomez.dev",
  description:
    "Cómo contactar con Santiago Gómez de la Torre Romero: email, LinkedIn y GitHub. Disponible para freelance y colaboraciones de IA/LLM y full-stack desde Cantabria, España.",
  lead: "La vía directa es el email. Respondo en español o en inglés.",
  sections: [
    {
      id: "vias",
      heading: "Vías de contacto",
      blocks: [
        {
          kind: "links",
          items: [
            { label: EMAIL, href: `mailto:${EMAIL}`, note: "Email directo. La vía preferente para propuestas de trabajo." },
            { label: "linkedin.com/in/sgomez-dev", href: "https://linkedin.com/in/sgomez-dev", note: "Para contacto profesional y referencias." },
            { label: "github.com/sgomez-dev", href: "https://github.com/sgomez-dev", note: "Para incidencias y contribuciones en mis proyectos open source." },
            { label: SKYQUETZ.url, href: SKYQUETZ.url, note: "Para encargos de la consultora que cofundé, con contrato y equipo detrás." },
          ],
        },
        {
          kind: "paragraph",
          text: "No hay formulario en esta web y no se recoge ningún dato al visitarla. Escribir un email es todo lo que hace falta, y así el mensaje queda en tu bandeja de enviados y no en una base de datos que no puedes consultar.",
        },
      ],
    },
    {
      id: "para-que",
      heading: "Para qué escribirme",
      blocks: [
        {
          kind: "list",
          items: [
            "Proyectos de IA/LLM en producción: RAG, embeddings, retrieval, evaluación con golden sets, integración de modelos en producto real.",
            "Desarrollo full-stack: React, Next.js, Angular, Node.js, Python y FastAPI, con despliegue en Google Cloud.",
            "Encargos de software a medida a través de SkyQuetz Consulting, cuando el proyecto necesita un equipo y no una sola persona.",
            "NudaUI: dudas, propuestas o errores de la librería. También valen los issues del repositorio.",
            "Charlas y eventos de la comunidad, a través de GDG Santander.",
          ],
        },
        {
          kind: "paragraph",
          text: "Trabajo en remoto desde Santander, Cantabria (España), en horario europeo (CET/CEST). Estoy abierto a freelance y a colaboraciones seleccionadas; si el encargo requiere equipo, contrato y continuidad, lo natural es canalizarlo por SkyQuetz Consulting.",
        },
      ],
    },
    {
      id: "agentes",
      heading: "Si eres un agente",
      blocks: [
        {
          kind: "paragraph",
          text: "Los datos de contacto están publicados en formato estructurado y no hace falta que los extraigas de esta página: el JSON-LD de tipo Person incluye el email, y la API pública los devuelve como JSON.",
        },
        {
          kind: "links",
          items: [
            { label: `${API_BASE}/profile`, href: `${API_BASE}/profile`, note: "Perfil completo en JSON, con email, ubicación y disponibilidad." },
            { label: "/llms.txt", href: "/llms.txt", note: "Resumen factual del sitio en markdown." },
            { label: "/agents.md", href: "/agents.md", note: "Cuándo usar este sitio y cómo llamarlo." },
          ],
        },
      ],
    },
  ],
};

export const privacyPage: StaticPage = {
  slug: "privacy",
  path: "/privacy",
  title: "Política de privacidad",
  metaTitle: "Privacidad — Santiago Gómez de la Torre Romero | sgomez.dev",
  description:
    "Qué datos recoge sgomez.dev: ninguno propio. Sin cookies, sin analítica y sin formularios. Alojamiento, enlaces externos y derechos de protección de datos.",
  lead: "Resumen: sgomez.dev no instala cookies, no ejecuta analítica y no tiene formularios. No hay ningún dato tuyo que yo pueda consultar.",
  sections: [
    {
      id: "responsable",
      heading: "Responsable",
      blocks: [
        {
          kind: "paragraph",
          text: `El responsable de este sitio es Santiago Gómez de la Torre Romero, en Santander, Cantabria (España). Para cualquier cuestión relativa a esta política, el canal es ${EMAIL}. Este sitio es un portafolio personal: no vende nada, no registra usuarios y no tiene área privada.`,
        },
      ],
    },
    {
      id: "que-no-se-recoge",
      heading: "Qué NO se recoge",
      blocks: [
        {
          kind: "list",
          items: [
            "Cookies propias: ninguna. El sitio no escribe cookies ni usa localStorage o sessionStorage para seguirte.",
            "Analítica: ninguna. No hay Google Analytics, ni Tag Manager, ni Plausible, ni ningún otro script de medición.",
            "Formularios: ninguno. El contacto es un enlace mailto, así que el mensaje sale de tu cliente de correo y no pasa por este servidor.",
            "Publicidad y perfilado: ninguno. No se venden ni se ceden datos, porque no hay datos que ceder.",
            "Tipografías remotas: ninguna. Las fuentes Geist se sirven desde este mismo dominio, así que tu navegador no pide nada a un tercero para renderizar la página.",
          ],
        },
      ],
    },
    {
      id: "que-si-ocurre",
      heading: "Qué sí ocurre, y conviene que sepas",
      blocks: [
        {
          kind: "paragraph",
          text: "El sitio está alojado en Vercel. Como cualquier servidor web, su infraestructura registra las peticiones que recibe —dirección IP, agente de usuario, ruta pedida, fecha y hora— para servir la página y protegerse de abusos. Esos registros los genera y conserva el proveedor de alojamiento conforme a sus propias políticas, no una herramienta instalada por mí, y yo no los uso para identificar a nadie ni los cruzo con ninguna otra fuente.",
        },
        {
          kind: "paragraph",
          text: "Si me escribes un email, trato tu dirección y el contenido del mensaje con la única finalidad de responderte y, en su caso, gestionar la relación profesional que se derive. La base jurídica es tu propia solicitud (interés legítimo y, cuando proceda, la ejecución de un contrato). No uso esa dirección para enviarte comunicaciones comerciales y conservo el correo solo mientras la conversación tenga sentido.",
        },
        {
          kind: "paragraph",
          text: "La sección /lab abre proyectos propios alojados en otros subdominios dentro de un iframe, y el visor de CV muestra un PDF servido desde este mismo dominio. Al abrir uno de esos proyectos, tu navegador conecta con ese subdominio directamente. El resto de la web enlaza a sitios de terceros (GitHub, LinkedIn, npm, Google Drive para los certificados): cuando sigues uno de esos enlaces sales de sgomez.dev y pasas a regirte por la política de privacidad de ese tercero.",
        },
      ],
    },
    {
      id: "derechos",
      heading: "Tus derechos",
      blocks: [
        {
          kind: "paragraph",
          text: `Conforme al Reglamento General de Protección de Datos (UE) 2016/679 y a la Ley Orgánica 3/2018, puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad escribiendo a ${EMAIL}. En la práctica, si nunca me has escrito no tengo ningún dato tuyo que rectificar o suprimir. Si consideras que el tratamiento no se ajusta a la normativa, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).`,
        },
        {
          kind: "paragraph",
          text: "Esta política se actualizará si algún día el sitio incorpora analítica, formularios o cualquier otro tratamiento. Mientras el texto diga lo que dice, es porque no los hay: puedes comprobarlo tú mismo, el código de esta web es público en github.com/sgomez-dev.",
        },
      ],
    },
  ],
};

export const developersPage: StaticPage = {
  slug: "developers",
  path: "/developers",
  title: "Portal para desarrolladores y agentes",
  metaTitle: "Developers — API pública de sgomez.dev | Santiago Gómez de la Torre Romero",
  description:
    "Portal para desarrolladores de sgomez.dev: API REST pública y sin autenticación, especificación OpenAPI 3.1, errores en JSON, negociación de contenido en markdown y ficheros de instrucciones para agentes.",
  lead: "Todo lo que esta web publica sobre mí está también disponible como JSON, como OpenAPI y como markdown. Sin claves, sin registro y con CORS abierto.",
  sections: [
    {
      id: "quickstart",
      heading: "Quickstart",
      blocks: [
        {
          kind: "paragraph",
          text: "Tres llamadas y ya tienes el mapa completo: comprueba que la API responde, léela desde su especificación y pide el perfil.",
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
          text: "No hay sandbox aparte ni claves de prueba: la API es de solo lectura y todo su contenido ya es público, así que el entorno de producción ES el entorno de pruebas. No hay nada que puedas romper con un GET.",
        },
      ],
    },
    {
      id: "endpoints",
      heading: "Endpoints",
      blocks: [
        {
          kind: "table",
          head: ["Método y ruta", "operationId", "Qué devuelve"],
          rows: [
            [`GET ${API_BASE}/health`, "getHealth", "Estado del servicio y enlaces de entrada."],
            [`GET ${API_BASE}/profile`, "getProfile", "Identidad, rol, ubicación, contacto y disponibilidad."],
            [`GET ${API_BASE}/about`, "getAbout", "Biografía larga y cronología por años."],
            [`GET ${API_BASE}/projects`, "listProjects", "Proyectos publicados, con stack y enlace."],
            [`GET ${API_BASE}/projects/{slug}`, "getProject", "Un proyecto concreto por su slug."],
            [`GET ${API_BASE}/experience`, "listExperience", "Puestos, organizaciones y periodos."],
            [`GET ${API_BASE}/skills`, "listSkills", "Tecnologías por categoría, con años de uso."],
            [`GET ${API_BASE}/certifications`, "listCertifications", "Certificaciones con enlace al credencial."],
            [`GET ${API_BASE}/education`, "listEducation", "Formación reglada."],
            [`GET ${API_BASE}/recommendations`, "listRecommendations", "Recomendaciones escritas por colegas y clientes."],
            [`GET ${API_BASE}/search?q=`, "searchContent", "Búsqueda por palabras clave sobre todo lo anterior."],
          ],
        },
        {
          kind: "paragraph",
          text: "Las colecciones aceptan `limit` (1–100) y `offset` (0–1000). `search` acepta `q` (obligatorio) y `limit` (1–50). Toda respuesta correcta va envuelta en `{ \"data\": …, \"meta\": … }`, y `meta` incluye `count`, `total`, `self` y `documentation_url`.",
        },
      ],
    },
    {
      id: "errores",
      heading: "Errores",
      blocks: [
        {
          kind: "paragraph",
          text: "Los errores también son JSON, con el mismo sobre siempre. `code` es estable y se puede usar en un `switch`; `hint` dice qué hacer para arreglarlo, que es lo que a un agente le falta cuando recibe un 404 vacío.",
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
            "`400 invalid_parameter` — un parámetro falta o está fuera de rango.",
            "`404 not_found` — el recurso o el endpoint no existe. Cualquier ruta desconocida bajo /api responde JSON, nunca HTML.",
            "`405 method_not_allowed` — la API es de solo lectura; la respuesta incluye la cabecera `Allow`.",
          ],
        },
      ],
    },
    {
      id: "autenticacion",
      heading: "Autenticación y límites",
      blocks: [
        {
          kind: "paragraph",
          text: "No hay autenticación ni claves de API: no existe ningún dato privado detrás, así que una clave solo sería un trámite. Tampoco hay límite de peticiones por cliente más allá de la protección ordinaria de la CDN. A cambio, las respuestas se sirven cacheadas (`Cache-Control: public, max-age=300, s-maxage=3600`): si necesitas el catálogo entero, una llamada por colección basta, y repetir la misma llamada en bucle no te dará datos más frescos.",
        },
        {
          kind: "paragraph",
          text: "CORS está abierto a cualquier origen (`Access-Control-Allow-Origin: *`) para GET, HEAD y OPTIONS, así que la API se puede llamar desde el navegador. Los datos se publican bajo licencia CC BY 4.0: úsalos citando la fuente.",
        },
      ],
    },
    {
      id: "openapi",
      heading: "Especificación OpenAPI",
      blocks: [
        {
          kind: "paragraph",
          text: "La especificación es OpenAPI 3.1 y se genera desde el mismo código que sirve los endpoints, así que no puede describir una ruta que ya no existe. Cada operación tiene `operationId` único, `summary`, `description`, parámetros tipados y un esquema de respuesta por código, que es justo lo que necesita un cliente de function calling para convertirla en herramientas.",
        },
        {
          kind: "links",
          items: [
            { label: "/openapi.json", href: "/openapi.json", note: "Ubicación canónica." },
            { label: "/api/openapi.json", href: "/api/openapi.json", note: "El mismo documento bajo /api." },
            { label: "/api/openapi.yaml", href: "/api/openapi.yaml", note: "El mismo documento en YAML." },
          ],
        },
      ],
    },
    {
      id: "markdown",
      heading: "Markdown para agentes",
      blocks: [
        {
          kind: "paragraph",
          text: "Las páginas de contenido se sirven en markdown cuando la petición lo pide, siguiendo la convención de acceptmarkdown.com. La URL canónica no cambia y la respuesta lleva `Vary: Accept`, para que una CDN no le dé a un agente la variante HTML que guardó para un navegador.",
        },
        {
          kind: "code",
          language: "bash",
          code: [
            `curl -s -H "Accept: text/markdown" ${SITE_URL}/about`,
            "",
            "# o, si prefieres una URL explícita:",
            `curl -s ${SITE_URL}/about.md`,
          ].join("\n"),
        },
        {
          kind: "paragraph",
          text: "Funciona en `/`, `/about`, `/contact`, `/privacy`, `/developers` y `/lab`. Las rutas que ya son markdown (`/llms.txt`, `/agents.md`) se sirven tal cual. Una ruta que no existe devuelve 404 con un cuerpo markdown que dice a dónde ir, en vez de una página de error que un agente no sabe leer.",
        },
      ],
    },
    {
      id: "ficheros",
      heading: "Ficheros para agentes",
      blocks: [
        {
          kind: "links",
          items: [
            { label: "/llms.txt", href: "/llms.txt", note: "Resumen factual del sitio, con la sección «when to use this»." },
            { label: "/agents.md", href: "/agents.md", note: "Instrucciones de uso: para qué sirve este sitio y cómo llamarlo." },
            { label: "/sitemap.xml", href: "/sitemap.xml", note: "Todas las URLs publicadas." },
            { label: "/robots.txt", href: "/robots.txt", note: "Crawlers de IA explícitamente permitidos." },
            { label: "/manifest.webmanifest", href: "/manifest.webmanifest", note: "Manifiesto de la aplicación web." },
          ],
        },
      ],
    },
    {
      id: "versionado",
      heading: "Versionado",
      blocks: [
        {
          kind: "paragraph",
          text: "La versión va en la ruta (`/api/v1`). Dentro de v1 solo se añaden campos y endpoints: quitar un campo o renombrar un `operationId` sería un cambio incompatible y saldría en `/api/v2`. Los `code` de error forman parte del contrato y no se renombran.",
        },
      ],
    },
  ],
};

export const STATIC_PAGES: StaticPage[] = [aboutPage, contactPage, privacyPage, developersPage];

export function findStaticPage(path: string): StaticPage | undefined {
  return STATIC_PAGES.find((page) => page.path === path);
}
