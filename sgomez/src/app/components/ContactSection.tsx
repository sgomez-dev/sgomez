'use client'

import { contactLinks } from '../content'

export default function ContactSection() {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center px-6 py-20">
      <h2 className="text-5xl font-bold mb-8 gradient-text-primary">Contacto</h2>
      <p className="text-gray-300/80 mb-12 text-center text-lg font-light max-w-2xl leading-relaxed">Siempre abierto a nuevas oportunidades y colaboraciones.</p>
      <div className="flex flex-wrap justify-center gap-5">
        {contactLinks.map((link, i) => (
          <a 
            key={i} 
            href={link.url} 
            target="_blank" 
            className="group relative backdrop-blur-sm bg-gradient-to-r from-blue-600/90 to-purple-600/90 px-8 py-4 rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 border border-blue-400/20"
          >
            <span className="relative z-10 font-medium">{link.label}</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </a>
        ))}
      </div>
    </section>
  )
}
