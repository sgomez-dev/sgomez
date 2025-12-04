'use client'

import { motion } from 'framer-motion'
import { recommendations } from '../content'

export default function RecommendationsSection() {
  return (
    <section id="recommendations" className="min-h-screen flex flex-col justify-center py-20">
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
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                  <a 
                    href={r.recommenderUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center shrink-0 hover:bg-slate-600 transition-colors"
                  >
                    <span className="text-lg font-bold text-blue-400">{r.name.charAt(0)}</span>
                  </a>
                  <div>
                    <a 
                      href={r.recommenderUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-lg font-bold text-white hover:text-purple-400 transition-colors"
                    >
                      {r.name}
                    </a>
                  </div>
                </div>
                <span className="text-gray-500 text-sm whitespace-nowrap">{r.date}</span>
              </div>
              <p className="text-gray-400 leading-relaxed italic mb-3">"{r.comment}"</p>
              <a 
                href={r.profileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1"
              >
                Ver en mi perfil →
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
