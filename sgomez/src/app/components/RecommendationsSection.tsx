'use client'

import { motion } from 'framer-motion'
import { recommendations } from '../content'

export default function RecommendationsSection() {
  return (
    <section className="min-h-screen flex flex-col justify-center py-20">
      <div className="container-custom">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-white">Recomendaciones</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {recommendations.map((r, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-purple-600/50 transition-all card-hover"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-blue-400">{r.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{r.name}</h3>
                  <span className="text-gray-400 text-sm">{r.role}</span>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed italic">"{r.comment}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
