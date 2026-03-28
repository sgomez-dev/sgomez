'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState, useEffect, useMemo } from 'react'
import { hero } from '../content'
import Image from 'next/image'
import MacBook from './MacBook'

const codeTokens = [
  { text: 'const ', color: 'text-violet-400' },
  { text: 'santiago', color: 'text-cyan-300' },
  { text: ' = {\n', color: 'text-gray-600' },
  { text: '  name', color: 'text-white/90' },
  { text: ': ', color: 'text-gray-600' },
  { text: '"Santiago Gómez de la Torre Romero"', color: 'text-emerald-400' },
  { text: ',\n', color: 'text-gray-600' },
  { text: '  role', color: 'text-white/90' },
  { text: ': ', color: 'text-gray-600' },
  { text: '"Senior Software Engineer"', color: 'text-emerald-400' },
  { text: ',\n', color: 'text-gray-600' },
  { text: '  stack', color: 'text-white/90' },
  { text: ': [', color: 'text-gray-600' },
  { text: '"React"', color: 'text-amber-300' },
  { text: ', ', color: 'text-gray-600' },
  { text: '"Angular"', color: 'text-amber-300' },
  { text: ', ', color: 'text-gray-600' },
  { text: '"Next.js"', color: 'text-amber-300' },
  { text: ',\n', color: 'text-gray-600' },
  { text: '          ', color: '' },
  { text: '"Node.js"', color: 'text-amber-300' },
  { text: ', ', color: 'text-gray-600' },
  { text: '"TypeScript"', color: 'text-amber-300' },
  { text: ', ', color: 'text-gray-600' },
  { text: '"GCP"', color: 'text-amber-300' },
  { text: '],\n', color: 'text-gray-600' },
  { text: '  passion', color: 'text-white/90' },
  { text: ': ', color: 'text-gray-600' },
  { text: '"Building digital experiences"', color: 'text-emerald-400' },
  { text: ',\n', color: 'text-gray-600' },
  { text: '  location', color: 'text-white/90' },
  { text: ': ', color: 'text-gray-600' },
  { text: '"Santander, ES"', color: 'text-emerald-400' },
  { text: ',\n', color: 'text-gray-600' },
  { text: '  available', color: 'text-white/90' },
  { text: ': ', color: 'text-gray-600' },
  { text: 'true', color: 'text-violet-400' },
  { text: ',\n', color: 'text-gray-600' },
  { text: '};\n\n', color: 'text-gray-600' },
  { text: '// ', color: 'text-gray-700' },
  { text: "Let's build something amazing", color: 'text-gray-600 italic' },
  { text: ' →', color: 'text-violet-400' },
]

function SyntaxTypewriter({ tokens, charCount }: { tokens: typeof codeTokens; charCount: number }) {
  let accumulated = 0
  return (
    <pre className="text-[11px] sm:text-xs md:text-sm font-mono leading-relaxed whitespace-pre-wrap">
      <code>
        {tokens.map((token, ti) => {
          const start = accumulated
          accumulated += token.text.length
          if (charCount <= start) return null
          const visible = charCount >= accumulated ? token.text : token.text.slice(0, charCount - start)
          return <span key={ti} className={token.color}>{visible}</span>
        })}
        {charCount > 0 && <span className="animate-cursor-blink text-violet-400">▎</span>}
      </code>
    </pre>
  )
}

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -80])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.7], [1, 0.97])

  const totalChars = useMemo(() => codeTokens.reduce((sum, t) => sum + t.text.length, 0), [])
  const [charCount, setCharCount] = useState(0)
  const [typingComplete, setTypingComplete] = useState(false)

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        setCharCount((prev) => {
          const next = prev + 1
          if (next >= totalChars) { clearInterval(intervalId); setTypingComplete(true); return totalChars }
          return next
        })
      }, 18)
    }, 800)
    return () => { clearTimeout(timeoutId); if (intervalId) clearInterval(intervalId) }
  }, [totalChars])

  return (
    <section ref={sectionRef} id="hero" className="min-h-screen flex flex-col justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-48 w-[600px] h-[600px] bg-violet-600/[0.06] rounded-full blur-[128px] animate-orbit" />
        <div className="absolute bottom-1/4 -right-48 w-[500px] h-[500px] bg-indigo-600/[0.06] rounded-full blur-[128px] animate-orbit-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/[0.02] rounded-full blur-[150px]" />
      </div>
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />

      <motion.div style={{ y: heroY, opacity: heroOpacity, scale: heroScale }} className="relative z-10 flex flex-col items-center px-4 sm:px-6 gap-6 md:gap-8">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex items-center gap-3 sm:gap-4">
          <div className="relative shrink-0">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-violet-500/30 to-cyan-500/30 blur-sm" />
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden ring-1 ring-white/10">
              <Image src="/Santiago_Gómez_de_la_Torre_Romero.png" alt="Santiago Gómez de la Torre Romero" width={48} height={48} className="w-full h-full object-cover" priority />
            </div>
          </div>
          <div className="text-left">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-tight">{hero.name}</h1>
            <p className="text-violet-400 text-xs sm:text-sm font-medium">Senior Software Engineer</p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-[11px] text-gray-500 ml-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            Disponible
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="w-full max-w-lg lg:max-w-2xl" style={{ perspective: '1200px' }}>
          <motion.div initial={{ rotateX: 4 }} animate={{ rotateX: 0 }} transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}>
            <MacBook><SyntaxTypewriter tokens={codeTokens} charCount={charCount} /></MacBook>
          </motion.div>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: typingComplete ? 1 : 0 }} transition={{ duration: 0.6 }} className="text-gray-500 text-sm md:text-base font-light text-center max-w-md">{hero.subtitle}</motion.p>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: typingComplete ? 1 : 0, y: typingComplete ? 0 : 10 }} transition={{ duration: 0.5 }} className="flex gap-3 sm:gap-4 flex-wrap justify-center">
          <a href="#contact" className="group relative px-6 sm:px-7 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 transition-all duration-300 text-sm font-medium overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10 flex items-center gap-2">Hablemos<svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></span>
          </a>
          <a href="#projects" className="group px-6 sm:px-7 py-3 rounded-xl glass hover:bg-white/[0.04] transition-all duration-300 text-sm font-medium text-gray-300">
            <span className="flex items-center gap-2">Ver Proyectos<svg className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg></span>
          </a>
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: typingComplete ? 0.7 : 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
        <span className="text-gray-600 text-[10px] uppercase tracking-[0.2em] font-light">Scroll</span>
        <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="w-5 h-8 rounded-full border border-gray-700/60 flex justify-center pt-2">
          <motion.div animate={{ height: [4, 10, 4], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="w-0.5 bg-gray-600 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}
