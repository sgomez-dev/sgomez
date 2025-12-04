'use client'

export default function Docs() {
  return (
    <div className="h-full bg-gradient-to-br from-orange-50 to-amber-50 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-8">
            <h1 className="text-4xl font-bold mb-2">📄 Documentación</h1>
            <p className="text-orange-100">Guía completa del proyecto</p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🚀 Inicio Rápido</h2>
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-orange-500">
                <code className="text-sm text-gray-700">
                  npm install<br/>
                  npm run dev
                </code>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 Tabla de Contenidos</h2>
              <ul className="space-y-2">
                <li className="pl-4 border-l-2 border-orange-300 hover:border-orange-500 transition-colors">
                  <a href="#" className="text-orange-600 hover:underline">1. Introducción</a>
                </li>
                <li className="pl-4 border-l-2 border-orange-300 hover:border-orange-500 transition-colors">
                  <a href="#" className="text-orange-600 hover:underline">2. Instalación</a>
                </li>
                <li className="pl-4 border-l-2 border-orange-300 hover:border-orange-500 transition-colors">
                  <a href="#" className="text-orange-600 hover:underline">3. Configuración</a>
                </li>
                <li className="pl-4 border-l-2 border-orange-300 hover:border-orange-500 transition-colors">
                  <a href="#" className="text-orange-600 hover:underline">4. API Reference</a>
                </li>
                <li className="pl-4 border-l-2 border-orange-300 hover:border-orange-500 transition-colors">
                  <a href="#" className="text-orange-600 hover:underline">5. Ejemplos</a>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🛠️ Tecnologías</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-900 mb-2">Frontend</h3>
                  <p className="text-sm text-blue-700">React, Next.js, TypeScript</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                  <h3 className="font-bold text-green-900 mb-2">Backend</h3>
                  <p className="text-sm text-green-700">Node.js, Express, PostgreSQL</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📚 Recursos</h2>
              <div className="space-y-3">
                <a href="#" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">📖 Guía de Usuario</span>
                    <span className="text-gray-400">→</span>
                  </div>
                </a>
                <a href="#" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">🎓 Tutoriales</span>
                    <span className="text-gray-400">→</span>
                  </div>
                </a>
                <a href="#" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">💬 FAQ</span>
                    <span className="text-gray-400">→</span>
                  </div>
                </a>
              </div>
            </section>

            <section className="bg-orange-50 rounded-lg p-6 border-2 border-orange-200">
              <h3 className="font-bold text-orange-900 mb-2">💡 ¿Necesitas ayuda?</h3>
              <p className="text-orange-700 text-sm">
                Si tienes alguna pregunta o problema, no dudes en contactarnos o abrir un issue en GitHub.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
