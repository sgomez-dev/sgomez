'use client'

import { motion } from 'framer-motion'
import { certifications } from '../content'

export default function CertificationsSection() {
  const half = Math.ceil(certifications.length / 2)
  const row1 = certifications.slice(0, half)
  const row2 = certifications.slice(half)

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="container-custom relative z-10 mb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p className="text-violet-400 text-sm font-mono tracking-wider uppercase mb-3">Formacion continua</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white">Certificaciones</h2>
        </motion.div>
      </div>
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative mb-4">
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-[var(--bg-primary)] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-[var(--bg-primary)] to-transparent z-10 pointer-events-none" />
        <div className="overflow-hidden">
          <div className="flex gap-4 animate-marquee" style={{ width: 'max-content' }}>
            {[...row1, ...row1].map((cert, i) => (
              <a key={i} href={cert.url} target="_blank" rel="noopener noreferrer" className="shrink-0 inline-flex items-center gap-3 px-5 py-3 rounded-xl glass hover:bg-white/[0.04] transition-all duration-200 group">
                <span className="text-violet-400 text-sm font-medium whitespace-nowrap group-hover:text-violet-300 transition-colors">{cert.title}</span>
                <span className="text-gray-600">·</span>
                <span className="text-gray-500 text-xs whitespace-nowrap font-light">{cert.institution}</span>
              </a>
            ))}
          </div>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-[var(--bg-primary)] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-[var(--bg-primary)] to-transparent z-10 pointer-events-none" />
        <div className="overflow-hidden">
          <div className="flex gap-4 animate-marquee-reverse" style={{ width: 'max-content' }}>
            {[...row2, ...row2].map((cert, i) => (
              <a key={i} href={cert.url} target="_blank" rel="noopener noreferrer" className="shrink-0 inline-flex items-center gap-3 px-5 py-3 rounded-xl glass hover:bg-white/[0.04] transition-all duration-200 group">
                <span className="text-violet-400 text-sm font-medium whitespace-nowrap group-hover:text-violet-300 transition-colors">{cert.title}</span>
                <span className="text-gray-600">·</span>
                <span className="text-gray-500 text-xs whitespace-nowrap font-light">{cert.institution}</span>
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
