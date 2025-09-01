import "@/styles/globals.css";

export const metadata = {
  metadataBase: new URL('https://sgomez.dev'),
  title: "Santiago Gómez de la Torre Romero Portfolio",
  description: "Frontend Developer especializado en React y Next.js. Desarrollador web con experiencia en proyectos frontend y habilidades técnicas. Portfolio profesional basado en Santander, España.",
  keywords: "desarrollador de software, devops, desarrollador frontend Santander, frontend developer Santander, desarrollador react, react developer, desarrollador nextjs, nextjs developer, portfolio desarrollador, developer portfolio, santiago gómez de la torre romero, web developer Santander, javascript developer, desarrollador javascript",
  authors: [{ name: "Santiago Gómez de la Torre Romero" }],
  creator: "Santiago Gómez de la Torre Romero",
  publisher: "Santiago Gómez de la Torre Romero",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: 'https://sgomez.dev',
  },
  openGraph: {
    title: "Santiago Gómez de la Torre Romero | Frontend Developer en Santander | Portfolio",
    description: "Frontend Developer especializado en React y Next.js. Desarrollador web con experiencia en proyectos frontend y habilidades técnicas. Portfolio profesional basado en Santander, España.",
    type: "website",
    locale: "es_ES",
    siteName: "Santiago Gómez de la Torre Romero Portfolio",
    url: "https://sgomez.dev",
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
    creator: '@sgomez_dev',
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
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || 'google-site-verification-code',
    // Add other verification codes as needed
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/sgt.png" />
        <link rel="canonical" href="https://sgomez.dev" />
        
        {/* Google Search Console verification */}
        <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GSC_VERIFICATION || 'google-site-verification-code'} />
        
        {/* Additional SEO meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {`
          {
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Santiago Gómez de la Torre Romero",
            "url": "https://sgomez.dev",
            "jobTitle": "Frontend Developer",
            "description": "Frontend Developer especializado en React y Next.js",
            "worksFor": {
              "@type": "Organization",
              "name": "Santander"
            },
            "sameAs": [
              "https://linkedin.com/in/sgomez-dev",
              "https://github.com/sgomez-dev",
              "https://www.instagram.com/santigt1503/"
            ],
            "knowsAbout": [
              "React", "Next.js", "JavaScript", "TypeScript", "Frontend Development", "Web Development"
            ],
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Santander",
              "addressCountry": "ES"
            }
          }
          `}
        </script>
        
        {/* Google Analytics */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'}`}></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'}', {
                page_title: 'Santiago Gómez Portfolio',
                page_location: window.location.href,
              });
            `,
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
