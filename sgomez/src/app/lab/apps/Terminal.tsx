'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { t } from '@/lib/content/localized'
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
      const descriptionLines = t(about.description, 'es').trim().split('\n').map(line => `  ${line}`)
      return [
        '',
        '┌─────────────────────────────────────────────────────────────┐',
        '│                      SOBRE MÍ                               │',
        '└─────────────────────────────────────────────────────────────┘',
        '',
        `  Nombre: ${hero.name}`,
        `  Rol: ${t(hero.title, 'es').split('|')[0].trim()} | ${t(hero.title, 'es').split('|')[1].trim()}`,
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
      `  > ${t(hero.title, 'es').split('|')[1].trim()}`,
      '  > Tech Enthusiast',
      '  > Community Organizer',
      ''
    ]
  },
  skills: {
    description: 'Stack tecnológico',
    execute: () => {
      const lines: string[] = [
        '',
        '┌─────────────────────────────────────────────────────────────┐',
        '│                  STACK TECNOLÓGICO                          │',
        '└─────────────────────────────────────────────────────────────┘',
        ''
      ]
      
      technologies.forEach((category, index) => {
        if (index > 0) {
          // Separador visual entre categorías de skills
          lines.push('  ' + '─'.repeat(55))
          lines.push('')
        }
        lines.push(`  ${t(category.category, 'es') === 'Frontend' ? '🎨' : t(category.category, 'es') === 'Backend' ? '⚙️' : t(category.category, 'es') === 'DevOps & Cloud' ? '☁️' : '📱'} ${t(category.category, 'es').toUpperCase()}`)
        lines.push('  ' + '─'.repeat(t(category.category, 'es').length + 2))
        category.skills.forEach(skill => {
          const paddedName = `${skill.icon} ${skill.name}`.padEnd(18)
          const separator = '--'
          const yearsLabel = `${skill.years} años`
          lines.push(`  ${paddedName} ${separator}  ${yearsLabel}`)
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
        lines.push(`     ${t(project.desc, 'es')}`)
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
        lines.push(`  ${icons[index] || '💼'} ${exp.organization} - ${t(exp.location, 'es')}`)
        lines.push(`     ${t(exp.role, 'es')} | ${t(exp.period, 'es')}`)
        lines.push('     ' + '─'.repeat(Math.max(t(exp.role, 'es').length, `${exp.organization} - ${t(exp.location, 'es')}`.length) + t(exp.period, 'es').length + 3))
        
        // Split desc into multiple lines if needed
        const descLines = t(exp.desc, 'es').match(/.{1,55}/g) || [t(exp.desc, 'es')]
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
        lines.push(`     ${t(edu.desc, 'es')}`)
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
        { icon: '🏆', text: `Organizador de ${experience.find(e => e.organization === 'GDG Santander')?.organization || 'GDG Santander'}` },
        { icon: '🎯', text: 'Participante en Hack2Progress' },
        { icon: '🌟', text: `Becario ${experience.find(e => e.organization === 'PROFER')?.organization} - Universidad Europea del Atlántico` },
        { icon: '📚', text: `Becario ${experience.find(e => e.organization === 'FUNIBER')?.organization}` },
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
      const firstYear = timeline.length > 0 ? timeline[0].year : '2021'
      
      return [
        '',
        '┌─────────────────────────────────────────────────────────────┐',
        '│                  DATOS CURIOSOS                             │',
        '└─────────────────────────────────────────────────────────────┘',
        '',
        `  🎮 ${timeline[0]?.title || 'Comencé a programar en ' + firstYear}`,
        '  🌍 He trabajado con equipos internacionales',
        '  🎨 Me encanta el diseño UI/UX minimalista',
        '  🤖 Apasionado por la automatización',
        '  📱 Fan de las PWAs y aplicaciones web progresivas',
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
