'use client'

import { useState } from 'react'

type Algorithm = 'bubble' | 'quick' | 'merge' | 'insertion'

export default function Sortlab() {
  const [array, setArray] = useState([64, 34, 25, 12, 22, 11, 90, 88, 45, 50])
  const [algorithm, setAlgorithm] = useState<Algorithm>('bubble')
  const [isSorting, setIsSorting] = useState(false)

  const generateRandomArray = () => {
    const newArray = Array.from({ length: 10 }, () => Math.floor(Math.random() * 100))
    setArray(newArray)
  }

  const sortArray = () => {
    setIsSorting(true)
    const sorted = [...array].sort((a, b) => a - b)
    setTimeout(() => {
      setArray(sorted)
      setIsSorting(false)
    }, 1000)
  }

  const maxValue = Math.max(...array)

  return (
    <div className="h-full bg-gradient-to-br from-purple-50 to-pink-50 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-8">
          📊 Sortlab
        </h1>

        {/* Algorithm Selector */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Seleccionar Algoritmo</h2>
          <div className="grid grid-cols-4 gap-4">
            {['bubble', 'quick', 'merge', 'insertion'].map((algo) => (
              <button
                key={algo}
                onClick={() => setAlgorithm(algo as Algorithm)}
                className={`py-3 rounded-lg font-medium transition-all capitalize ${
                  algorithm === algo
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {algo}
              </button>
            ))}
          </div>
        </div>

        {/* Visualization */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Visualización</h2>
          <div className="flex items-end justify-center gap-2 h-64 bg-gray-50 rounded-lg p-4">
            {array.map((value, index) => (
              <div
                key={index}
                className="flex-1 bg-gradient-to-t from-purple-600 to-pink-500 rounded-t transition-all duration-300 flex items-end justify-center pb-2"
                style={{ height: `${(value / maxValue) * 100}%` }}
              >
                <span className="text-white text-xs font-bold">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex gap-4">
            <button
              onClick={generateRandomArray}
              disabled={isSorting}
              className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🎲 Generar Aleatorio
            </button>
            <button
              onClick={sortArray}
              disabled={isSorting}
              className="flex-1 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSorting ? '⏳ Ordenando...' : '▶️ Ordenar'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6">
          <h3 className="font-bold text-gray-800 mb-2">Algoritmo: {algorithm.toUpperCase()}</h3>
          <p className="text-gray-600 text-sm">
            Visualiza diferentes algoritmos de ordenamiento en acción
          </p>
        </div>
      </div>
    </div>
  )
}
