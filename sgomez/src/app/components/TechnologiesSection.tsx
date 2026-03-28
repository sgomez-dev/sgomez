'use client'

import { motion } from 'framer-motion'
import { technologies } from '../content'

const categoryColors: Record<string, { bg: string; text: string; border: string; pill: string }> = {
  Frontend: { bg: 'from-violet-500/[0.08] to-violet-500/[0.02]', text: 'text-violet-400', border: 'border-violet-500/20 hover:border-violet-500/40', pill: 'bg-violet-500/10 text-violet-300 border-violet-500/20' },
  Backend: { bg: 'from-emerald-500/[0.08] to-emerald-500/[0.02]', text: 'text-emerald-400', border: 'border-emerald-500/20 hover:border-emerald-500/40', pill: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' },
  'DevOps & Cloud': { bg: 'from-cyan-500/[0.08] to-cyan-500/[0.02]', text: 'text-cyan-400', border: 'border-cyan-500/20 hover:border-cyan-500/40', pill: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20' },
  'Databases & Tools': { bg: 'from-amber-500/[0.08] to-amber-500/[0.02]', text: 'text-amber-400', border: 'border-amber-500/20 hover:border-amber-500/40', pill: 'bg-amber-500/10 text-amber-300 border-amber-500/20' },
}
const categoryIcons: Record<string, string> = { Frontend: '01', Backend: '02', 'DevOps & Cloud': '03', 'Databases & Tools': '04' }

export default function TechnologiesSection() {
  return (
    <section id="technologies" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-cyan-600/[0.03] rounded-full blur-[128px] pointer-events-none" />
      <div className="container-custom relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-16">
          <p className="text-violet-400 text-sm font-mono tracking-wider uppercase mb-3">Tecnologias</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-3">Stack Tecnologico</h2>
          <p className="text-gray-500 font-light max-w-lg">Herramientas y tecnologias que uso para crear experiencias digitales excepcionales.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-5">
          {technologies.map((category, ci) => {
            const colors = categoryColors[category.category] || categoryColors.Frontend
            return (
              <motion.div key={ci} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: ci * 0.1 }}
                className={`rounded-2xl border ${colors.border} bg-gradient-to-br ${colors.bg} p-6 md:p-8 transition-all duration-300 relative overflow-hidden group`}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">{category.category}</h3>
                    <span className={`${colors.text} font-mono text-xs opacity-50`}>{categoryIcons[category.category]}</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {category.skills.map((skill, si) => (
                      <motion.div key={si} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: ci * 0.05 + si * 0.04 }}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border ${colors.pill} text-sm transition-all duration-200 hover:scale-105`}>
                        <span className="text-base">{skill.icon}</span>
                        <span className="font-medium">{skill.name}</span>
                        <span className="text-[10px] opacity-50 font-mono">{skill.years}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
