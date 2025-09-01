export const myProjects = [
  {
    id: 1,
    title: "Homepage Server",
    description:
      "Esta es una página web en la cual se puede ver uno de mis proyectos más desarrollados. En esta misma, se pueden ver todos los servicios que tengo en mi servidor en casa.",
    subDescription: [
      "Servicio alojado en mi servidor que muestra mi homelab.",
      "Incluye visualización del entorno, servicios y configuraciones que mantengo activos.",
      "No fue desarrollado por mí, pero está configurado y desplegado en mi infraestructura personal.",
      "Disponible en https://home.sgomez.dev",
    ],
    href: "https://home.sgomez.dev",
    image: "/models/assets/projects/homepage.png",
    tags: [
      {
        id: 1,
        name: "Homelab",
        path: "/models/assets/logos/server.png",
      },
      {
        id: 2,
        name: "Jenkins",
        path: "/models/assets/logos/jenkins.svg",
      },
      {
        id: 3,
        name: "Kubernetes",
        path: "/models/assets/logos/kubernetes.svg",
      },
      {
        id: 4,
        name: "Docker",
        path: "/models/assets/logos/docker.svg",
      },
    ],
  },
  {
    id: 2,
    title: "EliteEstate - Manager",
    description:
      "Aplicación web progresiva (PWA) para profesionales inmobiliarios para gestionar propiedades, citas y áreas de manera eficiente. Interfaz moderna y responsive para el control de portafolio y agenda.",
    subDescription: [
      "PWA para gestión inmobiliaria con catálogo de propiedades, citas y zonas.",
      "Integración con Firebase (Authentication, Firestore, Storage) para datos en tiempo real y autenticación segura.",
      "Implementación de notificaciones push, calendario interactivo (FullCalendar) y gráficos estadísticos (Chart.js).",
      "Frontend desarrollado en React + Vite con TailwindCSS para una interfaz moderna y responsive.",
    ],
    href: "https://elite-estate-manager.vercel.app/",
    image: "/models/assets/projects/EliteEstateManager.png",
    tags: [
      {
        id: 1,
        name: "React",
        path: "/models/assets/logos/react.svg",
      },
      {
        id: 2,
        name: "Vite",
        path: "/models/assets/logos/vitejs.svg",
      },
      {
        id: 3,
        name: "Firebase",
        path: "/models/assets/logos/firebase.svg",
      },
      {
        id: 4,
        name: "TailwindCSS",
        path: "/models/assets/logos/tailwindcss.svg",
      },
      {
        id: 5,
        name: "JavaScript",
        path: "/models/assets/logos/javascript.svg",
      },
    ],
  },
  {
    id: 3,
    title: "Portafolio Profesional",
    description:
      "Un portfolio profesional que muestra habilidades, proyectos y experiencia con un diseño moderno. Incluye introducción, proyectos, habilidades y experiencia, utilizando React para la interacción.",
    subDescription: [
      "SPA interactiva desarrollada con Next.js y React para mostrar proyectos, habilidades y experiencia.",
      "Animaciones fluidas con Framer Motion para mejorar la experiencia del usuario.",
      "Diseño responsive con TailwindCSS optimizado para dispositivos móviles y escritorio.",
      "Integración de secciones dinámicas para proyectos, habilidades técnicas, trayectoria laboral y educación.",
    ],
    href: "https://portfolio.sgomez.dev",
    logo: "",
    image: "/models/assets/projects/portfolio.png",
    tags: [
      {
        id: 1,
        name: "React",
        path: "/models/assets/logos/react.svg",
      },
      {
        id: 2,
        name: "NextJs",
        path: "/models/assets/logos/nextjs.svg",
      },
      {
        id: 3,
        name: "Framer Motion",
        path: "/models/assets/logos/framer-motion.svg",
      },
      {
        id: 4,
        name: "TailwindCSS",
        path: "/models/assets/logos/tailwindcss.svg",
      },
    ],
  },
  {
    id: 4,
    title: "Docs - SGOMEZ",
    description:
      "Repositorio visual de documentación que presenta un stack tecnológico personalizado, organizado por categorías mediante una interfaz de temática galáctica, con contenido estructurado y navegación intuitiva.",
    subDescription: [
      "Sitio web de documentación visual que organiza mis conocimientos en frontend, backend, bases de datos y más.",
      "Interfaz temática (galáctica) para una navegación intuitiva entre categorías técnicas.",
      "Estructura categorizada que facilita la exploración de contenidos por áreas de conocimiento.",
      "Diseño responsive para una experiencia accesible desde cualquier dispositivo.",
    ],
    href: "https://docs.sgomez.dev",
    logo: "",
    image: "/models/assets/projects/docs.png",
    tags: [
      {
        id: 1,
        name: "React",
        path: "/models/assets/logos/react.svg",
      },
      {
        id: 2,
        name: "Vite",
        path: "/models/assets/logos/vitejs.svg",
      },
      {
        id: 3,
        name: "TailwindCSS",
        path: "/models/assets/logos/tailwindcss.svg",
      },
      {
        id: 4,
        name: "Framer Motion",
        path: "/models/assets/logos/framer-motion.svg",
      },
    ],
  },
  {
    id: 5,
    title: "Sortlab",
    description:
      "SortLab combina animaciones dinámicas con explicaciones estructuradas para desmontar la lógica algorítmica, ofreciendo a los usuarios una comprensión práctica de la eficiencia, la implementación y las aplicaciones reales de las técnicas de ordenación.",
    subDescription: [
      "Visualizador interactivo de 15 algoritmos de ordenamiento con animaciones en tiempo real.",
      "Desarrollado en React con TypeScript y navegación mediante React Router.",
      "Interfaz moderna con Material-UI, diseño glassmorphism y tema oscuro.",
      "Animaciones fluidas con Framer Motion y controles para velocidad y tamaño de arrays.",
    ],
    href: "https://sortlab.sgomez.dev",
    image: "/models/assets/projects/sortlab.png",
    tags: [
      {
        id: 1,
        name: "React",
        path: "/models/assets/logos/react.svg",
      },
      {
        id: 2,
        name: "TypeScript",
        path: "/models/assets/logos/typescript.svg",
      },
      {
        id: 3,
        name: "Framer Motion",
        path: "/models/assets/logos/framer-motion.svg",
      },
      {
        id: 4,
        name: "TailwindCSS",
        path: "/models/assets/logos/tailwindcss.svg",
      },
    ],
  },
  {
    id: 6,
    title: "sgomez CLI",
    description:
      "sgomez CLI es un asistente de línea de comandos que acelera la creación de proyectos frontend y backend, integrando frameworks y herramientas en una estructura lista para usar.",
    subDescription: [
      "CLI interactivo para inicializar proyectos frontend y backend en segundos.",
      "Compatible con React (Vite), Next.js, Angular, Node.js, NestJS, Django y Go.",
      "Soporte opcional para Tailwind CSS v4 y animaciones con Framer Motion.",
      "Asistente paso a paso que configura frameworks, lenguajes y licencias automáticamente.",
    ],
    href: "https://www.npmjs.com/package/sgomez-cli",
    image: "/models/assets/projects/sgomez-cli.png",
    tags: [
      {
        id: 1,
        name: "Node.js",
        path: "/models/assets/logos/nodejs.svg",
      },
    ],
  },
  {
    id: 7,
    title: "LandingPage",
    description:
      "Esta página profesional ha sido cuidadosamente diseñada para representar quién soy como desarrollador. Los visitantes pueden explorar mi trabajo, descargar mi currículum y acceder a mis perfiles de redes sociales.",
    subDescription: [
      "Landingpage minimalista desarrollado con React para mostrar habilidades, proyectos y experiencia.",
      "Diseño responsive con CSS para adaptarse a cualquier dispositivo.",
      "Incluye sección de servicios, descarga de CV y enlaces directos a redes sociales.",
      "Optimizado para una navegación clara y una experiencia de usuario fluida.",
    ],
    href: "https://landing.sgomez.dev",
    image: "/models/assets/projects/landing.png",
    tags: [
      {
        id: 1,
        name: "React",
        path: "/models/assets/logos/react.svg",
      },
    ],
  },
  {
    id: 8,
    title: "Skyzen",
    description:
      "Una aplicación meteorológica moderna construida con React y Vite que proporciona información meteorológica en tiempo real con una interfaz de usuario intuitiva. La aplicación presenta geolocalización automática y pronóstico meteorológico.",
    subDescription: [
      "Aplicación web de clima en tiempo real desarrollada con React y Vite.",
      "Incluye geolocalización automática, búsqueda y guardado de múltiples ubicaciones.",
      "Pronóstico detallado para varios días y persistencia de datos con localStorage.",
      "Interfaz moderna con TailwindCSS y animaciones suaves con Framer Motion.",
    ],
    href: "https://skyzen.sgomez.dev",
    image: "/models/assets/projects/skyzen.png",
    tags: [
      {
        id: 1,
        name: "React",
        path: "/models/assets/logos/react.svg",
      },
      {
        id: 2,
        name: "TailwindCSS",
        path: "/models/assets/logos/tailwindcss.svg",
      },
      {
        id: 3,
        name: "Framer Motion",
        path: "/models/assets/logos/framer-motion.svg",
      },
    ],
  },
  {
    id: 9,
    title: "Budget App",
    description:
      "Una aplicación de gestión financiera para rastrear gastos, establecer presupuestos y supervisar saldos. Su interfaz minimalista proporciona gráficos y informes para un manejo eficiente de los gastos.",
    subDescription: [
      "Aplicación de administración financiera para gestionar ingresos y gastos.",
      "Incluye registro de transacciones, balance actualizado y categorización de gastos.",
      "Alertas cuando se alcanza el límite presupuestario.",
      "Desarrollada en React con Context API para manejo de estado global.",
    ],
    href: "https://budget.sgomez.dev",
    image: "/models/assets/projects/budget.png",
    tags: [
      {
        id: 1,
        name: "React",
        path: "/models/assets/logos/react.svg",
      },
      {
        id: 2,
        name: "Vite",
        path: "/models/assets/logos/vitejs.svg",
      },
      {
        id: 3,
        name: "TailwindCSS",
        path: "/models/assets/logos/tailwindcss.svg",
      },
    ],
  },
];

export const mySocials = [
  {
    name: "github",
    href: "https://github.com/sgomez-dev",
    icon: "/models/assets/socials/github.svg",
  },
  {
    name: "Linkedin",
    href: "https://www.linkedin.com/in/sgomez-dev/",
    icon: "/models/assets/socials/linkedIn.svg",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/santigt1503",
    icon: "/models/assets/socials/instagram.svg",
  },
  {
    name: "Hackerrank",
    href: "https://www.hackerrank.com/profile/sgomezDev",
    icon: "/models/assets/socials/hackerrank.svg",
  },
  {
    name: "StackOverflow",
    href: "https://stackoverflow.com/users/31330047/santiago-gómez-de-la-torre?tab=profile",
    icon: "/models/assets/socials/stack-overflow.svg",
  },
];

export const experiences = [
  {
    title: "Desarrollador de software",
    place: "Evenbytes, Santa Cruz de Bezana, Cantabria, España",
    date: "Junio 2025 - Actualidad",
    contents: [
      "Actualmente trabajo como desarrollador de software en Evenbytes, donde soy responsable del diseño, desarrollo y mantenimiento de aplicaciones web robustas y escalables. Trabajo principalmente con Angular en el frontend para crear interfaces interactivas y responsivas, y con Node.js en el backend para construir APIs eficientes y seguras.",
      "Utilizo Firebase para servicios generales y complementarios, pero la gestión principal de bases de datos y autenticación la realizo con Google Cloud Platform, aprovechando Datastore para el almacenamiento estructurado y el sistema de autenticación integrado de GCP para garantizar seguridad y escalabilidad.",
      "Mi rol implica colaboración cercana con arquitectos de software, product managers y otros desarrolladores para diseñar soluciones centradas en el usuario, asegurando una experiencia fluida e intuitiva. Participo en la planificación técnica de proyectos, aplico buenas prácticas de desarrollo y código limpio, y contribuyo a la mejora continua de los procesos para optimizar tiempos y resultados.",
    ],
  },
  {
    title: "Organizador de Google Developer Group (GDG) Santander",
    place: "GDG, Santander, Cantabria, España",
    date: "Noviembre 2024 - Actualidad",
    contents: [
      "Como organizador del Google Developer Group (GDG) en Santander, lidero la planificación y ejecución de eventos y actividades orientadas a la comunidad tecnológica local. Mi objetivo principal es fomentar la colaboración, el aprendizaje y la innovación entre desarrolladores, estudiantes y profesionales interesados en la tecnología y el ecosistema open source.",
      "Me encargo de coordinar charlas y talleres, trabajando con ponentes expertos para asegurar contenido relevante y de calidad. También gestiono la promoción de eventos a través de redes sociales y plataformas digitales, logrando aumentar la participación y el alcance de la comunidad.",
    ],
  },
  {
    title: "Desarrollador Freelance",
    place: "Irma Romero Morales, Santander, Cantabria, España",
    date: "Febrero 2025 - Junio 2025",
    contents: [
      "Durante este período, trabajé como desarrollador freelance para Irma Romero Morales, llevando a cabo el desarrollo completo de una Aplicación Web Progresiva (PWA) llamada EliteEstate - Manager, destinada a la gestión eficiente de propiedades inmobiliarias. La aplicación fue diseñada para cubrir las necesidades específicas de la empresa inmobiliaria, permitiendo la administración de zonas, propiedades y citas con clientes desde una interfaz intuitiva y moderna.",
      "Me encargué del diseño, desarrollo y despliegue del proyecto utilizando tecnologías web modernas, asegurando que la aplicación fuera responsiva, accesible y fácil de usar tanto para agentes inmobiliarios como para administradores. Implementé funcionalidades clave como la gestión de múltiples zonas geográficas, manejo detallado de propiedades con atributos personalizados, control de agendas para citas, y un sistema eficiente para visualizar el portafolio de propiedades.",
      "Este proyecto fortalecí mis habilidades en desarrollo full stack, gestión de proyectos y atención al cliente, además de aportar experiencia en la creación de aplicaciones PWA enfocadas en el sector inmobiliario.",
    ],
  },
  {
    title: "Técnico de Soporte IT",
    place: "Universidad Europea del Atlántico, Santander, Cantabria, España",
    date: "Julio 2023 - Julio 2024",
    contents: [
      "Formé parte del equipo de Tecnologías de la Información de la Universidad Europea del Atlántico, donde fui responsable de proporcionar soporte técnico integral para garantizar la operatividad y eficiencia de los sistemas informáticos en toda la institución. Mi labor abarcó desde la resolución de incidencias diarias, asistencia a usuarios y mantenimiento preventivo, hasta la implementación y mejora de infraestructuras tecnológicas.",
      "Mi enfoque principal fue mantener la continuidad operativa del campus tecnológico, atendiendo de manera ágil y efectiva las necesidades del personal académico y administrativo. También elaboré documentación técnica y manuales de usuario para facilitar la resolución autónoma de problemas recurrentes.",
      "Esta experiencia me permitió consolidar mis habilidades en soporte técnico, trabajo en equipo y gestión de sistemas, además de desarrollar una orientación clara hacia la satisfacción del usuario final y la mejora continua en ambientes académicos.",
    ],
  },
  {
    title: "Sysadmin & QA",
    place:
      "Fundación Universitaria Iberoamericana (FUNIBER), Santander, Cantabria, España",
    date: "Julio 2022 - Julio 2023",
    contents: [
      "Durante mi tiempo en FUNIBER, desempeñé un rol clave como administrador de sistemas (Sysadmin) y responsable de aseguramiento de la calidad (QA), donde lideré la gestión de la infraestructura tecnológica para garantizar su óptimo rendimiento y disponibilidad. Me encargué de la supervisión y mantenimiento de servidores, redes y servicios internos, asegurando una operación estable y segura para soportar las actividades académicas y administrativas.",
      "Además, coordiné la planificación y ejecución de proyectos tecnológicos dentro del equipo, alineando objetivos técnicos con las metas organizacionales. Participé en la documentación y automatización de procesos para optimizar la gestión del entorno TI.",
      "Esta experiencia fortaleció mis competencias técnicas en administración de sistemas y calidad de software, así como mis habilidades en liderazgo, comunicación y gestión de proyectos en entornos colaborativos.",
    ],
  },
  {
    title: "Equipo de Redacción de Correos y Guías",
    place:
      "Fundación Universitaria Iberoamericana (FUNIBER), Santander, Cantabria, España",
    date: "Septiembre 2021 - Julio 2022",
    contents: [
      "Formé parte del equipo encargado de la redacción, revisión y estructuración de guías y correos académicos e internacionales dentro del Programa de Becas de FUNIBER. Mi labor principal consistió en crear comunicaciones claras, formales y adecuadas a diferentes contextos académicos y culturales, garantizando que cumplieran con los estándares de correspondencia corporativa y las mejores prácticas de comunicación escrita.",
      "Colaboré estrechamente con otros miembros del equipo para asegurar la coherencia y calidad de los textos, adaptando mensajes para diferentes públicos y objetivos. Además, participé en la actualización y mejora continua de las guías, incorporando feedback y tendencias en comunicación institucional.",
      "Esta experiencia me permitió desarrollar habilidades avanzadas en redacción profesional, atención al detalle y trabajo en equipo, además de profundizar en la gestión documental y la comunicación corporativa en entornos educativos.",
    ],
  },
];

export const certifications = [
  {
    title: "Software Engineer Intern",
    company: "HackerRank",
    date: "Septiembre 2025",
    img: "/models/assets/certifications/hackerrank.png",
    url: "https://drive.google.com/file/d/1IXV7yxijNfycqqqMvovNXFZMOV6fjJkK/view?usp=sharing",
  },
  {
    title: "McKensey.org Forward Program",
    company: "McKensey.org",
    date: "Julio 2025",
    img: "/models/assets/certifications/mckinsey.png",
    url: "https://drive.google.com/file/d/1hbWX1oyBi8zUXPsgUtvgZ8ueekno31pz/view?usp=sharing",
  },
  {
    title: "Angular (basic)",
    institution: "HackerRank",
    date: "Junio 2025",
    img: "/models/assets/certifications/hackerrank.png",
    url: "https://drive.google.com/file/d/1DqpO9M0GigJT43VKkulbZuwKg6-HT1Ab/view?usp=sharing",
  },
  {
    title: "Software Engineer",
    institution: "HackerRank",
    date: "Mayo 2025",
    img: "/models/assets/certifications/hackerrank.png",
    url: "https://drive.google.com/file/d/10MHq7lyYelaamoLLJhwOc_BVsdtK3qQ4/view?usp=sharing",
  },
  {
    title: "Frontend Developer (React)",
    institution: "HackerRank",
    date: "Mayo 2025",
    img: "/models/assets/certifications/hackerrank.png",
    url: "https://drive.google.com/file/d/1CQH076Ss81QmlBZJ9wSyvOx7HTk-gK-y/view?usp=sharing",
  },
  {
    title: "SCHNEIDER ELECTRIC Hackathon 2025 - IT Challenge",
    institution: "NUWE",
    date: "Abril 2025",
    img: "/models/assets/certifications/nuwe.png",
    url: "https://drive.google.com/file/d/15L_2k12CsYcxovvqJzgoC56p05Ypz-xC/view?usp=sharing",
  },
  {
    title: "Master en JavaScript 2025: Aprender JS, Angular, Node, Astro",
    institution: "Udemy",
    date: "Marzo 2025",
    img: "/models/assets/certifications/udemy.png",
    url: "https://drive.google.com/file/d/10FqgAblTBp76CKhc31ZnV0LW-D3kkXuB/view?usp=sharing",
  },
  {
    title: "The Web Developer Bootcamp 2025",
    institution: "Udemy",
    date: "Marzo 2025",
    img: "/models/assets/certifications/udemy.png",
    url: "https://drive.google.com/file/d/1XQsTwo88A7isHT2pSBEuoNTFjYhzY81j/view?usp=sharing",
  },
  {
    title: "Azure DevOps: Flujos de CI/CD",
    institution: "Platzi",
    date: "Marzo 2025",
    img: "/models/assets/certifications/platzi.png",
    url: "https://drive.google.com/file/d/1pcAssPwA5b3rep77kcW8azReUbFYXzC9/view?usp=sharing",
  },
  {
    title: "Certificado de Participación Hack2Progress",
    institution: "CIC Consulting Informático",
    date: "Marzo 2025",
    img: "/models/assets/certifications/cic.png",
    url: "https://drive.google.com/file/d/14IbZJ8hqiM2lUPb1YBftxyfgWTB6jK-d/view?usp=sharing",
  },
  {
    title: "Machine Learning y Data Science",
    institution: "Udemy",
    date: "Marzo 2025",
    img: "/models/assets/certifications/udemy.png",
    url: "https://drive.google.com/file/d/1isr8dB1w1pUFD4T704k2xI0R4rUrV_N4/view?usp=sharing",
  },
  {
    title: "Cómo incluir la sostenibilidad en tu estrategia de cloud computing",
    institution: "LinkedIn",
    date: "Marzo 2025",
    img: "/models/assets/certifications/linkedin.png",
    url: "https://drive.google.com/file/d/1JYMq9yOPD0qRMB4gB_Gy9SbZ3qo3ZVh8/view?usp=sharing",
  },
  {
    title: "Resolución de problemas con el pensamiento crítico",
    institution: "LinkedIn",
    date: "Marzo 2025",
    img: "/models/assets/certifications/linkedin.png",
    url: "https://drive.google.com/file/d/1G_RkQD-O23AEpnj_JKOEjJ2wYeFFFMXN/view?usp=sharing",
  },
  {
    title: "Prompt Engineering",
    institution: "LinkedIn",
    date: "Marzo 2025",
    img: "/models/assets/certifications/linkedin.png",
    url: "https://drive.google.com/file/d/1SegpNdQ74TAK6TrkJDaHNcjINyoXjXY1/view?usp=sharing",
  },
  {
    title: "Master en React",
    institution: "Udemy",
    date: "Diciembre 2024",
    img: "/models/assets/certifications/udemy.png",
    url: "https://drive.google.com/file/d/1woMqIXOjTDeTFTQXy2kdL33zgIMe4WYJ/view?usp=sharing",
  },
  {
    title: "Legacy Front End",
    institution: "freecodecamp",
    date: "Noviembre 2024",
    img: "/models/assets/certifications/freecodecamp.png",
    url: "https://drive.google.com/file/d/1ohmcttf7Ca81d_JhHg9sdReB1zHwaWqO/view?usp=sharing",
  },
  {
    title: "JavaScript Algorithms and Data Structures (Beta)",
    institution: "freecodecamp",
    date: "Noviembre 2024",
    img: "/models/assets/certifications/freecodecamp.png",
    url: "https://drive.google.com/file/d/1DGM402G6EroGk3meZJnBRufImBAnMNVn/view?usp=sharing",
  },
  {
    title: "Responsive Web Design",
    institution: "freecodecamp",
    date: "Noviembre 2024",
    img: "/models/assets/certifications/freecodecamp.png",
    url: "https://drive.google.com/file/d/1YFgrFhli2ruL2XrMhXtfYfsnCuwpDQBe/view?usp=sharing",
  },
  {
    title: "Front End Development Libraries",
    institution: "freecodecamp",
    date: "Noviembre 2024",
    img: "/models/assets/certifications/freecodecamp.png",
    url: "https://drive.google.com/file/d/1kUM-BD4FoJUl70jTpp-5UVhrCgotXh2n/view?usp=sharing",
  },
  {
    title: "Certificado de Participación",
    institution: "Universidad Europea del Atlantico",
    date: "Julio 2024",
    img: "/models/assets/certifications/uneatlantico.png",
    url: "https://drive.google.com/file/d/1wfl_0Dlw17CMrVMIq51I7Sgf5UPhd5Kz/view?usp=sharing",
  },
];

export const bio = [
  "Soy Santiago Gómez de la Torre Romero, ingeniero informático apasionado con sólidos conocimientos en TI y desarrollo web. Mi trayectoria profesional se ha desarrollado mediante experiencia práctica en administración de sistemas (SysAdmin), TI y desarrollo de software, impulsado por una mentalidad autodidacta y un interés constante por dominar herramientas como React, Node.js y CI/CD. Desde 2021, formé parte del programa de becas FUNIBER y posteriormente me integré al programa PROFER en la Universidad Europea del Atlántico, donde perfeccioné mis conocimientos técnicos y fortalecí mis habilidades de colaboración en equipos orientados al desarrollo de software y soluciones tecnológicas.",
  "Así mismo, trabajo como desarrollador de software multidisciplinario creando aplicaciones innovadoras centradas en el usuario. Actualmente, me encuentro desempeñando el rol de desarrollador de software en Evenbytes, donde utilizo Angular, Node.js, Firebase y Google Cloud para construir soluciones escalables y de alto impacto. He participado en eventos como Hack2Progress, que me ha permitido mejorar mi capacidad para innovar y desempeñarme bajo presión. Como organizador de GDG Santander, contribuyo activamente a la comunidad tecnológica local. Uno de mis desafíos más gratificantes ha sido construir EliteEstate Manager, una aplicación de gestión de propiedades desarrollada en colaboración con la agente inmobiliaria Irma Romero Morales. Este proyecto real me permitió aplicar mis habilidades técnicas para crear una solución adaptada a la gestión de propiedades, citas y zonas, una experiencia que ha profundizado mi comprensión de ambas industrias.",
];

export const recommendations = [
  {
    image:
      "https://media.licdn.com/dms/image/v2/D4E03AQE7VZNHvDOVLQ/profile-displayphoto-shrink_100_100/B4EZSGwQ6uGwAU-/0/1737427588690?e=1756339200&v=beta&t=CxO5h3SNv6cP8C_A2304JWT6fuP7lI8rsS0TdZtY5lc",
    name: "Irma Romero",
    date: "13 de abril de 2025",
    description:
      "Quiero recomendar ampliamente el trabajo de Santiago, quien desarrolló una aplicación a medida para mi empresa inmobiliaria. La app es muy amigable, fácil de usar y ha sido una herramienta clave para optimizar nuestros procesos internos, especialmente en la gestión de inventarios, citas y tareas administrativas. El servicio fue rápido, profesional y con una atención excelente en cada etapa del proceso.",
    url: "https://www.linkedin.com/in/sgomez-dev",
    profileRecommenderUrl: "https://www.linkedin.com/in/irma-romero-928a9b26/",
  },
  {
    image:
      "https://media.licdn.com/dms/image/v2/D4E03AQG2j3rsn_90-w/profile-displayphoto-shrink_100_100/B4EZVIOF0SHMAY-/0/1740673409279?e=1756339200&v=beta&t=2kHEMVL0xSmJx6fgqEc5J6XF9dZ6Bdf25pfeycG7jtg",
    name: "Alejandro Rubio Cao",
    date: "10 de abril de 2025",
    description: [
      "Tuve la oportunidad de trabajar con Santiago en varios proyectos durante nuestra carrera en Ingeniería Informática y dentro del programa de becas de la Universidad Europea del Atlántico, y siempre ha demostrado un gran talento y compromiso. Su capacidad para resolver problemas complejos y su enfoque analítico lo distinguen como un profesional destacado en el campo de la tecnología. ",
      "No tengo dudas de que su talento y dedicación serán un gran aporte en cualquier desafío que emprenda. Recomiendo a Santiago sin reservas para cualquier oportunidad en el ámbito de la informática.",
    ],
    url: "https://www.linkedin.com/in/sgomez-dev",
    profileRecommenderUrl:
      "https://www.linkedin.com/in/alejandro-rubio-cao-82b0181b5/",
  },
  {
    image:
      "https://media.licdn.com/dms/image/v2/D4D35AQHrxfiyQTRYAQ/profile-framedphoto-shrink_100_100/B4DZabtap5GwAs-/0/1746369096686?e=1755554400&v=beta&t=NVptUqFqOPrvGvXchusMslv8DLwCtiJgAAjUzgtLbhk",
    name: "Manuel Rondon",
    date: "26 de Marzo de 2025",
    description:
      "Tuve la fortuna de trabajar junto a Santiago al inicio de nuestras carreras y desde entonces destacaba su habilidad para adaptarse rapidamente a nuevos conceptos y tecnologías. Mas adelante tambien tuve la oportunidad de participar junto a él en el hackathon Hack2Progress 2025, en el cual demostró cuanto habia crecido su capacidad tecnica y que conservaba esa gran habilidad de adaptarse a cualquier entorno técnico de manera casi inmediata ha sido una pieza vital en nuestra participación y considero que sería una gran adición a cualquier equipo en el que se encuentre",
    url: "https://www.linkedin.com/in/sgomez-dev",
    profileRecommenderUrl:
      "https://www.linkedin.com/in/manuel-rondon-1b2816218/",
  },
  {
    image:
      "https://media.licdn.com/dms/image/v2/D4D03AQFm1Wit0e7oLg/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1673003659908?e=1756339200&v=beta&t=Zsfs4ntqyNKZMU5EHSWZ9mqqYezViidkYnpIzVTb_QI",
    name: "Edgar León Du Solier",
    date: "24 de Marzo de 2025",
    description:
      "Tuve el gusto de trabajar junto a Santiago en el área de administración de sistemas, acompañándolo en su proceso de formación. Desde el inicio demostró una gran capacidad para entender rápidamente conceptos técnicos complejos, destacándose especialmente por su velocidad de aprendizaje y la facilidad con la que adoptaba nuevos conocimientos. Su proactividad, acompañada de una notable habilidad para resolver problemas, hacen de él un excelente profesional en crecimiento. Sin duda, recomiendo a Santiago como una gran incorporación para cualquier equipo de trabajo",
    url: "https://www.linkedin.com/in/sgomez-dev",
    profileRecommenderUrl: "https://www.linkedin.com/in/edgarleond/",
  },
];

export const education = [
  {
    degree: "Grado en Ingeniería Informática",
    institution:
      "Universidad Europea del Atlántico, Santander, Cantabria, España",
    duration: "Septiembre 2021 - Junio 2026",
    description:
      "El Grado en Ingeniería Informática de la Universidad Europea del Atlántico prepara profesionales para resolver problemas de manera analítica y estratégica. En un panorama tecnológico en constante evolución, este programa equipa a los estudiantes para desempeñarse como pieza clave en la cadena de valor de las organizaciones, integrando la informática en la visión estratégica de las empresas y preparándolos para adaptarse a los cambios globales.",
  },
];
