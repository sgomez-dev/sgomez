'use client'

import { motion } from 'framer-motion'
import { experience } from '../content'

export default function ExperienceSection() {
  const experienceIcons = ['💼', '🏢', '👥', '🎓', '🏆']
  
  return (
    <section className="min-h-screen flex flex-col justify-center py-20 relative">
      {/* Efecto de fondo */}
      <div className="absolute top-1/4 left-0 w-72 h-72 bg-purple-600/5 rounded-full blur-3xl" />
      
      <div className="container-custom relative z-10">
        <div className="flex items-center gap-4 mb-16">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            className="text-5xl"
          >
            💼
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold text-white">Experiencia</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {experience.map((e, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-purple-600/50 transition-all card-hover relative overflow-hidden"
            >
              {/* Efecto visual */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition-colors duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl mt-1">{experienceIcons[i % experienceIcons.length]}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">{e.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-400 text-sm">{e.role}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-purple-400 text-sm font-mono">{e.period}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 leading-relaxed text-sm">{e.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
