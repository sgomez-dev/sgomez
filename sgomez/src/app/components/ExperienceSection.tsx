'use client'

import { motion } from 'framer-motion'
import { experience } from '../content'

export default function ExperienceSection() {
  return (
    <section id="experience" className="py-24 md:py-32 relative">
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/[0.03] rounded-full blur-[128px] pointer-events-none" />
      <div className="container-custom relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-16">
          <p className="text-violet-400 text-sm font-mono tracking-wider uppercase mb-3">Trayectoria</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white">Experiencia Profesional</h2>
        </motion.div>
        <div className="relative">
          <div className="absolute left-[19px] md:left-[23px] top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/40 via-indigo-500/20 to-transparent" />
          <div className="space-y-6">
            {experience.map((exp, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }} className="relative pl-14 md:pl-16">
                <div className="absolute left-[14px] md:left-[18px] top-6 w-[11px] h-[11px] rounded-full border-2 border-violet-500 bg-[var(--bg-primary)]" />
                <div className="group glass rounded-xl p-6 card-hover relative overflow-hidden">
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-600/[0.06] rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                      <span className="text-violet-300 text-xs font-mono">{exp.period}</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold text-white mb-1 group-hover:text-violet-300 transition-colors">{exp.role}</h3>
                    <p className="text-gray-500 text-sm mb-4 font-light">{exp.title}</p>
                    <p className="text-gray-400 text-sm leading-relaxed font-light">{exp.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
