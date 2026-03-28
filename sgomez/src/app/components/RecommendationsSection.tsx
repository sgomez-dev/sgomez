'use client'

import { motion } from 'framer-motion'
import { recommendations } from '../content'

export default function RecommendationsSection() {
  return (
    <section id="recommendations" className="py-24 md:py-32 relative">
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-600/[0.03] rounded-full blur-[128px] pointer-events-none" />
      <div className="container-custom relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-16">
          <p className="text-violet-400 text-sm font-mono tracking-wider uppercase mb-3">Testimonios</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white">Lo que dicen de mi</h2>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-5">
          {recommendations.map((rec, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group glass rounded-2xl p-6 md:p-8 card-hover relative overflow-hidden">
              <div className="absolute top-4 right-6 text-6xl text-violet-500/[0.06] font-serif pointer-events-none select-none">&ldquo;</div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <a href={rec.recommenderUrl} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center hover:border-violet-500/40 transition-colors">
                    <span className="text-lg font-bold gradient-text">{rec.name.charAt(0)}</span>
                  </a>
                  <div className="flex-1 min-w-0">
                    <a href={rec.recommenderUrl} target="_blank" rel="noopener noreferrer" className="text-white font-semibold hover:text-violet-300 transition-colors block truncate">{rec.name}</a>
                    <span className="text-gray-600 text-xs font-light">{rec.date}</span>
                  </div>
                </div>
                <div className="text-gray-400 leading-relaxed font-light text-sm space-y-3">
                  {Array.isArray(rec.comment) ? rec.comment.map((p, pi) => <p key={pi}>{p}</p>) : <p>{rec.comment}</p>}
                </div>
                <a href={rec.profileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-5 text-xs text-violet-400/70 hover:text-violet-400 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  Ver en LinkedIn
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
