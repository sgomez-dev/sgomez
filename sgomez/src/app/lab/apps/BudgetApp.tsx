'use client'

import { useState } from 'react'

interface Transaction {
  id: number
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
}

export default function BudgetApp() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, description: 'Salario', amount: 3000, type: 'income', category: 'Trabajo' },
    { id: 2, description: 'Renta', amount: -800, type: 'expense', category: 'Vivienda' },
    { id: 3, description: 'Supermercado', amount: -150, type: 'expense', category: 'Comida' },
    { id: 4, description: 'Freelance', amount: 500, type: 'income', category: 'Trabajo' },
  ])

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'income' | 'expense'>('expense')

  const addTransaction = () => {
    if (description.trim() && amount) {
      const newTransaction: Transaction = {
        id: Date.now(),
        description,
        amount: type === 'income' ? parseFloat(amount) : -parseFloat(amount),
        type,
        category: type === 'income' ? 'Trabajo' : 'General',
      }
      setTransactions([...transactions, newTransaction])
      setDescription('')
      setAmount('')
    }
  }

  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = Math.abs(
    transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  )

  const balance = totalIncome - totalExpenses

  return (
    <div className="h-full bg-gradient-to-br from-yellow-50 to-orange-50 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">💰 Control de Presupuesto</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600 text-sm mb-2">Balance Total</p>
            <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${balance.toFixed(2)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg p-6 text-white">
            <p className="text-green-100 text-sm mb-2">Ingresos</p>
            <p className="text-3xl font-bold">${totalIncome.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
            <p className="text-red-100 text-sm mb-2">Gastos</p>
            <p className="text-3xl font-bold">${totalExpenses.toFixed(2)}</p>
          </div>
        </div>

        {/* Add Transaction */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Agregar Transacción</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción"
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Monto"
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setType('income')}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                type === 'income'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Ingreso
            </button>
            <button
              onClick={() => setType('expense')}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                type === 'expense'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Gasto
            </button>
            <button
              onClick={addTransaction}
              className="px-8 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
            >
              Agregar
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Transacciones</h2>
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-800">{transaction.description}</p>
                  <p className="text-sm text-gray-500">{transaction.category}</p>
                </div>
                <p className={`text-xl font-bold ${
                  transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.amount > 0 ? '+' : ''}${transaction.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
