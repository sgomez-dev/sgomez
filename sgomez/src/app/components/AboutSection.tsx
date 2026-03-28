'use client'

import { motion, useInView } from 'framer-motion'
import { about } from '../content'
import { useRef, useEffect, useState } from 'react'

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  useEffect(() => {
    if (!isInView) return
    const startTime = performance.now()
    const duration = 2000
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [isInView, target])
  return <span ref={ref}>{count}{suffix}</span>
}

const stats = [
  { value: 5, suffix: '+', label: 'Años de experiencia' },
  { value: 20, suffix: '+', label: 'Proyectos completados' },
  { value: 15, suffix: '+', label: 'Tecnologías' },
  { value: 18, suffix: '+', label: 'Certificaciones' },
]

export default function AboutSection() {
  const paragraphs = about.description.trim().split('\n\n').filter(Boolean)
  return (
    <section id="about" className="py-24 md:py-32 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/[0.03] rounded-full blur-[128px] pointer-events-none" />
      <div className="container-custom relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-16">
          <p className="text-violet-400 text-sm font-mono tracking-wider uppercase mb-3">Sobre mi</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white">Mi Historia</h2>
        </motion.div>
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 mb-20">
          <div className="lg:col-span-3 space-y-6">
            {paragraphs.map((p, i) => (
              <motion.p key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="text-gray-400 leading-relaxed font-light">{p.trim()}</motion.p>
            ))}
          </div>
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }} className="glass rounded-2xl p-6 text-center card-hover">
                  <div className="text-3xl md:text-4xl font-bold gradient-text mb-2"><AnimatedCounter target={stat.value} suffix={stat.suffix} /></div>
                  <p className="text-gray-500 text-xs font-light">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute left-[19px] md:left-[23px] top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/50 via-indigo-500/30 to-transparent" />
          <div className="space-y-8">
            {about.timeline.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="relative pl-14 md:pl-16">
                <div className="absolute left-0 top-1 w-10 h-10 md:w-12 md:h-12 rounded-full glass flex items-center justify-center">
                  <span className="text-violet-400 font-bold text-xs md:text-sm font-mono">{item.year}</span>
                </div>
                <div className="glass rounded-xl p-5 card-hover">
                  <h3 className="text-white font-semibold mb-1.5">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed font-light">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
