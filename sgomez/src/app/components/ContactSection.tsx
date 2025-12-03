'use client'

import { motion } from 'framer-motion'
import { contactLinks } from '../content'

export default function ContactSection() {
  const socialIcons: { [key: string]: string } = {
    'LinkedIn': '💼',
    'GitHub': '🐙',
    'Instagram': '📸',
    'Facebook': '👥'
  }
  
  return (
    <section id="contact" className="min-h-screen flex flex-col justify-center py-20 relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="container-custom text-center relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          className="inline-block mb-6"
        >
          <div className="text-6xl animate-float">📬</div>
        </motion.div>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">Conectemos</h2>
        <p className="text-gray-400 mb-12 text-lg max-w-2xl mx-auto">Siempre abierto a nuevas oportunidades y colaboraciones. ¡Hablemos!</p>
        
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {contactLinks.map((link, i) => (
            <motion.a 
              key={i} 
              href={link.url} 
              target="_blank"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-slate-800 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-3 border border-slate-700 hover:border-blue-500"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{socialIcons[link.label]}</span>
              <span>{link.label}</span>
            </motion.a>
          ))}
        </div>
        
        {/* Email directo */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md mx-auto"
        >
          <div className="text-3xl mb-3">✉️</div>
          <p className="text-gray-400 text-sm mb-2">O envíame un email directamente</p>
          <a href="mailto:santiago@example.com" className="text-blue-400 hover:text-blue-300 font-mono text-lg">
            santiago@example.com
          </a>
        </motion.div>
      </div>
    </section>
  )
}
