import type { Metadata } from 'next'
import type { Lang } from '@/i18n/languages'
import { IDENTITY } from '@/app/seo'
import { JsonLd } from '@/lib/seo/JsonLdScript'
import { pageGraph } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'
import Hero from '@/chapters/Hero'
import About from '@/chapters/About'
import Build from '@/chapters/Build'
import Experience from '@/chapters/Experience'
import Projects from '@/chapters/Projects'
import OpenSource from '@/chapters/OpenSource'
import SkyQuetz from '@/chapters/SkyQuetz'
import Proof from '@/chapters/Proof'
import LatestPosts from '@/chapters/LatestPosts'
import Contact from '@/chapters/Contact'

// Título y descripción de la home en cada idioma. Antes los dos idiomas salían
// con el texto inglés del layout; ahora cada uno lleva el suyo.
const HOME_META = {
  es: {
    title: `${IDENTITY.name} — Full-Stack Engineer que lleva la IA a producción`,
    description:
      'Full-stack engineer que lleva la IA y los LLM a producción. Cofundador de SkyQuetz Consulting, creador de NudaUI (más de 1.000 componentes) y de una búsqueda semántica (RAG) en vivo. React, Next.js, Node.js, Python, Google Cloud.',
  },
  en: {
    title: `${IDENTITY.name} — Full-Stack Engineer shipping AI to production`,
    description:
      'Full-stack engineer building and shipping AI/LLM features to production. Co-founder of SkyQuetz Consulting, creator of NudaUI (1,000+ components) and a live semantic search (RAG). React, Next.js, Node.js, Python, Google Cloud.',
  },
} as const

// La home publica su propia variante markdown, su hreflang y su Open Graph con
// el mismo `buildMetadata` que el resto de páginas.
export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params
  return buildMetadata({ lang, path: '/', ...HOME_META[lang] })
}

export default async function HomePage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params
  return (
    <div className="text-white">
      {/* El único @graph de la home: la home es el ProfilePage de la persona. */}
      <JsonLd
        data={pageGraph({
          lang,
          path: '/',
          title: `${IDENTITY.name} — Full-Stack Engineer (AI/LLM)`,
          description: HOME_META[lang].description,
          type: 'ProfilePage',
        })}
      />
      <Hero lang={lang} />
      <About lang={lang} />
      <Build lang={lang} />
      <Experience lang={lang} />
      <Projects lang={lang} />
      <OpenSource lang={lang} />
      <SkyQuetz lang={lang} />
      <Proof lang={lang}>
        <LatestPosts lang={lang} />
      </Proof>
      <Contact lang={lang} />
    </div>
  )
}

export const dynamicParams = false;
