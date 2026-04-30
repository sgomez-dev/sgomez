'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const sections = [
  { id: 'hero', label: 'Inicio' },
  { id: 'about', label: 'Sobre mi' },
  { id: 'experience', label: 'Experiencia' },
  { id: 'technologies', label: 'Stack' },
  { id: 'projects', label: 'Proyectos' },
  { id: 'recommendations', label: 'Testimonios' },
  { id: 'contact', label: 'Contacto' },
]

export default function BottomBar() {
  const [activeSection, setActiveSection] = useState('hero')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000)
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2
      for (const section of sections) {
        const element = document.getElementById(section.id)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) { setActiveSection(section.id); break }
        }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => { clearTimeout(timer); window.removeEventListener('scroll', handleScroll) }
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) element.scrollIntoView({ behavior: 'smooth' })
  }

  if (!isVisible) return null

  return (
    <motion.nav initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50" aria-label="Navegacion principal">
      <div className="glass-strong rounded-full px-1.5 py-1.5 shadow-2xl shadow-black/40">
        <div className="flex items-center gap-0.5">
          {sections.map((section) => {
            const isActive = activeSection === section.id
            return (
              <button key={section.id} onClick={() => scrollToSection(section.id)}
                className={`relative px-2.5 sm:px-3 md:px-4 py-2 rounded-full text-[10px] sm:text-xs font-medium transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                aria-current={isActive ? 'true' : undefined}>
                {isActive && <motion.div layoutId="active-nav" className="absolute inset-0 bg-violet-600/80 rounded-full" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                <span className="relative z-10 hidden sm:inline">{section.label}</span>
                <span className="relative z-10 sm:hidden">{section.label.charAt(0)}</span>
              </button>
            )
          })}
          <span className="mx-0.5 h-4 w-px bg-white/10" aria-hidden="true" />
          <a href="https://blog.sgomez.dev" target="_blank" rel="noopener noreferrer"
            className="relative px-2.5 sm:px-3 md:px-4 py-2 rounded-full text-[10px] sm:text-xs font-medium text-gray-500 hover:text-gray-300 transition-all duration-300">
            <span className="relative z-10 hidden sm:inline">Blog ↗</span>
            <span className="relative z-10 sm:hidden">B</span>
          </a>
        </div>
      </div>
    </motion.nav>
  )
}
