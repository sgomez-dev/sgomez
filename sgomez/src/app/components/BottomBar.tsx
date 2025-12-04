'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function BottomBar() {
  const [activeSection, setActiveSection] = useState('hero')

  const sections = [
    { id: 'hero', name: 'Inicio', icon: '🏠' },
    { id: 'about', name: 'Historia', icon: '📖' },
    { id: 'experience', name: 'Experiencia', icon: '💼' },
    { id: 'projects', name: 'Proyectos', icon: '🚀' },
    { id: 'technologies', name: 'Stack', icon: '⚡' },
    { id: 'recommendations', name: 'Recomendaciones', icon: '⭐' },
    { id: 'contact', name: 'Contacto', icon: '📧' },
  ]

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'about', 'experience', 'projects', 'technologies', 'recommendations', 'contact']
      const scrollPosition = window.scrollY + window.innerHeight / 2

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 1 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-full px-4 py-3 shadow-2xl">
        <div className="flex items-center gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`relative group transition-all duration-300 ${
                activeSection === section.id ? 'scale-110' : 'scale-100'
              }`}
              title={section.name}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  activeSection === section.id
                    ? 'bg-blue-600 shadow-lg shadow-blue-600/50'
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                <span className="text-lg">{section.icon}</span>
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {section.name}
              </div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
