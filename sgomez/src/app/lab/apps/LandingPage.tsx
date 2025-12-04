'use client'

export default function LandingPage() {
  return (
    <div className="h-full bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-auto">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-4xl">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 mb-6">
            🎨 Landing Page
          </h1>
          <p className="text-2xl text-gray-700 mb-8">
            Crea experiencias digitales increíbles
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-bold text-lg hover:shadow-2xl transition-shadow">
              Comenzar
            </button>
            <button className="px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg border-2 border-purple-600 hover:bg-purple-50 transition-colors">
              Saber Más
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">
            Características Principales
          </h2>
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Rápido</h3>
              <p className="text-gray-600">Rendimiento optimizado para la mejor experiencia</p>
            </div>
            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Preciso</h3>
              <p className="text-gray-600">Diseño detallado y atención a cada píxel</p>
            </div>
            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Escalable</h3>
              <p className="text-gray-600">Crece junto con tu negocio sin límites</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-8 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">¿Listo para empezar?</h2>
          <p className="text-xl mb-8 text-purple-100">
            Únete a miles de usuarios que ya confían en nosotros
          </p>
          <button className="px-12 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:shadow-2xl transition-shadow">
            Crear Cuenta Gratis
          </button>
        </div>
      </section>
    </div>
  )
}
