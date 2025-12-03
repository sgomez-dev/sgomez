'use client'

export default function PlaygroundButton() {
  return (
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
  )
}