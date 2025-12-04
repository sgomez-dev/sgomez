'use client'

import { motion } from 'framer-motion'
import { projects } from '../content'

export default function ProjectsSection() {
  const projectIcons = ['🏠', '🏢', '💼', '📚', '🔬', '⚡', '🎯', '☁️', '💰']
  
  return (
    <section id="projects" className="min-h-screen flex flex-col justify-center py-20 relative">
      {/* Efecto de fondo */}
      <div className="absolute top-1/2 right-0 w-72 h-72 bg-blue-600/5 rounded-full blur-3xl" />
      
      <div className="container-custom relative z-10">
        <div className="flex items-center gap-4 mb-16">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            className="text-5xl"
          >
            🚀
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold text-white">Proyectos Destacados</h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p, i) => (
            <motion.a 
              key={i}
              href={p.link}
              target="_blank"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-blue-600/50 transition-all card-hover relative overflow-hidden"
            >
              {/* Efecto de brillo en hover */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-purple-600/20 transition-colors duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{projectIcons[i % projectIcons.length]}</div>
                  <div className="bg-slate-700 px-3 py-1 rounded-full text-xs text-blue-400 border border-blue-500/30">
                    Ver →
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">{p.title}</h3>
                <p className="text-gray-400 leading-relaxed mb-4 text-sm">{p.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {p.stack.split(',').map((tech, idx) => (
                    <span key={idx} className="text-xs text-gray-500 bg-slate-900 px-2 py-1 rounded font-mono">
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}
