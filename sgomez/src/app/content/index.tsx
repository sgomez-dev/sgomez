// src/content/index.ts

export const hero = {
  name: 'Santiago Gómez de la Torre Romero',
  title: 'Full-Stack Engineer | AI/LLM en producción | Creador de NudaUI',
  subtitle: 'Full-stack engineer que lleva la IA a producción, no a demos. Creador de NudaUI y de una búsqueda semántica en vivo sobre su catálogo.',
}

export const about = {
  description: `
Hay personas que llegan a la tecnología por casualidad. Yo no.
A mí siempre me atrapó entender cómo funciona todo por dentro: cómo se despliega un servicio, por qué un sistema falla, qué hace que una interfaz fluya o se rompa. Con el tiempo, esa curiosidad dejó de ser un impulso y se convirtió en mi forma de trabajar: entender para construir, y construir para mejorar.

Mi trayectoria combina administración de sistemas, desarrollo web y arquitectura en la nube, siempre con una mentalidad autodidacta y orientada a buenas prácticas. A lo largo de los años he trabajado con React, Angular, Node.js, Firebase y Google Cloud, diseñando soluciones que no solo cumplen, sino que se mantienen y evolucionan.

Mi formación se fortaleció en los programas FUNIBER y PROFER, experiencias que me dieron estructura técnica y visión de equipo. Hoy desarrollo software en Evenbytes, creando aplicaciones que deben ser eficientes, escalables y estables porque se usan en entornos reales.

Ahora construyo IA que llega a producto, no a demos. Diseño sistemas que se pueden medir: pipelines de RAG con embeddings y retrieval por coseno, evaluación con golden sets propios y modelos de lenguaje integrados en el producto real. La búsqueda semántica de NudaUI responde en lenguaje natural sobre más de 1.000 componentes, y con evals propias subí la precisión del primer resultado del 67% al 80%. También mantengo en producción un asistente conversacional B2B construido sobre la API de Claude. Todo esto sin frameworks mágicos, entendiendo cada pieza del pipeline.

En 2026 di el paso de dejar de construir solo para otros y cofundé SkyQuetz Consulting con tres socios más: una consultora de software a medida para negocios de habla hispana, en remoto y sin intermediarios. Llevo la ingeniería, y de ahí han salido dos productos propios: Synentria, un motor de auditoría SEO y GEO cuyos hallazgos son deterministas y no los decide ningún modelo, y Packatrack, un SaaS de conciliación de liquidaciones. Cofundar cambia el trabajo más de lo que parece: ya no basta con que el código esté bien, hay que decidir el alcance, hablar con el cliente y responder del resultado.

También participo activamente en la comunidad: competí en Hack2Progress y organizo eventos con GDG Santander, donde conecto con desarrolladores, estudiantes y profesionales que comparten mi pasión por construir.

Uno de mis proyectos más representativos es EliteEstate Manager, una solución inmobiliaria creada desde cero para resolver necesidades reales. Más que código, fue arquitectura, diseño, producto y visión end-to-end.

Y cuando no construyo para clientes, construyo para la comunidad: soy el creador y mantenedor de NudaUI, una librería open-source con más de 1.000 componentes UI copy-paste en 81 categorías que funcionan en cualquier framework, y de sgomez-cli, una herramienta publicada en npm para arrancar proyectos full-stack en un solo comando.
`,
  timeline: [
    { year: '2021', title: 'Inicios en el Desarrollo', desc: 'Comienzo en FUNIBER como parte del equipo de redacción técnica. Primeros proyectos personales con React y PWAs.' },
    { year: '2022', title: 'Sysadmin & QA', desc: 'Promoción a Sysadmin en FUNIBER. Gestión de infraestructura tecnológica y aseguramiento de calidad.' },
    { year: '2023', title: 'Soporte IT Universitario', desc: 'Técnico de Soporte IT en Universidad Europea del Atlántico. Portafolio 3D con Next.js y Framer Motion.' },
    { year: '2024', title: 'Comunidad & Eventos', desc: 'Organizador de GDG Santander. Participación en Hack2Progress. Consolidación como desarrollador full-stack.' },
    { year: '2025', title: 'Desarrollador Profesional', desc: 'EliteEstate Manager para Irma Romero. Developer en Evenbytes con Angular, Node.js y GCP. Múltiples recomendaciones profesionales.' },
    { year: '2026', title: 'Cofundador de SkyQuetz', desc: 'Cofundé SkyQuetz Consulting con tres socios. Llevo la ingeniería y los productos propios: Synentria, motor de auditoría SEO y GEO, y Packatrack.' },
  ],
}

/**
 * SkyQuetz Consulting — la consultora que cofundé.
 *
 * Los datos de aquí son los MISMOS que declara skyquetz.com en su propio
 * JSON-LD (fecha de fundación, número de socios, eslogan, productos). No se
 * escriben "a ojo": si las dos webs dicen cosas distintas de la misma
 * empresa, un motor no las resuelve como una sola entidad y el enlace entre
 * los dos dominios deja de valer lo que tiene que valer.
 */
export const skyquetz = {
  name: 'SkyQuetz Consulting',
  role: 'Cofundador',
  slogan: 'Estándar internacional, trato cercano.',
  url: 'https://skyquetz.com',
  cta: 'skyquetz.com',
  logo: '/brand/skyquetz-logo.webp',
  logoAlt: 'Logotipo de SkyQuetz Consulting',
  desc: 'Consultora tecnológica que fundé en 2026 con tres socios más. Construimos software a medida para negocios de habla hispana: sistemas, plataformas, automatizaciones, tiendas y páginas web. Todo en remoto y sin intermediarios, porque cada proyecto lo lidera en persona el ingeniero que lo escribe.',
  myPart: 'Mi parte es la ingeniería: la arquitectura, el código y los productos propios que salen de la casa.',
  stats: [
    { value: '2026', label: 'fundada' },
    { value: '4', label: 'socios' },
    { value: '100%', label: 'remoto' },
  ],
  products: [
    {
      name: 'Synentria',
      tagline: 'Motor de auditoría SEO y GEO',
      desc: 'Le pasas la URL de un sitio y devuelve hallazgos priorizados más parches aplicables. Ningún hallazgo lo decide un modelo de lenguaje: todos salen de comprobaciones deterministas, y un modelo solo redacta prosa alrededor de un hallazgo que ya existe. Escribí el motor.',
      stack: ['TypeScript', 'Nuxt', 'Node', 'Evals'],
      url: 'https://synentria.skyquetz.com',
      cta: 'synentria.skyquetz.com',
    },
    {
      name: 'Packatrack',
      tagline: 'Conciliación de liquidaciones B2B',
      desc: 'SaaS para operadores de última milla: calcula lo que una operación debía facturar a partir de sus rutas, tarifas e incidencias, lo compara con la liquidación que recibió del carrier y documenta cada diferencia con su dato de origen.',
      stack: ['React', 'Docker', 'Jenkins', 'SonarQube'],
      url: 'https://packatrack.skyquetz.com',
      cta: 'packatrack.skyquetz.com',
    },
  ],
}

export const certifications = [
  { title: "Software Engineer Intern", institution: "HackerRank", date: "Septiembre 2025", img: "/models/assets/certifications/hackerrank.png", url: "https://drive.google.com/file/d/1IXV7yxijNfycqqqMvovNXFZMOV6fjJkK/view?usp=sharing" },
  { title: "McKensey.org Forward Program", institution: "McKensey.org", date: "Julio 2025", img: "/models/assets/certifications/mckinsey.png", url: "https://drive.google.com/file/d/1hbWX1oyBi8zUXPsgUtvgZ8ueekno31pz/view?usp=sharing" },
  { title: "Angular (basic)", institution: "HackerRank", date: "Junio 2025", img: "/models/assets/certifications/hackerrank.png", url: "https://drive.google.com/file/d/1DqpO9M0GigJT43VKkulbZuwKg6-HT1Ab/view?usp=sharing" },
  { title: "Software Engineer", institution: "HackerRank", date: "Mayo 2025", img: "/models/assets/certifications/hackerrank.png", url: "https://drive.google.com/file/d/10MHq7lyYelaamoLLJhwOc_BVsdtK3qQ4/view?usp=sharing" },
  { title: "Frontend Developer (React)", institution: "HackerRank", date: "Mayo 2025", img: "/models/assets/certifications/hackerrank.png", url: "https://drive.google.com/file/d/1CQH076Ss81QmlBZJ9wSyvOx7HTk-gK-y/view?usp=sharing" },
  { title: "SCHNEIDER ELECTRIC Hackathon 2025 - IT Challenge", institution: "NUWE", date: "Abril 2025", img: "/models/assets/certifications/nuwe.png", url: "https://drive.google.com/file/d/15L_2k12CsYcxovvqJzgoC56p05Ypz-xC/view?usp=sharing" },
  { title: "Master en JavaScript 2025: Aprender JS, Angular, Node, Astro", institution: "Udemy", date: "Marzo 2025", img: "/models/assets/certifications/udemy.png", url: "https://drive.google.com/file/d/10FqgAblTBp76CKhc31ZnV0LW-D3kkXuB/view?usp=sharing" },
  { title: "The Web Developer Bootcamp 2025", institution: "Udemy", date: "Marzo 2025", img: "/models/assets/certifications/udemy.png", url: "https://drive.google.com/file/d/1XQsTwo88A7isHT2pSBEuoNTFjYhzY81j/view?usp=sharing" },
  { title: "Azure DevOps: Flujos de CI/CD", institution: "Platzi", date: "Marzo 2025", img: "/models/assets/certifications/platzi.png", url: "https://drive.google.com/file/d/1pcAssPwA5b3rep77kcW8azReUbFYXzC9/view?usp=sharing" },
  { title: "Certificado de Participación Hack2Progress", institution: "CIC Consulting Informático", date: "Marzo 2025", img: "/models/assets/certifications/cic.png", url: "https://drive.google.com/file/d/14IbZJ8hqiM2lUPb1YBftxyfgWTB6jK-d/view?usp=sharing" },
  { title: "Machine Learning y Data Science", institution: "Udemy", date: "Marzo 2025", img: "/models/assets/certifications/udemy.png", url: "https://drive.google.com/file/d/1isr8dB1w1pUFD4T704k2xI0R4rUrV_N4/view?usp=sharing" },
  { title: "Cómo incluir la sostenibilidad en tu estrategia de cloud computing", institution: "LinkedIn", date: "Marzo 2025", img: "/models/assets/certifications/linkedin.png", url: "https://drive.google.com/file/d/1JYMq9yOPD0qRMB4gB_Gy9SbZ3qo3ZVh8/view?usp=sharing" },
  { title: "Resolución de problemas con el pensamiento crítico", institution: "LinkedIn", date: "Marzo 2025", img: "/models/assets/certifications/linkedin.png", url: "https://drive.google.com/file/d/1G_RkQD-O23AEpnj_JKOEjJ2wYeFFFMXN/view?usp=sharing" },
  { title: "Prompt Engineering", institution: "LinkedIn", date: "Marzo 2025", img: "/models/assets/certifications/linkedin.png", url: "https://drive.google.com/file/d/1SegpNdQ74TAK6TrkJDaHNcjINyoXjXY1/view?usp=sharing" },
  { title: "Master en React", institution: "Udemy", date: "Diciembre 2024", img: "/models/assets/certifications/udemy.png", url: "https://drive.google.com/file/d/1woMqIXOjTDeTFTQXy2kdL33zgIMe4WYJ/view?usp=sharing" },
  { title: "Legacy Front End", institution: "freecodecamp", date: "Noviembre 2024", img: "/models/assets/certifications/freecodecamp.png", url: "https://drive.google.com/file/d/1ohmcttf7Ca81d_JhHg9sdReB1zHwaWqO/view?usp=sharing" },
  { title: "JavaScript Algorithms and Data Structures (Beta)", institution: "freecodecamp", date: "Noviembre 2024", img: "/models/assets/certifications/freecodecamp.png", url: "https://drive.google.com/file/d/1DGM402G6EroGk3meZJnBRufImBAnMNVn/view?usp=sharing" },
  { title: "Responsive Web Design", institution: "freecodecamp", date: "Noviembre 2024", img: "/models/assets/certifications/freecodecamp.png", url: "https://drive.google.com/file/d/1YFgrFhli2ruL2XrMhXtfYfsnCuwpDQBe/view?usp=sharing" },
  { title: "Front End Development Libraries", institution: "freecodecamp", date: "Noviembre 2024", img: "/models/assets/certifications/freecodecamp.png", url: "https://drive.google.com/file/d/1kUM-BD4FoJUl70jTpp-5UVhrCgotXh2n/view?usp=sharing" },
  { title: "Certificado de Participación", institution: "Universidad Europea del Atlantico", date: "Julio 2024", img: "/models/assets/certifications/uneatlantico.png", url: "https://drive.google.com/file/d/1wfl_0Dlw17CMrVMIq51I7Sgf5UPhd5Kz/view?usp=sharing" },
];

export const projects = [
  { title: 'NudaUI Semantic Search (RAG)', desc: 'Búsqueda en lenguaje natural sobre 1.000+ componentes de NudaUI. Pipeline de RAG completo, sin frameworks de RAG: embeddings con Voyage, retrieval por coseno, evaluación con un golden set propio, servicio en FastAPI y UI en vivo. Subí la precisión del primer resultado del 67% al 80% (hit@1) y reporté hasta la categoría que empeoró.', stack: 'RAG, Embeddings, Python, FastAPI, Evals', link: 'https://blog.sgomez.dev/rag-busqueda-semantica-nudaui' },
  { title: 'NudaUI', desc: 'Librería open-source de 1.000+ componentes y animaciones UI copy-paste, framework-agnósticos (HTML + CSS, JS solo cuando hace falta), organizados en 81 categorías. Cero dependencias, cero build. Creador y único mantenedor.', stack: 'Next.js, TypeScript, CSS, framework-agnostic', link: 'https://nudaui.dev' },
  { title: 'EliteEstate Manager', desc: 'PWA de gestión inmobiliaria completa con autenticación, propiedades, citas, zonas y panel de administración. Proyecto end-to-end para cliente real.', stack: 'React, Vite, Firebase, TailwindCSS', link: 'https://elite-estate-manager.vercel.app/' },
  { title: 'GeekLab', desc: 'E-commerce full-stack de productos IT con catálogo avanzado, carrito persistente, foro en tiempo real con WebSockets, API GraphQL y panel admin.', stack: 'Svelte 5, Node.js, Express, MongoDB, GraphQL, Socket.io', link: 'https://github.com/sgomez-dev/GeekLab' },
  { title: 'SyncCart', desc: 'Extensión de Chrome que unifica carritos de compra de múltiples tiendas (Amazon, PcComponentes, MediaMarkt) en una sola interfaz con calculadora de presupuesto.', stack: 'Plasmo, React 18, TypeScript, Chrome APIs', link: 'https://github.com/sgomez-dev/SyncCart' },
  { title: 'Sortlab', desc: 'Visualizador interactivo de 15 algoritmos de ordenamiento con animaciones dinámicas y explicaciones estructuradas.', stack: 'React, TypeScript, Framer Motion', link: 'https://sortlab.sgomez.dev' },
  { title: 'Docs - SGOMEZ', desc: 'Documentación visual de mi stack tecnológico con interfaz temática galáctica.', stack: 'React, Vite, TailwindCSS, Framer Motion', link: 'https://docs.sgomez.dev' },
  { title: 'CorvexTalk.AI', desc: 'Chat de traducción con inteligencia artificial. Desplegado con Docker y pipeline CI/CD en Jenkins.', stack: 'Node.js, JavaScript, Docker, Jenkins', link: 'https://corvex-talk-ai.vercel.app' },
  { title: 'Packatrack', desc: 'App de tracking de entregas con registro diario, gestión de incidencias e ingresos.', stack: 'React, CSS, Docker, Jenkins, SonarQube', link: 'https://packatrack.vercel.app' },
  { title: 'sgomez CLI', desc: 'CLI publicada en npm para inicializar proyectos frontend y backend con múltiples frameworks.', stack: 'Node.js, npm', link: 'https://www.npmjs.com/package/sgomez-cli' },
  { title: 'Skyzen', desc: 'App de clima en tiempo real con geolocalización y pronóstico extendido.', stack: 'React, Vite, TailwindCSS, Framer Motion', link: 'https://skyzen.sgomez.dev' },
  { title: 'Galardón', desc: 'Web app para crear y compartir invitaciones de graduación digitales.', stack: 'Vue, TypeScript, CSS', link: 'https://galardon-gamma.vercel.app' },
]

export const education = [
  { title: 'Universidad Europea del Atlántico', desc: '2021 - Actualidad | Grado en ingeniería informática' },
]

export const experience = [
  { title: 'SkyQuetz Consulting - Remoto (España y Latinoamérica)', role: 'Cofundador', desc: 'Cofundé SkyQuetz Consulting con tres socios más para llevar ingeniería de software con estándar internacional a negocios de habla hispana, en remoto y sin intermediarios. Llevo la parte técnica: arquitectura, desarrollo y decisiones de producto, además de los productos propios de la casa. De ahí salen Synentria, un motor de auditoría SEO y GEO cuyos hallazgos son deterministas y no los decide ningún modelo de lenguaje, y Packatrack, un SaaS de conciliación de liquidaciones para operadores de última milla. Aquí no solo escribo el código: decido el alcance, hablo con el cliente y respondo del resultado.', period: '2026 - Actualidad' },
  { title: 'Evenbytes - Santa Cruz de Bezana, Cantabria, España', role: 'Desarrollador de Software', desc: 'En Evenbytes desarrollo y mantengo aplicaciones web escalables utilizando Angular, Node.js y Google Cloud, construyendo interfaces fluidas, APIs eficientes y sistemas seguros basados en Datastore y autenticación corporativa. Participo activamente en decisiones de arquitectura, revisión de código y definición técnica, asegurando calidad y consistencia en cada entrega. Además de programar, optimizo rendimiento, mejoro procesos y colaboro estrechamente con product managers y arquitectos para transformar requisitos complejos en soluciones claras, funcionales y listas para producción.', period: 'Junio 2025 - Actualidad' },
  { title: 'Google Developer Group (GDG) Santander - Santander, Cantabria, España', role: 'Organizador', desc: 'Como organizador de GDG Santander coordino charlas, talleres y eventos que fortalecen la comunidad tecnológica local, trabajando con ponentes y expertos para ofrecer contenido relevante y práctico. Me encargo de la planificación, logística y difusión de cada actividad, impulsando la participación, el aprendizaje y el crecimiento continuo de la comunidad de desarrolladores y entusiastas de la tecnología.', period: 'Noviembre 2024 - Actualidad' },
  { title: 'Irma Romero Morales - Santander, Cantabria, España', role: 'Desarrollador Full-Stack Freelance', desc: 'Desarrollé EliteEstate Manager como freelance para Irma Romero Morales, una PWA completa para la gestión inmobiliaria. Me encargué del diseño, desarrollo y despliegue de la aplicación, creando una interfaz moderna y responsiva con funcionalidades como gestión de propiedades, zonas, agendas y citas. Fue un proyecto end-to-end que reforzó mis habilidades full stack, mi capacidad para trabajar con clientes y mi experiencia construyendo soluciones web reales orientadas a negocio.', period: 'Febrero 2025 - Junio 2025' },
  { title: 'Universidad Europea del Atlántico - Santander, Cantabria, España', role: 'Técnico de Soporte IT', desc: 'Brindé soporte técnico integral en la Universidad Europea del Atlántico, resolviendo incidencias, asistiendo a usuarios y manteniendo la infraestructura informática del campus. Participé en la mejora de sistemas, documenté procesos y aseguré la continuidad operativa de los servicios tecnológicos. Esta experiencia fortaleció mis habilidades en soporte, trabajo en equipo y gestión de sistemas en un entorno académico de alta demanda.', period: 'Julio 2023 - Julio 2024' },
  { title: 'Fundación Universitaria Iberoamericana (FUNIBER) - Santander, Cantabria, España', role: 'Sysadmin & QA Tester', desc: 'Desempeñé un rol híbrido de SysAdmin y QA en FUNIBER, gestionando la infraestructura tecnológica y asegurando la disponibilidad de servidores, redes y servicios internos. Realicé mantenimiento preventivo, supervisión de entornos críticos y automatización de procesos, además de coordinar proyectos tecnológicos alineados con los objetivos de la organización. Esta etapa reforzó mis competencias en administración de sistemas, calidad de software y gestión técnica en entornos colaborativos.', period: 'Julio 2022 - Julio 2023' },
  { title: 'Fundación Universitaria Iberoamericana (FUNIBER) - Santander, Cantabria, España', role: 'Equipo de Redacción de Correos y Guías Técnicas', desc: 'Formé parte del equipo del Programa de Becas de FUNIBER, creando y revisando comunicaciones académicas e internacionales adaptadas a distintos contextos culturales. Colaboré con el equipo para garantizar coherencia y calidad, actualizando guías y documentos según feedback y buenas prácticas. Esta experiencia reforzó mis habilidades en redacción profesional, atención al detalle y gestión documental en entornos educativos.', period: 'Septiembre 2021 - Julio 2022' },
]

export const recommendations = [
  { name: 'Irma Romero', comment: 'Quiero recomendar ampliamente el trabajo de Santiago, quien desarrolló una aplicación a medida para mi empresa inmobiliaria. La app es muy amigable, fácil de usar y ha sido una herramienta clave para optimizar nuestros procesos internos, especialmente en la gestión de inventarios, citas y tareas administrativas. El servicio fue rápido, profesional y con una atención excelente en cada etapa del proceso.', date: '13 de abril de 2025', profileUrl: 'https://www.linkedin.com/in/sgomez-dev/', recommenderUrl: 'https://www.linkedin.com/in/irma-romero-928a9b26/' },
  { name: 'Alejandro Rubio Cao', comment: ['Tuve la oportunidad de trabajar con Santiago en varios proyectos durante nuestra carrera en Ingeniería Informática y dentro del programa de becas de la Universidad Europea del Atlántico, y siempre ha demostrado un gran talento y compromiso. Su capacidad para resolver problemas complejos y su enfoque analítico lo distinguen como un profesional destacado en el campo de la tecnología.', 'No tengo dudas de que su talento y dedicación serán un gran aporte en cualquier desafío que emprenda. Recomiendo a Santiago sin reservas para cualquier oportunidad en el ámbito de la informática.'], date: '10 de abril de 2025', profileUrl: 'https://www.linkedin.com/in/sgomez-dev/', recommenderUrl: 'https://www.linkedin.com/in/alejandro-rubio-cao-82b0181b5/' },
  { name: 'Manuel Rondon', comment: 'Tuve la fortuna de trabajar junto a Santiago al inicio de nuestras carreras y desde entonces destacaba su habilidad para adaptarse rapidamente a nuevos conceptos y tecnologías. Mas adelante tambien tuve la oportunidad de participar junto a él en el hackathon Hack2Progress 2025, en el cual demostró cuanto habia crecido su capacidad tecnica y que conservaba esa gran habilidad de adaptarse a cualquier entorno técnico de manera casi inmediata ha sido una pieza vital en nuestra participación y considero que sería una gran adición a cualquier equipo en el que se encuentre', date: '26 de Marzo de 2025', profileUrl: 'https://www.linkedin.com/in/sgomez-dev/', recommenderUrl: 'https://www.linkedin.com/in/manuel-rondon-1b2816218/' },
  { name: 'Edgar León Du Solier', comment: 'Tuve el gusto de trabajar junto a Santiago en el área de administración de sistemas, acompañándolo en su proceso de formación. Desde el inicio demostró una gran capacidad para entender rápidamente conceptos técnicos complejos, destacándose especialmente por su velocidad de aprendizaje y la facilidad con la que adoptaba nuevos conocimientos. Su proactividad, acompañada de una notable habilidad para resolver problemas, hacen de él un excelente profesional en crecimiento. Sin duda, recomiendo a Santiago como una gran incorporación para cualquier equipo de trabajo', date: '24 de Marzo de 2025', profileUrl: 'https://www.linkedin.com/in/sgomez-dev/', recommenderUrl: 'https://www.linkedin.com/in/edgarleond/' },
]

export const technologies = [
  { category: 'Frontend', skills: [{ name: 'React', years: '3+', icon: '⚛️' }, { name: 'Angular', years: '1+', icon: '🅰️' }, { name: 'Next.js', years: '2+', icon: '▲' }, { name: 'Svelte', years: '1+', icon: '🔥' }, { name: 'TypeScript', years: '2+', icon: '📘' }, { name: 'JavaScript', years: '3+', icon: '📜' }, { name: 'Tailwind CSS', years: '2+', icon: '🎨' }, { name: 'Vite', years: '3+', icon: '⚡' }, { name: 'Framer Motion', years: '1+', icon: '🎬' }] },
  { category: 'Backend', skills: [{ name: 'Node.js', years: '2+', icon: '🟢' }, { name: 'Express', years: '2+', icon: '🚂' }, { name: 'Python', years: '3+', icon: '🐍' }, { name: 'Firebase', years: '2+', icon: '🔥' }, { name: 'GraphQL', years: '1+', icon: '◈' }] },
  { category: 'DevOps & Cloud', skills: [{ name: 'Google Cloud', years: '1+', icon: '☁️' }, { name: 'AWS', years: '1+', icon: '☁️' }, { name: 'Docker', years: '2+', icon: '🐳' }, { name: 'Kubernetes', years: '2+', icon: '⎈' }, { name: 'Jenkins', years: '2+', icon: '🔧' }, { name: 'GitHub', years: '5+', icon: '🐙' }] },
  { category: 'Databases & Tools', skills: [{ name: 'MongoDB', years: '3+', icon: '🍃' }, { name: 'MySQL', years: '1+', icon: '🐬' }, { name: 'Postman', years: '3+', icon: '📮' }, { name: 'SonarQube', years: '2+', icon: '📊' }, { name: 'n8n', years: '1+', icon: '🔗' }] },
]

export const contactLinks = [
  { label: 'LinkedIn', url: 'https://linkedin.com/in/sgomez-dev', color: 'bg-blue-700' },
  { label: 'GitHub', url: 'https://github.com/sgomez-dev', color: 'bg-gray-800' },
  { label: 'Instagram', url: 'https://instagram.com/santigt1503', color: 'bg-pink-500' },
  { label: 'Facebook', url: 'https://fb.com/santi.gomez.568847', color: 'bg-blue-600' },
]
