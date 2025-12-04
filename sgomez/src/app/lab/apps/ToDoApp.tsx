'use client'

import { useState } from 'react'

interface Todo {
  id: number
  text: string
  completed: boolean
}

export default function ToDoApp() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: 'Diseñar interfaz de usuario', completed: true },
    { id: 2, text: 'Implementar funcionalidad drag & drop', completed: true },
    { id: 3, text: 'Agregar animaciones', completed: false },
    { id: 4, text: 'Optimizar rendimiento', completed: false },
  ])
  const [newTodo, setNewTodo] = useState('')

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }])
      setNewTodo('')
    }
  }

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const completedCount = todos.filter(t => t.completed).length

  return (
    <div className="h-full bg-gradient-to-br from-green-50 to-emerald-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6">
            <h1 className="text-3xl font-bold mb-2">✓ Lista de Tareas</h1>
            <p className="text-green-100">
              {completedCount} de {todos.length} tareas completadas
            </p>
          </div>

          {/* Add todo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                placeholder="Agregar nueva tarea..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={addTodo}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Agregar
              </button>
            </div>
          </div>

          {/* Todo list */}
          <div className="p-6 space-y-2">
            {todos.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-lg">No hay tareas pendientes</p>
                <p className="text-sm">¡Agrega una nueva tarea para comenzar!</p>
              </div>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`
                    flex items-center gap-3 p-4 rounded-lg border-2 transition-all
                    ${todo.completed 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-gray-200 hover:border-green-300'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="w-5 h-5 text-green-500 rounded focus:ring-green-500"
                  />
                  <span
                    className={`
                      flex-1 text-lg
                      ${todo.completed 
                        ? 'line-through text-gray-400' 
                        : 'text-gray-800'
                      }
                    `}
                  >
                    {todo.text}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="px-3 py-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
