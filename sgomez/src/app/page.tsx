import type { Metadata } from 'next'
import Link from 'next/link'
import HeroSection from './components/HeroSection'
import AboutSection from './components/AboutSection'
import TechnologiesSection from './components/TechnologiesSection'
import ProjectsSection from './components/ProjectsSection'
import OpenSourceSection from './components/OpenSourceSection'
import CertificationsSection from './components/CertificationsSection'
import EducationSection from './components/EducationSection'
import ExperienceSection from './components/ExperienceSection'
import RecommendationsSection from './components/RecommendationsSection'
import ContactSection from './components/ContactSection'
import LatestPosts from './components/LatestPosts'
import PlaygroundButton from './components/PlaygroundButton'
import BottomBar from './components/BottomBar'
import DownloadCVButton from './components/DownloadCVButton'
import MacInterlude from './components/MacInterlude'
import SkyQuetzSection from './components/SkyQuetzSection'

// La home publica su propia variante markdown: el resto de páginas lo
// declara `pageMetadata`, y sin esto la única página que no lo anunciaría
// sería justo la que más se visita.
export const metadata: Metadata = {
  alternates: {
    canonical: '/',
    languages: { 'es-ES': '/', 'x-default': '/' },
    types: { 'text/markdown': '/index.md' },
  },
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
  output: `drwxr-xr-x  EliteEstate-Manager/    ★★★★★
drwxr-xr-x  GeekLab/                ★★★★★
drwxr-xr-x  SyncCart/               ★★★★☆
drwxr-xr-x  Sortlab/               ★★★★☆
drwxr-xr-x  CorvexTalk.AI/         ★★★★☆
drwxr-xr-x  Packatrack/            ★★★☆☆
-rw-r--r--  ...and 35+ more repos`,
}

export default function HomePage() {
  return (
    <div className="text-white">
      <HeroSection />
      <div className="section-divider" />
      <AboutSection />
      <MacInterlude {...INTERLUDE_STATS} />
      <div className="section-divider" />
      <ExperienceSection />
      <div className="section-divider" />
      <SkyQuetzSection />
      <div className="section-divider" />
      <TechnologiesSection />
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
      {/* Pie con las páginas que no son anclas de la home. Hasta ahora la web
          era una sola página y estas cuatro no tenían desde dónde enlazarse:
          una página de privacidad que nadie enlaza es, a efectos de quien la
          busca, una página que no existe. El portal de desarrolladores va
          aquí por lo mismo. */}
      <footer className="py-10">
        <nav className="container-custom flex flex-wrap justify-center gap-x-6 gap-y-2 mb-5" aria-label="Enlaces del pie">
          <Link href="/about" className="text-gray-600 hover:text-violet-400 text-xs font-light transition-colors">Sobre mi</Link>
          <Link href="/contact" className="text-gray-600 hover:text-violet-400 text-xs font-light transition-colors">Contacto</Link>
          <Link href="/developers" className="text-gray-600 hover:text-violet-400 text-xs font-light transition-colors">Developers &amp; API</Link>
          <Link href="/privacy" className="text-gray-600 hover:text-violet-400 text-xs font-light transition-colors">Privacidad</Link>
          <a href="/llms.txt" className="text-gray-600 hover:text-violet-400 text-xs font-light transition-colors">llms.txt</a>
          <a href="/openapi.json" className="text-gray-600 hover:text-violet-400 text-xs font-light transition-colors">OpenAPI</a>
        </nav>
        <p className="text-gray-700 text-xs font-light text-center">&copy; {new Date().getFullYear()} Santiago Gomez de la Torre Romero</p>
      </footer>
      <PlaygroundButton />
      <BottomBar />
      <DownloadCVButton />
    </div>
  )
}
