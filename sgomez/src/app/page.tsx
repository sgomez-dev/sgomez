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

const INTERLUDE_STATS = {
  command: 'neofetch',
  output: `santiago@sgomez.dev
───────────────────────────
Role      Full-Stack Engineer (AI/LLM)
Focus     Shipping AI to production
Company   Evenbytes
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
      <footer className="py-8 text-center">
        <p className="text-gray-700 text-xs font-light">&copy; {new Date().getFullYear()} Santiago Gomez de la Torre Romero</p>
      </footer>
      <PlaygroundButton />
      <BottomBar />
      <DownloadCVButton />
    </div>
  )
}
