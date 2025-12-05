'use client'

import { motion } from 'framer-motion'
import { technologies } from '../content'

export default function TechnologiesSection() {
  return (
    <section id="technologies" className="min-h-screen flex flex-col justify-center py-20 relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="flex items-center gap-4 mb-16">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            className="text-5xl"
          >
            💻
          </motion.div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white">Stack Tecnológico</h2>
            <p className="text-gray-400 mt-2">Herramientas que uso para crear experiencias increíbles</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {technologies.map((category, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700 hover:border-blue-600/50 transition-all card-hover relative overflow-hidden group"
            >
              {/* Efecto de brillo en hover */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-purple-600/20 transition-colors duration-500" />
              
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="text-2xl">
                    {categoryIndex === 0 ? '🎨' : categoryIndex === 1 ? '⚙️' : categoryIndex === 2 ? '☁️' : '📱'}
                  </span>
                  {category.category}
                </h3>
                <div className="space-y-4">
                  {category.skills.map((skill, skillIndex) => (
                    <motion.div
                      key={skillIndex}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: (categoryIndex * 0.1) + (skillIndex * 0.05) }}
                      className="group/skill"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl group-hover/skill:scale-110 transition-transform">
                            {skill.icon}
                          </span>
                          <span className="text-white font-medium text-sm group-hover/skill:text-blue-400 transition-colors">
                            {skill.name}
                          </span>
                        </div>
                        <span className="text-blue-400 font-mono text-xs">
                          {skill.years} años
                        </span>
                      </div>
                      {/* Barra de progreso animada */}
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: (categoryIndex * 0.1) + (skillIndex * 0.05) }}
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Estadísticas mejoradas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-600/5 p-6 rounded-xl border border-blue-600/30 text-center group hover:scale-105 transition-transform">
            <div className="text-4xl mb-2">⏱️</div>
            <div className="text-3xl font-bold text-blue-400 mb-1">5+</div>
            <div className="text-gray-400 text-sm">Años de Experiencia</div>
          </div>
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-600/5 p-6 rounded-xl border border-purple-600/30 text-center group hover:scale-105 transition-transform">
            <div className="text-4xl mb-2">🚀</div>
            <div className="text-3xl font-bold text-purple-400 mb-1">20+</div>
            <div className="text-gray-400 text-sm">Proyectos Completados</div>
          </div>
          <div className="bg-gradient-to-br from-cyan-600/20 to-cyan-600/5 p-6 rounded-xl border border-cyan-600/30 text-center group hover:scale-105 transition-transform">
            <div className="text-4xl mb-2">🛠️</div>
            <div className="text-3xl font-bold text-cyan-400 mb-1">15+</div>
            <div className="text-gray-400 text-sm">Tecnologías Dominadas</div>
          </div>
          <div className="bg-gradient-to-br from-pink-600/20 to-pink-600/5 p-6 rounded-xl border border-pink-600/30 text-center group hover:scale-105 transition-transform">
            <div className="text-4xl mb-2">💪</div>
            <div className="text-3xl font-bold text-pink-400 mb-1">100%</div>
            <div className="text-gray-400 text-sm">Compromiso y Pasión</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
