export const myProjects = [
  {
    id: 1,
    title: "Homepage Server",
    description:
      "Esta es una página web en la cual se puede ver uno de mis proyectos más desarrollados. En esta misma, se pueden ver todos los servicios que tengo en mi servidor en casa.",
    subDescription: [
      "Built a scalable application with ASP.NET Core MVC, integrating global platforms like Amazon for domestic delivery.",
      "Implemented secure authentication and database management using ASP.NET Core Identity and Entity Framework Core.",
      "Designed a responsive frontend with Tailwind CSS, enhancing user experience.",
      "Added payment systems, localization, and product filtering for functionality improvements.",
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
      "Integrated Auth0 for authentication, supporting OAuth, JWT, and multi-factor authentication.",
      "Implemented role-based access control (RBAC) for fine-grained user permissions.",
      "Developed a React-based frontend with Tailwind CSS for a sleek user experience.",
      "Connected to a secure SQLite database for user data storage.",
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
      "Developed a fully interactive Single Page Application (SPA) using Blazor WebAssembly.",
      "Implemented API interactions using .NET Core for a robust backend.",
      "Designed responsive UI components with Tailwind CSS for an enhanced UX.",
      "Integrated SQLite for efficient client-side database storage.",
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
      "Built a powerful rendering engine using OpenGL and C++.",
      "Developed a physics engine with collision detection and particle effects.",
      "Implemented a scripting system for easy game customization.",
      "Optimized performance with multi-threading and efficient memory management.",
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
      "Developed a responsive WordPress theme using HTML5, CSS3, and JavaScript.",
      "Integrated Tailwind CSS for modern styling and UI enhancements.",
      "Optimized SEO and page speed using Vite.js for fast builds.",
      "Implemented custom widgets and plugin compatibility for extended functionality.",
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
    title: "LandingPage",
    description:
      "Esta página profesional ha sido cuidadosamente diseñada para representar quién soy como desarrollador. Los visitantes pueden explorar mi trabajo, descargar mi currículum y acceder a mis perfiles de redes sociales.",
    subDescription: [
      "Built using Blazor WebAssembly for a seamless SPA experience.",
      "Implemented video streaming with Azure Media Services.",
      "Added a quiz system with dynamic question generation and real-time grading.",
      "Integrated Stripe API for secure payment processing.",
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
    id: 7,
    title: "Skyzen",
    description:
      "Una aplicación meteorológica moderna construida con React y Vite que proporciona información meteorológica en tiempo real con una interfaz de usuario intuitiva. La aplicación presenta geolocalización automática y pronóstico meteorológico.",
    subDescription: [
      "Built using Blazor WebAssembly for a seamless SPA experience.",
      "Implemented video streaming with Azure Media Services.",
      "Added a quiz system with dynamic question generation and real-time grading.",
      "Integrated Stripe API for secure payment processing.",
    ],
    href: "https://packatrack.sgomez.dev",
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
    id: 8,
    title: "Budget App",
    description:
      "Una aplicación de gestión financiera para rastrear gastos, establecer presupuestos y supervisar saldos. Su interfaz minimalista proporciona gráficos y informes para un manejo eficiente de los gastos.",
    subDescription: [
      "Built using Blazor WebAssembly for a seamless SPA experience.",
      "Implemented video streaming with Azure Media Services.",
      "Added a quiz system with dynamic question generation and real-time grading.",
      "Integrated Stripe API for secure payment processing.",
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
    href: "https://www.hackerrank.com/profile/contacto185",
    icon: "/models/assets/socials/hackerrank.svg",
  },
];

export const experiences = [
  {
    title: "Desarrollador de software",
    place: "Evenbytes, Santa Cruz de Bezana, Cantabria, España",
    date: "Junio 2025 - Actualidad",
    contents: [
      "Desarrollador de software en Evenbytes, responsable de crear aplicaciones web utilizando Angular, Node.js, Firebase y Google Cloud, mientras colaboro con el equipo para diseñar soluciones escalables y centradas en el usuario.",
    ],
  },
  {
    title: "Organizador de Google Developer Group (GDG) Santander",
    place: "GDG, Santander, Cantabria, España",
    date: "Noviembre 2024 - Actualidad",
    contents: [
      "Organizador del Google Developers Group, responsable de organizar eventos para atraer a desarrolladores y entusiastas de la tecnología, mientras fomenta el intercambio de conocimientos dentro de la comunidad.",
    ],
  },
  {
    title: "Desarrollador Freelance",
    place: "Irma Romero Morales, Santander, Cantabria, España",
    date: "Febrero 2025 - Junio 2025",
    contents: [
      "Desarrollé una Aplicación Web Progresiva (PWA) llamada  EliteEstate - Manager para una empresa inmobiliaria, gestionando propiedades, citas y zonas. La app presenta una interfaz de usuario fácil de usar para el control de portafolio y agenda.",
    ],
  },
  {
    title: "Técnico de Soporte IT",
    place: "Universidad Europea del Atlántico, Santander, Cantabria, España",
    date: "Julio 2023 - Julio 2024",
    contents: [
      "Miembro del equipo de IT, responsable de implementar soluciones de infraestructura y brindar soporte técnico especializado para garantizar la eficiencia operativa y la estabilidad.",
    ],
  },
  {
    title: "Sysadmin & QA",
    place:
      "Fundación Universitaria Iberoamericana (FUNIBER), Santander, Cantabria, España",
    date: "Julio 2022 - Julio 2023",
    contents: [
      "Lideré soluciones de infraestructura, asegurando una integración fluida de sistemas. Gestioné el aseguramiento de la calidad del software (QA) para mantener los estándares del producto. Supervisé el mantenimiento de servidores y la gestión de proyectos del equipo para garantizar la fiabilidad y la alineación con los objetivos organizacionales.",
    ],
  },
  {
    title: "Equipo de Redacción de Correos y Guías",
    place:
      "Fundación Universitaria Iberoamericana (FUNIBER), Santander, Cantabria, España",
    date: "Septiembre 2021 - Julio 2022",
    contents: [
      "Como parte del Programa de Becas de FUNIBER, contribuí a la redacción y estructuración de guías para correos académicos e internacionales, enfocándome en la escritura y edición de comunicaciones y asegurando el cumplimiento de los estándares de correspondencia corporativa.",
    ],
  },
];
export const reviews = [
  {
    name: "Jack",
    username: "@jack",
    body: "I've never seen anything like this before. It's amazing. I love it.",
    img: "https://robohash.org/jack",
  },
  {
    name: "Jill",
    username: "@jill",
    body: "I don't know what to say. I'm speechless. This is amazing.",
    img: "https://robohash.org/jill",
  },
  {
    name: "John",
    username: "@john",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://robohash.org/john",
  },
  {
    name: "Alice",
    username: "@alice",
    body: "This is hands down the best thing I've experienced. Highly recommend!",
    img: "https://robohash.org/alice",
  },
  {
    name: "Bob",
    username: "@bob",
    body: "Incredible work! The attention to detail is phenomenal.",
    img: "https://robohash.org/bob",
  },
  {
    name: "Charlie",
    username: "@charlie",
    body: "This exceeded all my expectations. Absolutely stunning!",
    img: "https://robohash.org/charlie",
  },
  {
    name: "Dave",
    username: "@dave",
    body: "Simply breathtaking. The best decision I've made in a while.",
    img: "https://robohash.org/dave",
  },
  {
    name: "Eve",
    username: "@eve",
    body: "So glad I found this. It has changed the game for me.",
    img: "https://robohash.org/eve",
  },
];

export const bio = [
  "Soy Santiago Gómez de la Torre Romero, ingeniero informático apasionado con sólidos conocimientos en TI y desarrollo web. Mi trayectoria profesional se ha desarrollado mediante experiencia práctica en administración de sistemas (SysAdmin), TI y desarrollo de software, impulsado por una mentalidad autodidacta y un interés constante por dominar herramientas como React, Node.js y CI/CD. Desde 2021, formé parte del programa de becas FUNIBER y posteriormente me integré al programa PROFER en la Universidad Europea del Atlántico, donde perfeccioné mis conocimientos técnicos y fortalecí mis habilidades de colaboración en equipos orientados al desarrollo de software y soluciones tecnológicas.",
  "Así mismo, trabajo como desarrollador de software multidisciplinario creando aplicaciones innovadoras centradas en el usuario. Actualmente, me encuentro desempeñando el rol de desarrollador de software en Evenbytes, donde utilizo Angular, Node.js, Firebase y Google Cloud para construir soluciones escalables y de alto impacto. He participado en eventos como Hack2Progress, que me ha permitido mejorar mi capacidad para innovar y desempeñarme bajo presión. Como organizador de GDG Santander, contribuyo activamente a la comunidad tecnológica local. Uno de mis desafíos más gratificantes ha sido construir EliteEstate Manager, una aplicación de gestión de propiedades desarrollada en colaboración con la agente inmobiliaria Irma Romero Morales. Este proyecto real me permitió aplicar mis habilidades técnicas para crear una solución adaptada a la gestión de propiedades, citas y zonas, una experiencia que ha profundizado mi comprensión de ambas industrias.",
];
