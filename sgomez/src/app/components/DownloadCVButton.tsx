'use client'

import { motion } from 'framer-motion'

export default function DownloadCVButton() {
  return (
    <motion.a
      href="/CV_Santiago_Gómez_de_la_Torre_Romero.pdf"
      download
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 1.2 }}
      className="fixed bottom-32 right-6 z-40 group"
    >
      <div className="relative">
        {/* Efecto de pulso */}
        <div className="absolute inset-0 bg-purple-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 animate-pulse" />
        
        {/* Botón principal */}
        <div className="relative bg-linear-to-br from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-300 group-hover:scale-105">
          <span className="text-2xl">📄</span>
          <div className="flex flex-col items-start">
            <span className="text-xs font-medium opacity-90">Descargar</span>
            <span className="text-sm font-bold">Mi CV</span>
          </div>
          <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </div>
    </motion.a>
  )
}
