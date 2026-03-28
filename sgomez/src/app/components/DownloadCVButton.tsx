'use client'

import { motion } from 'framer-motion'

export default function DownloadCVButton() {
  return (
    <motion.a href="/CV_Santiago_Gómez_de_la_Torre_Romero.pdf" download initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 2.8 }} className="fixed bottom-20 right-6 z-40 group" title="Descargar CV">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative glass rounded-full p-3 hover:bg-white/[0.04] transition-all duration-300 hover:border-violet-500/20">
          <svg className="w-5 h-5 text-gray-400 group-hover:text-violet-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
        </div>
      </div>
    </motion.a>
  )
}
