export function generateMetadata(config) {
  return {
    title: config.title || "Santiago Gómez de la Torre Romero Portfolio",
    description: config.description || "Frontend Developer especializado en React y Next.js. Desarrollador web con experiencia en proyectos frontend y habilidades técnicas. Portfolio profesional basado en Santander, España.",
    keywords: config.keywords || "desarrollador de software, devops, desarrollador frontend Santander, frontend developer Santander, desarrollador react, react developer, desarrollador nextjs, nextjs developer, portfolio desarrollador, developer portfolio, santiago gómez de la torre romero, web developer Santander, javascript developer, desarrollador javascript",
    authors: config.authors || [{ name: "Santiago Gómez de la Torre Romero" }],
    creator: config.creator || "Santiago Gómez de la Torre Romero",
    publisher: config.publisher || "Santiago Gómez de la Torre Romero",
    openGraph: {
      title: config.openGraph?.title || "Santiago Gómez de la Torre Romero | Frontend Developer en Santander | Portfolio",
      description: config.openGraph?.description || "Frontend Developer especializado en React y Next.js. Desarrollador web con experiencia en proyectos frontend y habilidades técnicas. Portfolio profesional basado en Santander, España.",
      type: "website",
      locale: "es_ES",
      siteName: "Santiago Gómez de la Torre Romero Portfolio",
      images: config.openGraph?.images || [
        {
          url: 'https://sgomez.dev/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Santiago Gómez de la Torre Romero Portfolio',
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: config.twitter?.title || "Santiago Gómez de la Torre Romero | Frontend Developer en Santander | Portfolio",
      description: config.twitter?.description || "Frontend Developer especializado en React y Next.js. Desarrollador web con experiencia en proyectos frontend y habilidades técnicas. Portfolio profesional basado en Santander, España.",
      images: config.twitter?.images || ['https://sgomez.dev/og-image.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}
