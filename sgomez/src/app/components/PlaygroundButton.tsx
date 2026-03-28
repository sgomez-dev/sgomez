'use client'

import { motion } from 'framer-motion'

export default function PlaygroundButton() {
  return (
    <motion.a href="/lab" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 2.5 }} className="fixed top-6 right-6 z-50 group" title="SGOMEZ-OS Playground">
      <div className="glass rounded-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-white/[0.04] transition-all duration-300 hover:border-violet-500/20">
        <div className="w-2 h-2 rounded-full bg-violet-400 group-hover:animate-pulse" />
        <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors hidden sm:inline">SGOMEZ-OS</span>
        <svg className="w-3.5 h-3.5 text-gray-600 group-hover:text-violet-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
      </div>
    </motion.a>
  )
}
