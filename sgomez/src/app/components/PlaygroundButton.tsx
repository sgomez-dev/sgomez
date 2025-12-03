'use client'

export default function PlaygroundButton() {
  return (
    <div className="flex justify-center my-20 pb-20">
      <a 
        href="/lab" 
        className="group relative backdrop-blur-sm bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 px-12 py-5 rounded-2xl text-xl font-bold transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 hover:scale-105 border border-purple-400/30 overflow-hidden"
      >
        <span className="relative z-10">Ir al Playground</span>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </a>
    </div>
  )
}