import { useState } from 'react'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants'
import { todayLocal as today } from '../format'

export default function TransactionForm({ onAdd }) {
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0])
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(today)
  const [error, setError] = useState('')

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  function changeType(next) {
    setType(next)
    setCategory((next === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES)[0])
  }

  function submit(e) {
    e.preventDefault()
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) {
      setError('Enter an amount greater than 0.')
      return
    }
    if (!date) {
      setError('Pick a date.')
      return
    }
    onAdd({
      id: crypto.randomUUID(),
      type,
      amount: Math.round(value * 100) / 100,
      category,
      description: description.trim(),
      date,
    })
    setAmount('')
    setCategory(categories[0])
    setDescription('')
    setError('')
  }

  return (
    <form className="panel form" onSubmit={submit}>
      <h2>Add transaction</h2>
      <div className="toggle" role="group" aria-label="Transaction type">
        <button
          type="button"
          className={type === 'expense' ? 'active expense' : ''}
          aria-pressed={type === 'expense'}
          onClick={() => changeType('expense')}
        >
          Expense
        </button>
        <button
          type="button"
          className={type === 'income' ? 'active income' : ''}
          aria-pressed={type === 'income'}
          onClick={() => changeType('income')}
        >
          Income
        </button>
      </div>

      <label>
        Amount
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
        />
      </label>

      <label>
        Category
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>

      <label>
        Description
        <input
          type="text"
          value={description}
          maxLength={80}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional"
        />
      </label>

      <label>
        Date
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="primary">
        Add
      </button>
    </form>
  )
}
