'use client'

import { motion } from 'framer-motion'
import { projects } from '../content'

export default function ProjectsSection() {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center px-6 py-20 relative">
      <h2 className="text-5xl font-bold mb-16 gradient-text-primary">Proyectos Destacados</h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-7xl">
        {projects.map((p, i) => (
          <motion.a 
            key={i}
            href={p.link}
            target="_blank"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.2 }}
            className="group backdrop-blur-sm bg-slate-900/40 p-8 rounded-2xl shadow-2xl border border-blue-500/10 hover:border-purple-500/30 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden"
          >
            {/* Efecto de brillo en hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-3">{p.title}</h3>
              <p className="mt-3 text-gray-300/80 font-light leading-relaxed">{p.desc}</p>
              <span className="mt-6 block text-gray-400/70 text-sm font-mono">{p.stack}</span>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  )
}
