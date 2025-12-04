'use client'

import { motion } from 'framer-motion'
import { apps } from './page'
import { useRouter } from 'next/navigation'

/* eslint-disable @next/next/no-img-element */

interface DesktopProps {
  onOpenApp: (appId: string) => void
}

export default function Desktop({ onOpenApp }: DesktopProps) {
  const router = useRouter()

  const handleDoubleClick = (app: typeof apps[0]) => {
    // Si es el ícono de portafolio, navegar en lugar de abrir ventana
    if (app.id === 'portfolio') {
      router.push('/')
    } else if (app.id === 'cli') {
      // Abrir sgomez-cli en una nueva pestaña
      window.open('https://www.npmjs.com/package/sgomez-cli', '_blank')
    } else {
      onOpenApp(app.id)
    }
  }

  return (
    <div className="absolute inset-0 p-8 grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-6 content-start">
      {apps.map((app, index) => (
        <motion.div
          key={app.id}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center justify-center cursor-pointer group"
          onClick={() => handleDoubleClick(app)}
        >
          <div className="w-20 h-20 rounded-xl shadow-lg flex items-center justify-center mb-2 group-hover:shadow-2xl transition-shadow bg-white/90 backdrop-blur-sm p-2">
            <img src={app.icon} alt={app.title} className="w-full h-full object-contain" />
          </div>
          <span className="text-white text-xs text-center drop-shadow-lg font-medium px-2 py-1 bg-black/30 rounded backdrop-blur-sm">
            {app.title}
          </span>
        </motion.div>
      ))}
    </div>
  )
}
