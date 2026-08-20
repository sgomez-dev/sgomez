'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { skyquetz } from '../content'

/**
 * SkyQuetz Consulting — la única sección del portafolio que no habla de un
 * proyecto, sino de una empresa. Va en oro y esmeralda en vez del violeta del
 * resto: es otra marca, y pintarla con los colores del portafolio la
 * convertiría en "un proyecto más" cuando el punto es justo que no lo es.
 *
 * Los tres enlaces de aquí (skyquetz.com y los dos subdominios de producto)
 * son enlaces reales, no adorno: skyquetz.com ya declara a Santiago como
 * cofundador con `sameAs: ['https://sgomez.dev']` en su JSON-LD, y hasta ahora
 * sgomez.dev no devolvía nada. Un enlace en un solo sentido lo tratan como una
 * afirmación sin confirmar; en los dos, como una relación entre entidades.
 *
 * Relación, no identidad: este portafolio es una persona y SkyQuetz es una
 * empresa de cuatro socios. El reflejo en datos estructurados (seo.ts, nodo
 * #skyquetz-org) las declara como dos entidades unidas por founder/worksFor, y
 * `skyquetz.com` NO entra en el `sameAs` de la persona.
 */
export default function SkyQuetzSection() {
  return (
    <section id="skyquetz" className="py-24 md:py-32 relative">
      {/* Resplandor esmeralda, no violeta: el mismo recurso visual que las
          demás secciones, en el color de la otra marca. */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-[#0e5c4c]/[0.07] rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[420px] h-[420px] bg-[#c8962b]/[0.04] rounded-full blur-[120px] pointer-events-none" />

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="text-[#e0b661] text-sm font-mono tracking-wider uppercase mb-3">
            {skyquetz.role}
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-3">
            No solo escribo el código. También la empresa.
          </h2>
          <p className="text-gray-500 font-light max-w-xl">
            Cofundé una consultora de software a medida. Es la diferencia entre entregar una
            tarea y responder de un resultado.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="skyquetz-card rounded-2xl overflow-hidden"
        >
          <div className="skyquetz-rule" />
          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-8 lg:gap-10 p-6 md:p-9">
            {/* Identidad de la empresa */}
            <div className="flex flex-col">
              <a
                href={skyquetz.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex self-start rounded-xl transition-opacity hover:opacity-80"
                aria-label={`${skyquetz.name} — ${skyquetz.cta}`}
              >
                <Image
                  src={skyquetz.logo}
                  alt={skyquetz.logoAlt}
                  width={425}
                  height={253}
                  className="h-14 md:h-16 w-auto"
                />
              </a>

              <p className="mt-5 text-[#e0b661] text-sm font-light italic">
                {skyquetz.slogan}
              </p>

              <p className="mt-4 text-gray-400 text-sm leading-relaxed font-light">
                {skyquetz.desc}
              </p>
              <p className="mt-3 text-gray-300 text-sm leading-relaxed font-light">
                {skyquetz.myPart}
              </p>

              <div className="grid grid-cols-3 gap-3 mt-7">
                {skyquetz.stats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl bg-white/[0.03] border border-[#c8962b]/[0.14] px-3 py-3 text-center"
                  >
                    <div className="text-xl font-bold text-white tabular-nums">{s.value}</div>
                    <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mt-0.5">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              <a
                href={skyquetz.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-7 inline-flex items-center gap-2 self-start rounded-full border border-[#c8962b]/30 bg-[#c8962b]/[0.07] px-5 py-2.5 text-sm text-[#e0b661] transition-colors hover:border-[#c8962b]/60 hover:bg-[#c8962b]/[0.12]"
              >
                <span className="font-light">{skyquetz.cta}</span>
                <svg
                  className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </a>
            </div>

            {/* Productos propios de la casa */}
            <div className="flex flex-col gap-4 lg:border-l lg:border-[#c8962b]/[0.12] lg:pl-10">
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                Productos propios
              </p>
              {skyquetz.products.map((prod, i) => (
                <motion.a
                  key={prod.name}
                  href={prod.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                  className="group rounded-xl bg-white/[0.02] border border-white/[0.06] p-5 transition-colors hover:border-[#c8962b]/30 flex-1 flex flex-col"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#c8962b]" />
                    <span className="text-[#e0b661] text-[10px] font-mono uppercase tracking-wider">
                      {prod.tagline}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#e0b661] transition-colors">
                    {prod.name}
                  </h3>
                  <p className="text-gray-400 text-[13px] leading-relaxed font-light flex-1">
                    {prod.desc}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {prod.stack.map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] px-2.5 py-1 rounded-full bg-[#0e5c4c]/25 text-[#e0b661] border border-[#c8962b]/15 font-mono"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-4 text-gray-600 group-hover:text-[#e0b661] transition-colors text-xs">
                    <span className="font-light">{prod.cta}</span>
                    <svg
                      className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                    </svg>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
