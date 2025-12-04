'use client'

import { useState } from 'react'

export default function Browser() {
  const [url, setUrl] = useState('https://github.com/sgomez-dev')
  const [currentUrl, setCurrentUrl] = useState('https://github.com/sgomez-dev')

  const handleNavigate = () => {
    setCurrentUrl(url)
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Browser toolbar */}
      <div className="bg-gray-100 border-b border-gray-300 p-3 flex gap-2">
        <button className="px-3 py-1 hover:bg-gray-200 rounded">←</button>
        <button className="px-3 py-1 hover:bg-gray-200 rounded">→</button>
        <button className="px-3 py-1 hover:bg-gray-200 rounded">⟳</button>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleNavigate()}
          className="flex-1 px-4 py-1 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Buscar o escribir URL"
        />
        <button className="px-3 py-1 hover:bg-gray-200 rounded">⋮</button>
      </div>

      {/* Browser content */}
      <div className="flex-1 overflow-auto bg-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">🌐 Navegador Web</h1>
            <p className="text-gray-600">Simulación de navegador - Versión demo</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 shadow-sm mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">URL actual:</h2>
            <div className="bg-white px-4 py-3 rounded-lg border-2 border-blue-200 font-mono text-blue-600">
              {currentUrl}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-gray-800 mb-2">🔗 Enlaces rápidos</h3>
              <ul className="text-sm text-blue-600 space-y-1">
                <li className="hover:underline cursor-pointer">GitHub</li>
                <li className="hover:underline cursor-pointer">LinkedIn</li>
                <li className="hover:underline cursor-pointer">Portfolio</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-gray-800 mb-2">📚 Marcadores</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>React Docs</li>
                <li>TypeScript</li>
                <li>Next.js</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
