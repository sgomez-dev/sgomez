import type { Metadata } from 'next'
import { localizedPath, type Lang } from '@/i18n/languages'
import Hero from '@/chapters/Hero'
import About from '@/chapters/About'
import Build from '@/chapters/Build'
import ProjectsSection from '../components/ProjectsSection'
import OpenSourceSection from '../components/OpenSourceSection'
import CertificationsSection from '../components/CertificationsSection'
import EducationSection from '../components/EducationSection'
import ExperienceSection from '../components/ExperienceSection'
import RecommendationsSection from '../components/RecommendationsSection'
import ContactSection from '../components/ContactSection'
import LatestPosts from '../components/LatestPosts'
import BottomBar from '../components/BottomBar'
import DownloadCVButton from '../components/DownloadCVButton'
import MacInterlude from '../components/MacInterlude'
import SkyQuetzSection from '../components/SkyQuetzSection'

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

const INTERLUDE_STATS = {
  command: 'neofetch',
  output: `santiago@sgomez.dev
───────────────────────────
Role      Full-Stack Engineer (AI/LLM)
Focus     Shipping AI to production
Company   Evenbytes
Venture   SkyQuetz Consulting (cofounder)
Location  Santander, Spain
Years     5+ in tech
Projects  20+ shipped
Certs     18+ earned
Stack     15+ technologies
Status    Available ✓`,
}

const INTERLUDE_PROJECTS = {
  command: 'ls ~/projects --sort=impact',
  output: `drwxr-xr-x  claude-canvas/          ★★★★★
drwxr-xr-x  EliteEstate-Manager/    ★★★★★
drwxr-xr-x  GeekLab/                ★★★★★
drwxr-xr-x  SyncCart/               ★★★★☆
drwxr-xr-x  Sortlab/               ★★★★☆
drwxr-xr-x  CorvexTalk.AI/         ★★★★☆
drwxr-xr-x  Packatrack/            ★★★☆☆
-rw-r--r--  ...and 35+ more repos`,
}

// Temporal: los capítulos 01-03 ya son bilingües; el resto sigue en español hasta las tareas 7-8.
export default async function HomePage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params
  return (
    <div className="text-white">
      <Hero lang={lang} />
      <About lang={lang} />
      <MacInterlude {...INTERLUDE_STATS} />
      <div className="section-divider" />
      <ExperienceSection />
      <div className="section-divider" />
      <SkyQuetzSection />
      <div className="section-divider" />
      <Build lang={lang} />
      <MacInterlude {...INTERLUDE_PROJECTS} />
      <div className="section-divider" />
      <ProjectsSection />
      <div className="section-divider" />
      <OpenSourceSection />
      <div className="section-divider" />
      <CertificationsSection />
      <div className="section-divider" />
      <RecommendationsSection />
      <div className="section-divider" />
      <EducationSection />
      <div className="section-divider" />
      <ContactSection />
      <div className="section-divider" />
      <LatestPosts />
      <BottomBar />
      <DownloadCVButton />
    </div>
  )
}

export const dynamicParams = false;
