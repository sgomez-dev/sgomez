'use client'

import { motion } from 'framer-motion'

const items = [
  {
    name: 'NudaUI',
    tagline: 'Librería de componentes UI copy-paste',
    desc: 'Creador y único mantenedor. 800+ animaciones y componentes UI framework-agnósticos en HTML + CSS (JS solo cuando hace falta). Cero dependencias, cero build: copias, pegas y funciona en React, Vue, Svelte, Astro, Laravel, Django o un .html.',
    stats: [
      { value: '800+', label: 'componentes' },
      { value: '66', label: 'categorías' },
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
