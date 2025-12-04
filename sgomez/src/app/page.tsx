'use client'

import HeroSection from './components/HeroSection'
import AboutSection from './components/AboutSection'
import TechnologiesSection from './components/TechnologiesSection'
import ProjectsSection from './components/ProjectsSection'
import EducationSection from './components/EducationSection'
import ExperienceSection from './components/ExperienceSection'
import RecommendationsSection from './components/RecommendationsSection'
import ContactSection from './components/ContactSection'
import PlaygroundButton from './components/PlaygroundButton'
import BottomBar from './components/BottomBar'
import DownloadCVButton from './components/DownloadCVButton'

export default function HomePage() {
  return (
    <div className="scroll-smooth text-white">
      <HeroSection />
      <AboutSection />
      <ExperienceSection />
      <TechnologiesSection />
      <ProjectsSection />
      <RecommendationsSection />
      <EducationSection />
      <ContactSection />
      <PlaygroundButton />
      <BottomBar />
      <DownloadCVButton />
    </div>
  )
}
