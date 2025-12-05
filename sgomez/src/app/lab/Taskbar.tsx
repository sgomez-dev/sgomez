'use client'

import { useState, useEffect } from 'react'
import { WindowState } from './page'
import { motion, AnimatePresence } from 'framer-motion'

/* eslint-disable @next/next/no-img-element */

interface TaskbarProps {
  windows: WindowState[]
  onWindowClick: (id: string) => void
}

export default function Taskbar({ windows, onWindowClick }: TaskbarProps) {
  const [time, setTime] = useState(new Date())
  const [showStartMenu, setShowStartMenu] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 h-14 sm:h-12 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 flex items-center px-1 sm:px-2 gap-1 sm:gap-2 z-[10000]">
      {/* Start Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowStartMenu(!showStartMenu)}
        className="w-10 h-8 sm:w-12 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white font-bold text-lg sm:text-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shrink-0"
      >
        ⊞
      </motion.button>

      {/* Start Menu */}
      <AnimatePresence>
        {showStartMenu && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-14 left-2 w-80 bg-gray-800/98 backdrop-blur-md rounded-lg shadow-2xl border border-gray-700 overflow-hidden"
          >
            <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
              <h3 className="font-bold text-lg">Santiago Gómez</h3>
              <p className="text-sm opacity-90">Developer Portfolio</p>
            </div>
            <div className="p-2">
              <div className="text-gray-400 text-xs font-semibold px-3 py-2">PROYECTOS</div>
              <div className="max-h-96 overflow-y-auto">
                {windows.length === 0 ? (
                  <div className="px-3 py-8 text-center text-gray-500 text-sm">
                    Haz doble clic en un icono del escritorio para abrir una aplicación
                  </div>
                ) : (
                  windows.map((window) => (
                    <button
                      key={window.id}
                      onClick={() => {
                        onWindowClick(window.id)
                        setShowStartMenu(false)
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-700/50 rounded transition-colors text-left"
                    >
                      {window.icon?.startsWith('/') ? (
                        <img src={window.icon} alt={window.title} className="w-6 h-6 object-contain" />
                      ) : (
                        <span className="text-2xl">{window.icon}</span>
                      )}
                      <span className="text-white text-sm">{window.title}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Window Buttons */}
      <div className="flex-1 flex items-center gap-1 overflow-x-auto">
        {windows.map((window) => (
          <motion.button
            key={window.id}
            initial={{ scale: 0, width: 0 }}
            animate={{ scale: 1, width: 'auto' }}
            exit={{ scale: 0, width: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onWindowClick(window.id)}
            className={`
              flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded transition-all min-w-0 max-w-[120px] sm:max-w-xs
              ${window.isMinimized 
                ? 'bg-gray-700/50 text-gray-400' 
                : 'bg-gray-700 text-white border-b-2 border-blue-500'
              }
              hover:bg-gray-600
            `}
          >
            {window.icon?.startsWith('/') ? (
              <img src={window.icon} alt={window.title} className="w-4 h-4 sm:w-5 sm:h-5 object-contain shrink-0" />
            ) : (
              <span className="text-base sm:text-lg shrink-0">{window.icon}</span>
            )}
            <span className="text-xs sm:text-sm truncate hidden sm:inline">{window.title}</span>
          </motion.button>
        ))}
      </div>

      {/* Return to Portfolio Button */}
      <motion.a
        href="/"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="hidden sm:flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm font-medium transition-colors shadow-lg shrink-0"
      >
        ← Portafolio
      </motion.a>

      {/* Mobile Home Button */}
      <motion.a
        href="/"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="sm:hidden w-10 h-8 bg-blue-600 hover:bg-blue-700 rounded flex items-center justify-center text-white transition-colors shadow-lg shrink-0"
      >
        🏠
      </motion.a>

      {/* System Tray */}
      <div className="hidden md:flex items-center gap-3 px-3 shrink-0">
        {/* Quick Actions */}
        <div className="flex gap-1">
          <button className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center text-white transition-colors">
            🔊
          </button>
          <button className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center text-white transition-colors">
            📶
          </button>
        </div>

        {/* Clock */}
        <div className="text-right">
          <div className="text-white text-sm font-medium leading-tight">
            {formatTime(time)}
          </div>
          <div className="text-gray-400 text-xs leading-tight">
            {formatDate(time)}
          </div>
        </div>
      </div>

      {/* Mobile Clock */}
      <div className="md:hidden text-right shrink-0">
        <div className="text-white text-xs font-medium">
          {formatTime(time)}
        </div>
      </div>
    </div>
  )
}
