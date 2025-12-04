'use client'

import { motion } from 'framer-motion'
import { about } from '../content'

export default function AboutSection() {
  return (
    <section id="about" className="min-h-screen flex flex-col justify-center py-20">
      <div className="container-custom">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Mi Historia</h2>
        <p className="text-gray-400 max-w-5xl mb-16 text-lg font-light leading-relaxed whitespace-pre-line">{about.description}</p>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-linear-to-b from-blue-600 via-purple-600 to-slate-700"/>
          <div className="space-y-8">
            {about.timeline.map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -20 }} 
                whileInView={{ opacity: 1, x: 0 }} 
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative pl-20"
              >
                <div className="absolute left-0 w-16 h-16 bg-linear-to-br from-slate-800 to-slate-900 border-2 border-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <span className="text-blue-400 font-bold text-sm">{item.year}</span>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-blue-600/50 transition-all card-hover">
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
