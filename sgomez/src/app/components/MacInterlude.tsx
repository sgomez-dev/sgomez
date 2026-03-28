'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import MacBook from './MacBook'

interface MacInterludeProps {
  command: string
  output: string
  typingSpeed?: number
}

export default function MacInterlude({ command, output, typingSpeed = 25 }: MacInterludeProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-10%' })
  const [typedChars, setTypedChars] = useState(0)
  const [showOutput, setShowOutput] = useState(false)

  useEffect(() => {
    if (!isInView) return
    let intervalId: ReturnType<typeof setInterval>
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        setTypedChars((prev) => {
          const next = prev + 1
          if (next >= command.length) {
            clearInterval(intervalId)
            setTimeout(() => setShowOutput(true), 350)
            return command.length
          }
          return next
        })
      }, typingSpeed)
    }, 400)
    return () => { clearTimeout(timeoutId); if (intervalId) clearInterval(intervalId) }
  }, [isInView, command.length, typingSpeed])

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="py-16 md:py-20">
      <div className="max-w-md sm:max-w-lg mx-auto px-6">
        <MacBook title="Terminal — sgomez.dev">
          <div className="font-mono text-[11px] sm:text-xs md:text-sm leading-relaxed">
            <div className="flex gap-2">
              <span className="text-emerald-400 select-none shrink-0">$</span>
              <span className="text-white">
                {command.slice(0, typedChars)}
                {typedChars < command.length && isInView && <span className="animate-cursor-blink text-white">▎</span>}
              </span>
            </div>
            {showOutput && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mt-3 text-gray-400 whitespace-pre-wrap">
                {output}
              </motion.div>
            )}
            {showOutput && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-2 flex gap-2">
                <span className="text-emerald-400 select-none">$</span>
                <span className="animate-cursor-blink text-white">▎</span>
              </motion.div>
            )}
          </div>
        </MacBook>
      </div>
    </motion.div>
  )
}
