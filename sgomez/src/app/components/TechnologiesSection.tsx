'use client'

import { motion } from 'framer-motion'
import { technologies } from '../content'

export default function TechnologiesSection() {
  return (
    <section className="min-h-screen flex flex-col justify-center py-20">
      <div className="container-custom">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Stack Tecnológico</h2>
        <p className="text-gray-400 mb-16 text-lg">Tecnologías que domino y utilizo en mis proyectos</p>

        <div className="grid md:grid-cols-2 gap-8">
          {technologies.map((category, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              className="bg-slate-800 p-8 rounded-lg border border-slate-700"
            >
              <h3 className="text-2xl font-bold text-white mb-6">{category.category}</h3>
              <div className="space-y-5">
                {category.skills.map((skill, skillIndex) => (
                  <div key={skillIndex} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{skill.icon}</span>
                        <span className="text-white font-medium">{skill.name}</span>
                      </div>
                      <span className="text-blue-400 font-mono text-sm">{skill.level}%</span>
                    </div>
                    <div className="relative h-2 bg-slate-900 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: categoryIndex * 0.1 + skillIndex * 0.05, ease: "easeOut" }}
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Estadísticas adicionales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12"
        >
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">5+</div>
            <div className="text-gray-400 text-sm">Años Programando</div>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">20+</div>
            <div className="text-gray-400 text-sm">Proyectos Completados</div>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">15+</div>
            <div className="text-gray-400 text-sm">Tecnologías</div>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">100%</div>
            <div className="text-gray-400 text-sm">Compromiso</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
