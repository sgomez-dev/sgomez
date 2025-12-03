'use client'

import { motion } from 'framer-motion'
import { education } from '../content'

export default function EducationSection() {
  return (
    <section className="min-h-screen flex flex-col justify-center py-20">
      <div className="container-custom">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-white">Educación</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {education.map((e, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-blue-600/50 transition-all card-hover"
            >
              <h3 className="text-xl font-bold text-white mb-4">{e.title}</h3>
              <p className="text-gray-400 leading-relaxed">{e.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
