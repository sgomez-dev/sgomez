import type { Metadata } from 'next'
import { localizedPath, type Lang } from '@/i18n/languages'
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

// La home publica su propia variante markdown: el resto de páginas lo
// declara `pageMetadata`, y sin esto la única página que no lo anunciaría
// sería justo la que más se visita.
export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params
  const home = localizedPath(lang, '/')
  return {
    alternates: {
      canonical: home,
      languages: { 'es-ES': '/', en: '/en', 'x-default': '/' },
      types: { 'text/markdown': lang === 'es' ? '/index.md' : '/en.md' },
    },
  }
}

export default async function HomePage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params
  return (
    <div className="text-white">
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
