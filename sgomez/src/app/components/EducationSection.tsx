'use client'

import { motion } from 'framer-motion'
import { education } from '../content'

export default function EducationSection() {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center px-6 py-20">
      <h2 className="text-5xl font-bold mb-16 gradient-text-primary">Educación</h2>
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl">
        {education.map((e, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.2 }}
            className="group backdrop-blur-sm bg-slate-900/40 p-8 rounded-2xl shadow-2xl border border-blue-500/10 hover:border-purple-500/30 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4">{e.title}</h3>
              <p className="mt-3 text-gray-300/80 font-light leading-relaxed">{e.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
