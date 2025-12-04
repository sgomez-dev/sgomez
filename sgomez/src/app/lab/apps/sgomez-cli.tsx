'use client'

import { useState } from 'react'

export default function SgomezCLI() {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([
    '> Welcome to sgomez-cli v1.0.0',
    '> Type "help" for available commands',
    '',
  ])

  const commands: Record<string, string> = {
    help: 'Available commands: help, about, skills, projects, contact, clear',
    about: 'Santiago Gómez - Full Stack Developer passionate about creating amazing web experiences',
    skills: 'React • TypeScript • Next.js • Node.js • Python • PostgreSQL • AWS',
    projects: 'Portfolio • Skyzen • Sortlab • Budget App • To-Do App • And more...',
    contact: 'Email: santiago@example.com | GitHub: sgomez-dev | LinkedIn: sgomez',
    clear: 'CLEAR_SCREEN',
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const command = input.trim().toLowerCase()
    const output = commands[command] || `Command not found: ${input}. Type "help" for available commands.`
    
    if (output === 'CLEAR_SCREEN') {
      setHistory(['> Welcome to sgomez-cli v1.0.0', '> Type "help" for available commands', ''])
    } else {
      setHistory([...history, `> ${input}`, output, ''])
    }
    
    setInput('')
  }

  return (
    <div className="h-full bg-gray-900 text-green-400 font-mono p-6 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <div className="text-gray-500">
            ┌──(sgomez㉿portfolio)-[~]
          </div>
        </div>

        <div className="space-y-1 mb-4">
          {history.map((line, index) => (
            <div key={index} className="whitespace-pre-wrap">
              {line}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="text-gray-500">└─$ </span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent outline-none ml-2 text-green-400"
            autoFocus
          />
        </form>

        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="text-gray-500 text-sm">
            <p>💡 Tip: Try these commands:</p>
            <ul className="mt-2 space-y-1 ml-4">
              <li>• about - Learn about me</li>
              <li>• skills - View my technical skills</li>
              <li>• projects - See my projects</li>
              <li>• contact - Get contact information</li>
              <li>• clear - Clear the terminal</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
