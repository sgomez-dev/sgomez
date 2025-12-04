'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { hero, about, projects, experience, education, technologies, contactLinks } from '@/app/content'

interface CommandHistory {
  input: string
  output: string[]
}

const WELCOME_MESSAGE = [
  '╔═══════════════════════════════════════════════════════════════╗',
  '║                                                               ║',
  '║        Bienvenido a SGOMEZ Terminal v2.0                      ║',
  '║    Sistema Operativo Personal - Santiago Gómez de la Torre    ║',
  '║                                                               ║',
  '╚═══════════════════════════════════════════════════════════════╝',
  '',
  'Escribe "help" para ver los comandos disponibles.',
  ''
]

const COMMANDS = {
  help: {
    description: 'Muestra todos los comandos disponibles',
    execute: () => [
      '',
      '━━━━━━━━━━━━━━━━━━ COMANDOS DISPONIBLES ━━━━━━━━━━━━━━━━━━',
      '',
      '  about         - Información sobre Santiago Gómez',
      '  skills        - Stack tecnológico y habilidades',
      '  projects      - Proyectos destacados',
      '  experience    - Experiencia profesional',
      '  education     - Formación académica',
      '  contact       - Información de contacto',
      '  achievements  - Logros y participaciones',
      '  fun           - Datos curiosos',
      '  whoami        - ¿Quién soy?',
      '  clear         - Limpiar la terminal',
      '  help          - Mostrar este menú',
      '',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      ''
    ]
  },
  about: {
    description: 'Información sobre Santiago Gómez',
    execute: () => {
      const descriptionLines = about.description.trim().split('\n').map(line => `  ${line}`)
      return [
        '',
        '┌─────────────────────────────────────────────────────────────┐',
        '│                      SOBRE MÍ                               │',
        '└─────────────────────────────────────────────────────────────┘',
        '',
        `  Nombre: ${hero.name}`,
        `  Rol: ${hero.title.split('|')[0].trim()} | ${hero.title.split('|')[1].trim()}`,
        '  Edad: 22 años',
        '  Ubicación: Santander, España',
        '',
        '  📝 Descripción:',
        '  ─────────────',
        ...descriptionLines,
        '',
      ]
    }
  },
  whoami: {
    description: '¿Quién soy?',
    execute: () => [
      '',
      '  santiago@sgomez-os ~ $ whoami',
      `  ${hero.name}`,
      `  > ${hero.title.split('|')[1].trim()}`,
      '  > Tech Enthusiast',
      '  > Community Organizer',
      ''
    ]
  },
  skills: {
    description: 'Stack tecnológico',
    execute: () => {
      const createBar = (level: number) => {
        const filled = Math.round(level / 5)
        const empty = 20 - filled
        return '█'.repeat(filled) + '░'.repeat(empty)
      }
      
      const lines: string[] = [
        '',
        '┌─────────────────────────────────────────────────────────────┐',
        '│                  STACK TECNOLÓGICO                          │',
        '└─────────────────────────────────────────────────────────────┘',
        ''
      ]
      
      technologies.forEach(category => {
        lines.push(`  ${category.category === 'Frontend' ? '🎨' : category.category === 'Backend' ? '⚙️' : category.category === 'DevOps & Cloud' ? '☁️' : '📱'} ${category.category.toUpperCase()}`)
        lines.push('  ' + '─'.repeat(category.category.length + 2))
        category.skills.forEach(skill => {
          const paddedName = `${skill.icon} ${skill.name}`.padEnd(18)
          lines.push(`  ${paddedName} ${createBar(skill.level)}  ${skill.level}%`)
        })
        lines.push('')
      })
      
      return lines
    }
  },
  projects: {
    description: 'Proyectos destacados',
    execute: () => {
      const icons = ['🏢', '🌐', '📚']
      const lines: string[] = [
        '',
        '┌─────────────────────────────────────────────────────────────┐',
        '│                  PROYECTOS DESTACADOS                       │',
        '└─────────────────────────────────────────────────────────────┘',
        ''
      ]
      
      projects.forEach((project, index) => {
        lines.push(`  ${index + 1}. ${icons[index] || '💻'} ${project.title}`)
        lines.push('     ' + '─'.repeat(project.title.length))
        lines.push(`     ${project.desc}`)
        lines.push(`     Stack: ${project.stack}`)
        lines.push(`     GitHub: ${project.link.replace('https://', '')}`)
        lines.push('')
      })
      
      lines.push('  4. 💻 SGOMEZ-OS')
      lines.push('     ──────────')
      lines.push('     Sistema operativo web interactivo con aplicaciones.')
      lines.push('     Stack: Next.js, TypeScript, Framer Motion')
      lines.push('     Estado: En desarrollo (¡Estás aquí!)')
      lines.push('')
      
      return lines
    }
  },
  experience: {
    description: 'Experiencia profesional',
    execute: () => {
      const icons = ['💼', '🏢', '🌐', '📚', '🎓']
      const lines: string[] = [
        '',
        '┌─────────────────────────────────────────────────────────────┐',
        '│              EXPERIENCIA PROFESIONAL                        │',
        '└─────────────────────────────────────────────────────────────┘',
        ''
      ]
      
      experience.forEach((exp, index) => {
        lines.push(`  ${icons[index] || '💼'} ${exp.title}`)
        lines.push(`     ${exp.role} | ${exp.period}`)
        lines.push('     ' + '─'.repeat(Math.max(exp.role.length, exp.title.length) + exp.period.length + 3))
        
        // Split desc into multiple lines if needed
        const descLines = exp.desc.match(/.{1,55}/g) || [exp.desc]
        descLines.forEach(line => {
          lines.push(`     • ${line.trim()}`)
        })
        lines.push('')
      })
      
      return lines
    }
  },
  education: {
    description: 'Formación académica',
    execute: () => {
      const lines: string[] = [
        '',
        '┌─────────────────────────────────────────────────────────────┐',
        '│                 FORMACIÓN ACADÉMICA                         │',
        '└─────────────────────────────────────────────────────────────┘',
        ''
      ]
      
      education.forEach((edu, index) => {
        lines.push(`  ${index === 0 ? '🎓' : '📖'} ${edu.title}`)
        lines.push(`     ${edu.desc}`)
        lines.push('     ' + '─'.repeat(edu.title.length))
        lines.push('')
      })
      
      return lines
    }
  },
  contact: {
    description: 'Información de contacto',
    execute: () => {
      const icons: { [key: string]: string } = {
        'LinkedIn': '💼',
        'GitHub': '🐙',
        'Instagram': '📸',
        'Facebook': '📘'
      }
      
      const lines: string[] = [
        '',
        '┌─────────────────────────────────────────────────────────────┐',
        '│                    CONTACTO                                 │',
        '└─────────────────────────────────────────────────────────────┘',
        '',
        '  📧 Email:      santiago@sgomez.dev'
      ]
      
      contactLinks.forEach(link => {
        const icon = icons[link.label] || '🔗'
        const paddedLabel = `${link.label}:`.padEnd(11)
        lines.push(`  ${icon} ${paddedLabel}${link.url.replace('https://', '')}`)
      })
      
      lines.push('')
      
      return lines
    }
  },
  achievements: {
    description: 'Logros y participaciones',
    execute: () => {
      const achievements = [
        { icon: '🏆', text: `Organizador de ${experience.find(e => e.title === 'GDG Santander')?.title || 'GDG Santander'}` },
        { icon: '🎯', text: 'Participante en Hack2Progress' },
        { icon: '🌟', text: `Becario ${experience.find(e => e.title === 'PROFER')?.title} - Universidad Europea del Atlántico` },
        { icon: '📚', text: `Becario ${experience.find(e => e.title === 'FUNIBER')?.title}` },
        { icon: '💻', text: `+${projects.length} proyectos destacados completados` },
        { icon: '🚀', text: 'PWAs y aplicaciones web en producción' },
      ]
      
      const lines: string[] = [
        '',
        '┌─────────────────────────────────────────────────────────────┐',
        '│              LOGROS Y PARTICIPACIONES                       │',
        '└─────────────────────────────────────────────────────────────┘',
        ''
      ]
      
      achievements.forEach(achievement => {
        lines.push(`  ${achievement.icon} ${achievement.text}`)
      })
      
      lines.push('')
      
      return lines
    }
  },
  fun: {
    description: 'Datos curiosos',
    execute: () => {
      const timeline = about.timeline || []
      const firstAge = timeline.length > 0 ? timeline[0].age : 18
      
      return [
        '',
        '┌─────────────────────────────────────────────────────────────┐',
        '│                  DATOS CURIOSOS                             │',
        '└─────────────────────────────────────────────────────────────┘',
        '',
        `  🎮 ${timeline[0]?.desc || 'Comencé a programar a los ' + firstAge + ' años'}`,
        '  🌍 He trabajado con equipos internacionales',
        '  🎨 Me encanta el diseño UI/UX minimalista',
        '  🤖 Apasionado por la automatización',
        `  📱 Fan de las ${technologies.find(t => t.category === 'Mobile & Tools')?.skills.find(s => s.name === 'PWA')?.name || 'PWAs'} y aplicaciones web progresivas`,
        '  🚀 Siempre aprendiendo nuevas tecnologías',
        '  ☕ Café + Código = Vida',
        '',
      ]
    }
  },
  clear: {
    description: 'Limpiar la terminal',
    execute: () => [] // Special case handled in component
  }
}

export default function Terminal() {
  const [history, setHistory] = useState<CommandHistory[]>([
    { input: '', output: WELCOME_MESSAGE }
  ])
  const [currentInput, setCurrentInput] = useState('')
  const [commandHistoryIndex, setCommandHistoryIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-scroll to bottom
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase()
    
    if (trimmedCmd === 'clear') {
      setHistory([{ input: '', output: WELCOME_MESSAGE }])
      return
    }

    let output: string[]

    if (trimmedCmd === '') {
      output = ['']
    } else if (COMMANDS[trimmedCmd as keyof typeof COMMANDS]) {
      output = COMMANDS[trimmedCmd as keyof typeof COMMANDS].execute()
    } else {
      output = [
        '',
        `  ❌ Comando no encontrado: "${trimmedCmd}"`,
        '  Escribe "help" para ver los comandos disponibles.',
        ''
      ]
    }

    setHistory(prev => [...prev, { input: cmd, output }])
    setCurrentInput('')
    setCommandHistoryIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(currentInput)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const commands = history.filter(h => h.input.trim() !== '').map(h => h.input)
      if (commands.length > 0) {
        const newIndex = commandHistoryIndex < commands.length - 1 
          ? commandHistoryIndex + 1 
          : commandHistoryIndex
        setCommandHistoryIndex(newIndex)
        setCurrentInput(commands[commands.length - 1 - newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (commandHistoryIndex > 0) {
        const commands = history.filter(h => h.input.trim() !== '').map(h => h.input)
        const newIndex = commandHistoryIndex - 1
        setCommandHistoryIndex(newIndex)
        setCurrentInput(commands[commands.length - 1 - newIndex])
      } else {
        setCommandHistoryIndex(-1)
        setCurrentInput('')
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const availableCommands = Object.keys(COMMANDS)
      const matches = availableCommands.filter(cmd => 
        cmd.startsWith(currentInput.toLowerCase())
      )
      if (matches.length === 1) {
        setCurrentInput(matches[0])
      }
    }
  }

  const handleTerminalClick = () => {
    inputRef.current?.focus()
  }

  return (
    <div 
      ref={terminalRef}
      onClick={handleTerminalClick}
      className="w-full h-full bg-gray-900 text-green-400 font-mono text-sm p-4 overflow-y-auto cursor-text"
    >
      <div className="space-y-2">
        {history.map((item, index) => (
          <div key={index}>
            {item.input && (
              <div className="flex gap-2">
                <span className="text-blue-400">santiago@sgomez-os</span>
                <span className="text-white">~</span>
                <span className="text-yellow-400">$</span>
                <span className="text-white">{item.input}</span>
              </div>
            )}
            {item.output.map((line, lineIndex) => (
              <div key={lineIndex} className="whitespace-pre">
                {line}
              </div>
            ))}
          </div>
        ))}
        
        {/* Current input line */}
        <div className="flex gap-2">
          <span className="text-blue-400">santiago@sgomez-os</span>
          <span className="text-white">~</span>
          <span className="text-yellow-400">$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-white caret-green-400"
            autoFocus
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  )
}
