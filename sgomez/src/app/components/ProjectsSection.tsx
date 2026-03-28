'use client'

import { motion } from 'framer-motion'
import { projects } from '../content'

const featuredProjects = projects.slice(0, 3)
const otherProjects = projects.slice(3)

export default function ProjectsSection() {
  return (
    <section id="projects" className="py-24 md:py-32 relative">
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-indigo-600/[0.03] rounded-full blur-[128px] pointer-events-none" />
      <div className="container-custom relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-16">
          <p className="text-violet-400 text-sm font-mono tracking-wider uppercase mb-3">Portafolio</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-3">Proyectos Destacados</h2>
          <p className="text-gray-500 font-light max-w-lg">Una seleccion de proyectos que reflejan mi experiencia full-stack, desde PWAs hasta extensiones de Chrome.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-5 mb-6">
          {featuredProjects.map((project, i) => (
            <motion.a key={i} href={project.link} target="_blank" rel="noopener noreferrer" initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.12 }}
              className="group glass rounded-2xl p-6 md:p-7 card-hover relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-600/[0.08] rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-5"><div className="w-2 h-2 rounded-full bg-violet-400" /><span className="text-violet-400 text-[10px] font-mono uppercase tracking-wider">Destacado</span></div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-violet-300 transition-colors leading-tight">{project.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-light mb-5 flex-1">{project.desc}</p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {project.stack.split(',').map((tech, idx) => (
                    <span key={idx} className="text-[10px] px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/15 font-mono">{tech.trim()}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-gray-600 group-hover:text-violet-400 transition-colors text-sm">
                  <span className="font-light">Ver proyecto</span>
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {otherProjects.map((project, i) => (
            <motion.a key={i} href={project.link} target="_blank" rel="noopener noreferrer" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group glass rounded-xl p-5 card-hover relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-violet-600/[0.05] rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                    <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>
                  </div>
                  <svg className="w-3.5 h-3.5 text-gray-700 group-hover:text-violet-400 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5 group-hover:text-violet-300 transition-colors">{project.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed font-light mb-3 line-clamp-2">{project.desc}</p>
                <div className="flex flex-wrap gap-1">
                  {project.stack.split(',').slice(0, 3).map((tech, idx) => (
                    <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.03] text-gray-600 font-mono">{tech.trim()}</span>
                  ))}
                </div>
              </div>
            </motion.a>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center">
          <a href="https://github.com/sgomez-dev" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 text-sm text-gray-500 hover:text-violet-400 transition-colors font-light group">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            Ver los 40+ repositorios en GitHub
            <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
