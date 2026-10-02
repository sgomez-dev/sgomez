const es = {
  nav: {
    work: "Proyectos",
    about: "Sobre mí",
    openSource: "Open source",
    contact: "Contacto",
    skills: "Skills",
    blog: "Blog",
    switchTo: "English",
    skip: "Saltar al contenido",
    ariaMain: "Principal",
    menu: "Menú",
  },
  chapters: {
    hero: {
      eyebrow: "Full-stack engineer · Santander",
      serif: "IA que llega a producción.",
      heading: "Ingeniero full-stack que lleva la IA a producción",
      available: "Disponible para nuevos proyectos",
      portraitAlt: "Retrato de Santiago Gómez de la Torre",
    },
    about: {
      eyebrow: "Sobre mí",
      heading: "Ingeniero de software, con la IA como herramienta de trabajo",
    },
    build: {
      eyebrow: "Cómo construyo",
      heading: "Un producto con IA tiene seis capas, y cuido todas",
      layers: {
        interface: "Interfaz",
        api: "API",
        model: "Modelo",
        data: "Datos",
        evaluation: "Evaluación",
        infrastructure: "Infraestructura",
      },
    },
    experience: {
      eyebrow: "Experiencia",
      heading: "Dónde he trabajado y qué he dejado funcionando",
    },
    work: {
      eyebrow: "Proyectos",
      heading: "Lo que he construido y lo que hace hoy",
    },
    openSource: {
      eyebrow: "Open source",
      heading: "Código que comparto y que otros ya usan",
      skillsDesc: "Colección de comandos y skills para Claude Code, con el catálogo completo para explorar en la web.",
    },
    skyquetz: {
      eyebrow: "Skyquetz",
      heading: "Mi propio producto, de la idea a los usuarios",
      products: "Productos propios",
    },
    proof: {
      eyebrow: "Pruebas",
      heading: "Lo que respalda lo que cuento",
      recommendations: "Recomendaciones",
      certifications: "Certificaciones",
      education: "Formación",
      blog: "Blog",
      blogAll: "Ver todas las entradas",
      minutes: "{n} min de lectura",
      credential: "Ver credencial",
      categories: { PROYECTO: "Proyecto", PODCAST: "Podcast", REFLEXION: "Reflexión", TUTORIAL: "Tutorial", NOTICIA: "Noticia", GENERAL: "General" },
    },
    contact: {
      eyebrow: "Contacto",
      serif: "Hablemos.",
      heading: "¿Tienes un proyecto en mente?",
    },
  },
  projects: {
    open: "Abrir proyecto",
  },
  staticPage: {
    viewMarkdown: "Ver en markdown",
    tableRegion: "Tabla, desplazable horizontalmente",
    codeRegion: "Código, desplazable horizontalmente",
    home: "Volver al inicio",
  },
  cta: {
    talk: "Hablemos",
    work: "Ver proyectos",
    cv: "Descargar CV",
  },
  contact: {
    emailLabel: "O escríbeme directamente",
    profiles: "Perfiles",
    intent: {
      freelance: {
        label: "Proyecto freelance",
        desc: "Cuéntame qué quieres construir, en qué plazos y con qué presupuesto.",
        subject: "Proyecto freelance",
        body: "Hola, Santiago:\n\nTengo un proyecto en mente y me gustaría comentarlo contigo.\n\nQué quiero conseguir:\nPlazos aproximados:\nPresupuesto orientativo:\n\nUn saludo.",
      },
      job: {
        label: "Oportunidad laboral",
        desc: "Cuéntame la empresa, el puesto y la modalidad.",
        subject: "Oportunidad laboral",
        body: "Hola, Santiago:\n\nEstamos buscando un perfil como el tuyo y creo que encajarías.\n\nEmpresa y puesto:\nModalidad y ubicación:\n\nUn saludo.",
      },
      other: {
        label: "Otra cosa",
        desc: "Escríbeme por cualquier otro motivo.",
        subject: "Te escribo desde tu web",
        body: "Hola, Santiago:\n\nTe escribo porque…\n\nUn saludo.",
      },
    },
  },
  figures: {
    years: "{n} años construyendo software",
    projects: "{n} proyectos en producción",
    certs: "{n} certificaciones",
  },
  recommendations: {
    translated: "Original en español",
    readOriginal: "Leer el original",
  },
  footer: {
    ariaLabel: "Pie de página",
    tagline: "Hecho en Santander por Santiago Gómez de la Torre.",
    privacy: "Privacidad",
    developers: "Para desarrolladores",
    rights: "© {year} Santiago Gómez de la Torre. Todos los derechos reservados.",
  },
  notFound: {
    eyebrow: "Error 404",
    heading: "Esta página",
    headingSerif: "se ha roto.",
    body: "Pero cada fragmento lleva a un sitio que sí existe. Elige uno o vuelve al inicio.",
    home: "Volver al inicio",
    map: "Ver el mapa completo",
    pages: "Páginas",
    machine: "Ficheros legibles por máquina",
    agents: "Para agentes",
    agentsBefore: "El mismo mapa en markdown. Pidiendo",
    agentsAfter: " se recibe solo esto, sin el HTML.",
    markdownRegion: "Mapa del sitio en markdown, desplazable",
  },
  // 404 como experiencia: los fragmentos del cristal roto, cada uno un enlace real.
  lost: {
    here: "Estás aquí, fuera del mapa",
    pause: "Pausar movimiento",
    resume: "Reanudar movimiento",
    group: "Fragmentos que llevan a páginas del sitio",
    shard: {
      home: "Inicio",
      about: "Sobre mí",
      work: "Proyectos",
      openSource: "Open source",
      contact: "Contacto",
      developers: "Developers",
      agents: "Para agentes",
    },
  },
  // Preguntas frecuentes de /contact. Son las del JSON-LD (FAQPage) de esa
  // página: cada respuesta repite lo que /contact ya dice en su texto, no añade
  // ninguna afirmación nueva.
  contactFaq: {
    availability: {
      q: "¿Está Santiago disponible para nuevos proyectos?",
      a: "Sí. Está abierto a freelance y a colaboraciones seleccionadas de IA/LLM y full-stack. Si el encargo requiere equipo, contrato y continuidad, lo natural es canalizarlo por SkyQuetz Consulting, la consultora que cofundó.",
    },
    engagement: {
      q: "¿Trabaja como freelance o solo por cuenta ajena?",
      a: "Hoy es developer en Evenbytes y está abierto a freelance y a colaboraciones seleccionadas. Los encargos que necesitan un equipo, un contrato y continuidad se canalizan por SkyQuetz Consulting, la consultora de software a medida que cofundó.",
    },
    timezone: {
      q: "¿En qué zona horaria trabaja y en qué idiomas?",
      a: "Trabaja en remoto desde Santander, Cantabria (España), en horario europeo (CET/CEST), y responde en español o en inglés.",
    },
    reach: {
      q: "¿Cómo se contacta con Santiago?",
      a: "Por email en contact@sgomez.dev, la vía preferente para propuestas de trabajo. También está en LinkedIn (linkedin.com/in/sgomez-dev) y en GitHub (github.com/sgomez-dev). La web no tiene formulario de contacto.",
    },
  },
} as const;

export default es;
