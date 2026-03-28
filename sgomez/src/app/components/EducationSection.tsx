'use client'

import { motion } from 'framer-motion'
import { education } from '../content'

export default function EducationSection() {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="container-custom relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-12">
          <p className="text-violet-400 text-sm font-mono tracking-wider uppercase mb-3">Formacion academica</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white">Educacion</h2>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-5">
          {education.map((edu, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-2xl p-6 md:p-8 card-hover relative overflow-hidden group">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-600/[0.05] rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-violet-300 transition-colors">{edu.title}</h3>
                  <p className="text-gray-400 text-sm font-light leading-relaxed">{edu.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
