'use client'

import HeroSection from './components/HeroSection'
import AboutSection from './components/AboutSection'
import ProjectsSection from './components/ProjectsSection'
import EducationSection from './components/EducationSection'
import ExperienceSection from './components/ExperienceSection'
import RecommendationsSection from './components/RecommendationsSection'
import ContactSection from './components/ContactSection'
import PlaygroundButton from './components/PlaygroundButton'

export default function HomePage() {
  return (
    <div className="scroll-smooth text-white relative">
      {/* Overlay de gradiente sutil */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-950/20 via-transparent to-purple-950/20 pointer-events-none" />
      
      <div className="relative z-10">
        <HeroSection />
        <AboutSection />
        <ExperienceSection />
        <ProjectsSection />
        <RecommendationsSection />
        <EducationSection />
        <ContactSection />
        <PlaygroundButton />
      </div>
    </div>
  )
}
