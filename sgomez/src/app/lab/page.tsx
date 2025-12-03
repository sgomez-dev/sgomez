'use client'

import { motion } from 'framer-motion'
import { hero } from '../content'

export default function HeroSection() {
  return (
    <section className="h-screen flex flex-col justify-center items-center relative overflow-hidden">
      <motion.h1 
        initial={{ y: -50, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ duration: 1 }}
        className="text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"
      >
        {hero.name}
      </motion.h1>
      <motion.p 
        initial={{ y: 50, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ delay: 0.5, duration: 1 }}
        className="mt-6 text-xl md:text-2xl text-gray-300 max-w-xl text-center"
      >
        {hero.subtitle}
      </motion.p>

      <motion.img 
        initial={{ scale: 0.8, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        transition={{ delay: 1, duration: 1 }}
        src={hero.gif} 
        alt="coding"
        className="mt-10 w-72 md:w-96 rounded-xl shadow-2xl"
      />
    </section>
  )
}
