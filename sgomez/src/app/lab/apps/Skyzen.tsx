'use client'

export default function Skyzen() {
  return (
    <div className="h-full bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 mb-4">
            ☁️ Skyzen
          </h1>
          <p className="text-gray-600 text-lg">Aplicación de gestión en la nube</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">📁</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Archivos</h3>
            <p className="text-gray-600">Gestiona tus archivos en la nube de forma segura</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Sincronización</h3>
            <p className="text-gray-600">Sincroniza automáticamente entre dispositivos</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Seguridad</h3>
            <p className="text-gray-600">Encriptación de extremo a extremo</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Colaboración</h3>
            <p className="text-gray-600">Comparte y colabora en tiempo real</p>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Estado del Sistema</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-cyan-100 text-sm">Almacenamiento</p>
              <p className="text-2xl font-bold">15.3 GB / 100 GB</p>
            </div>
            <div>
              <p className="text-cyan-100 text-sm">Archivos</p>
              <p className="text-2xl font-bold">1,234</p>
            </div>
            <div>
              <p className="text-cyan-100 text-sm">Compartidos</p>
              <p className="text-2xl font-bold">42</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
