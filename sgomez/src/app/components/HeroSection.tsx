'use client'

import { motion } from 'framer-motion'
import { hero } from '../content'

export default function HeroSection() {
  return (
    <section className="h-screen flex flex-col justify-center items-center relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <motion.h1 
        initial={{ y: -50, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ duration: 1 }}
        className="text-6xl md:text-8xl lg:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-purple-600 relative z-10"
      >
        {hero.name}
      </motion.h1>
      <motion.p 
        initial={{ y: 50, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ delay: 0.5, duration: 1 }}
        className="mt-6 text-xl md:text-2xl text-gray-300/90 max-w-xl text-center relative z-10 font-light tracking-wide"
      >
        {hero.subtitle}
      </motion.p>

      <motion.img 
        initial={{ scale: 0.8, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        transition={{ delay: 1, duration: 1 }}
        src={hero.gif} 
        alt="coding"
        className="mt-10 w-72 md:w-96 rounded-2xl shadow-2xl relative z-10 ring-1 ring-blue-500/20 glow-blue"
      />
    </section>
  )
}
