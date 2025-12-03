'use client'

import { motion } from 'framer-motion'
import { about } from '../content'

export default function AboutSection() {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center px-6 py-20">
      <h2 className="text-5xl font-bold mb-6 gradient-text-primary">Mi Historia</h2>
      <p className="text-gray-300/80 max-w-3xl mb-16 text-center text-lg font-light leading-relaxed">{about.description}</p>

      <div className="relative w-full max-w-4xl">
        <div className="absolute left-1/2 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-purple-600 h-full -translate-x-1/2"/>
        {about.timeline.map((item, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className={`mb-12 w-full flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'} relative`}
          >
            <div className="backdrop-blur-sm bg-slate-900/50 p-6 rounded-2xl shadow-2xl w-80 border border-blue-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-105">
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 text-lg">Edad {item.age}</span>
              <p className="mt-3 text-gray-300/90 font-light leading-relaxed">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
