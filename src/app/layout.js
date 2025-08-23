import "@/styles/globals.css";

export const metadata = {
  title: "Santiago Gómez de la Torre Romero Portfolio",
  description: "Frontend Developer especializado en React y Next.js. Desarrollador web con experiencia en proyectos frontend y habilidades técnicas. Portfolio profesional basado en Santander, España.",
  keywords: "desarrollador de software, devops, desarrollador frontend Santander, frontend developer Santander, desarrollador react, react developer, desarrollador nextjs, nextjs developer, portfolio desarrollador, developer portfolio, santiago gómez de la torre romero, web developer Santander, javascript developer, desarrollador javascript",
  authors: [{ name: "Santiago Gómez de la Torre Romero" }],
  creator: "Santiago Gómez de la Torre Romero",
  publisher: "Santiago Gómez de la Torre Romero",
  openGraph: {
    title: "Santiago Gómez de la Torre Romero | Frontend Developer en Santander | Portfolio",
    description: "Frontend Developer especializado en React y Next.js. Desarrollador web con experiencia en proyectos frontend y habilidades técnicas. Portfolio profesional basado en Santander, España.",
    type: "website",
    locale: "es_ES",
    siteName: "Santiago Gómez de la Torre Romero Portfolio",
    images: [
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
    title: "Santiago Gómez de la Torre Romero | Frontend Developer en Santander | Portfolio",
    description: "Frontend Developer especializado en React y Next.js. Desarrollador web con experiencia en proyectos frontend y habilidades técnicas. Portfolio profesional basado en Santander, España.",
    images: ['https://sgomez.dev/og-image.png'],
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

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/sgt.png" />
        <link rel="canonical" href="https://sgomez.dev" />
        <script type="application/ld+json">
          {`
          {
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Santiago Gómez de la Torre Romero",
            "url": "https://sgomez.dev",
            "jobTitle": "Frontend Developer",
            "worksFor": {
              "@type": "Organization",
              "name": "Santander"
            },
            "sameAs": [
              "https://linkedin.com/in/sgomez-dev",
              "https://github.com/sgomez-dev",
              "https://www.instagram.com/santigt1503/"
            ]
          }
          `}
        </script>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
