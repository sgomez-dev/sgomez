'use client'

export default function PlaygroundButton() {
  return (
    <>
      {/* Botón flotante fijo */}
      <a 
        href="/lab" 
        className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group flex items-center gap-2"
        title="Ir a SGOMEZ-OS"
      >
        <span className="text-2xl">🖥️</span>
        <span className="hidden group-hover:inline-block text-sm font-medium whitespace-nowrap">SGOMEZ-OS</span>
      </a>

      {/* Sección existente */}
      <div className="py-20">
        <div className="container-custom text-center">
          <a 
            href="/lab" 
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-lg text-lg font-medium transition-colors duration-200"
          >
            Ir al Playground
          </a>
        </div>
      </div>
    </>
  )
}