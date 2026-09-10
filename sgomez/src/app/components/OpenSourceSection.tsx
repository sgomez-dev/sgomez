'use client'

import { motion } from 'framer-motion'
import { CLAUDE_CANVAS } from '../seo'

/**
 * Los datos de la carta destacada NO se escriben aquí.
 *
 * Salen de `CLAUDE_CANVAS` en seo.ts, que es el mismo objeto del que comen el
 * JSON-LD, /llms.txt y la entrada de `projects`. Es el dato que más veces se
 * repite en el sitio —cuatro superficies— y por tanto el que más fácil se
 * contradice: una web que dice nueve tipos de panel y un grafo que dice ocho
 * es peor que no declarar ninguno de los dos.
 */
const featured = {
  name: CLAUDE_CANVAS.name,
  tagline: 'Plugin de Claude Code',
  lead: 'Claude deja de describir. Claude empieza a enseñar.',
  desc: 'Le da a Claude Code una pantalla propia: abre un panel interactivo de terminal junto a la conversación —eliges un fichero, apruebas tres hunks de un diff y rechazas el cuarto, rellenas cinco campos— y tu respuesta le vuelve como un valor exacto, no como prosa que tenga que interpretar.',
  desc2: 'Partí del proof of concept de David Siegel y lo llevé a algo que aguanta el uso diario: un solo transporte de IPC donde había dos incompatibles y una de ellas no entregaba la respuesta a nadie, cuatro primitivas reutilizables, composición en un mismo panel, imágenes a resolución real en kitty, iTerm2 y Sixel, y una inyección de comandos cerrada por el camino.',
  stats: [
    { value: String(CLAUDE_CANVAS.kinds), label: 'tipos de panel' },
    { value: CLAUDE_CANVAS.tests, label: 'tests' },
    { value: '3', label: 'sistemas en CI' },
    { value: 'MIT', label: 'licencia' },
  ],
  stack: ['TypeScript', 'Bun', 'React', 'Ink', 'tmux', 'IPC'],
  href: CLAUDE_CANVAS.url,
  cta: 'claude-canvas.sgomez.dev',
  repo: CLAUDE_CANVAS.repo,
  repoLabel: 'sgomez-dev/claude-canvas',
}

// Las opciones del panel de ejemplo. Son ficheros reales del repositorio,
// no `foo.ts`: el ejemplo tiene que parecerse a lo que la herramienta hace.
const PANE_OPTIONS = [
  'canvas/src/runtime/server.ts',
  'canvas/src/host/tmux.ts',
  'canvas/src/canvases/diff.tsx',
]

const items = [
  {
    name: 'NudaUI',
    tagline: 'Librería de componentes UI copy-paste',
    desc: 'Creador y único mantenedor. 1.000+ componentes y animaciones UI framework-agnósticos en HTML + CSS (JS solo cuando hace falta), organizados en 81 categorías. Cero dependencias, cero build: copias, pegas y funciona en React, Vue, Svelte, Astro, Laravel, Django o un .html.',
    stats: [
      { value: '1.000+', label: 'componentes' },
      { value: '81', label: 'categorías' },
      { value: 'MIT', label: 'licencia' },
    ],
    stack: ['Next.js', 'TypeScript', 'CSS', 'framework-agnostic'],
    href: 'https://nudaui.dev',
    cta: 'nudaui.dev',
  },
  {
    name: 'sgomez-cli',
    tagline: 'Toolkit de scaffolding full-stack',
    desc: 'CLI open-source publicada en npm que inicializa, configura y despliega proyectos full-stack en 14 frameworks (React, Next.js, Vue, Nuxt, SvelteKit, Astro, Express, Hono, FastAPI, Django, Go…) con Docker, CI/CD, auth, base de datos y tests en un solo comando.',
    stats: [
      { value: '14', label: 'frameworks' },
      { value: 'npm', label: 'publicada' },
      { value: '1 cmd', label: 'a producción' },
    ],
    stack: ['Node.js', 'TypeScript', 'CLI', 'DevOps'],
    href: 'https://cli.sgomez.dev',
    cta: 'cli.sgomez.dev',
  },
]

export default function OpenSourceSection() {
  return (
    <section id="open-source" className="py-24 md:py-32 relative">
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-violet-600/[0.04] rounded-full blur-[128px] pointer-events-none" />
      <div className="container-custom relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-16">
          <p className="text-violet-400 text-sm font-mono tracking-wider uppercase mb-3">Open Source</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-3">Proyectos open source que mantengo</h2>
          <p className="text-gray-500 font-light max-w-lg">Herramientas que uso a diario y comparto con la comunidad — usadas por desarrolladores de cualquier stack.</p>
        </motion.div>

        {/* Destacado. Va aparte y a todo el ancho porque es el proyecto con
            más que enseñar: el panel de la derecha explica en cinco líneas lo
            que el párrafo tarda tres en decir. */}
        <motion.article
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="group glass rounded-2xl p-6 md:p-10 relative overflow-hidden mb-5"
        >
          <div className="absolute -top-32 -left-24 w-[28rem] h-[28rem] bg-violet-600/[0.10] rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-10 items-start">
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="flex items-center gap-2 rounded-full bg-violet-500/10 border border-violet-500/20 px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                  <span className="text-violet-300 text-[10px] font-mono uppercase tracking-wider">{featured.tagline}</span>
                </span>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/[0.04] text-gray-400 border border-white/[0.08] font-mono uppercase tracking-wider">Destacado</span>
              </div>

              <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">{featured.name}</h3>
              <p className="text-violet-300/90 font-light mb-5 text-base md:text-lg">{featured.lead}</p>

              <p className="text-gray-400 text-sm leading-relaxed font-light mb-4">{featured.desc}</p>
              <p className="text-gray-500 text-sm leading-relaxed font-light mb-6">{featured.desc2}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {featured.stats.map((s) => (
                  <div key={s.label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-3 text-center">
                    <div className="text-xl font-bold text-white tabular-nums">{s.value}</div>
                    <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5 mb-6">
                {featured.stack.map((tech) => (
                  <span key={tech} className="text-[10px] px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/15 font-mono">{tech}</span>
                ))}
              </div>

              {/* Dos destinos, dos enlaces. La carta entera no puede ser un
                  <a>: envolver un enlace dentro de otro es HTML inválido y el
                  repositorio es tan visitable como la landing. */}
              <div className="flex flex-wrap items-center gap-3 mt-auto">
                <a
                  href={featured.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/25 px-4 py-2.5 text-sm text-violet-200 hover:text-white transition-colors"
                >
                  <span className="font-light">{featured.cta}</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>
                </a>
                <a
                  href={featured.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] px-4 py-2.5 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" /></svg>
                  <span className="font-mono text-xs">{featured.repoLabel}</span>
                </a>
              </div>
            </div>

            {/* El panel. `aria-hidden` porque es una ilustración del producto:
                lo que dice ya está en el párrafo de al lado, y a un lector de
                pantalla no le aporta nada.

                El marco es un borde de CSS y no caracteres box-drawing: Geist
                Mono no trae esos glifos, el navegador cae a otra fuente con
                otras métricas y las esquinas dejan de cuadrar con los lados.
                Un dibujo hecho de caracteres solo se sostiene si TODOS los
                caracteres los pinta la misma fuente. */}
            <div className="rounded-xl border border-white/[0.08] bg-black/60 overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
                <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                <span className="ml-2 text-[10px] font-mono text-gray-600 tracking-wider">tmux — claude-canvas</span>
              </div>
              <div aria-hidden="true" className="p-4 md:p-5 font-mono text-[11px] md:text-xs leading-relaxed">
                <p className="text-gray-500 whitespace-nowrap overflow-x-auto">
                  <span className="text-violet-400">$</span>{' '}
                  claude &quot;¿cuál de estos refactorizo?&quot;
                </p>

                <div className="relative mt-4 mb-4 rounded-md border border-violet-400/30">
                  <span className="absolute -top-[0.6em] left-3 px-1.5 bg-black text-violet-400/80 text-[10px] tracking-wider">picker</span>
                  <ul className="py-3 px-3 space-y-1 overflow-x-auto">
                    {PANE_OPTIONS.map((option, i) => (
                      <li
                        key={option}
                        className={
                          i === 0
                            ? 'text-violet-200 whitespace-nowrap'
                            : 'text-gray-500 whitespace-nowrap'
                        }
                      >
                        <span className="inline-block w-4 text-violet-400">{i === 0 ? '▸' : ''}</span>
                        {option}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-violet-200/70 overflow-x-auto">
                  <span className="text-gray-600">→</span>{' '}
                  {'{"status":"selected","data":{"selectedIds":["server.ts"]}}'}
                </p>
              </div>
              <div className="px-4 md:px-5 py-3 border-t border-white/[0.06] bg-white/[0.02]">
                <p className="text-[11px] text-gray-500 font-light">
                  Se instala desde Claude Code con <code className="text-violet-300/80 font-mono">{CLAUDE_CANVAS.install}</code>. Necesita Bun y una sesión de tmux 3.1+ (o Windows Terminal).
                </p>
              </div>
            </div>
          </div>
        </motion.article>

        <div className="grid md:grid-cols-2 gap-5">
          {items.map((it, i) => (
            <motion.a
              key={it.name}
              href={it.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="group glass rounded-2xl p-6 md:p-8 card-hover relative overflow-hidden flex flex-col"
            >
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-600/[0.08] rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-violet-400" />
                  <span className="text-violet-400 text-[10px] font-mono uppercase tracking-wider">{it.tagline}</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-violet-300 transition-colors">{it.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-light mb-6 flex-1">{it.desc}</p>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {it.stats.map((s) => (
                    <div key={s.label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-3 text-center">
                      <div className="text-xl font-bold text-white tabular-nums">{s.value}</div>
                      <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {it.stack.map((tech) => (
                    <span key={tech} className="text-[10px] px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/15 font-mono">{tech}</span>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-gray-600 group-hover:text-violet-400 transition-colors text-sm">
                  <span className="font-light">{it.cta}</span>
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}
