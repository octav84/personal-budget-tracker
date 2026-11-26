import { useState } from 'react'
import { formatMoney } from '../format'

export default function BudgetProgress({
  month,
  onMonthChange,
  spent,
  budget,
  onSetBudget,
  onClearBudget,
}) {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')

  function submit(e) {
    e.preventDefault()
    if (draft.trim() === '') {
      setError('Enter a budget amount.')
      return
    }
    const value = Number(draft)
    if (!Number.isFinite(value) || value <= 0) {
      setError('Enter a budget greater than 0.')
      return
    }
    onSetBudget(Math.round(value * 100) / 100)
    setDraft('')
    setError('')
  }

  const hasBudget = budget != null && budget > 0
  // compare in whole cents so float sums like 0.1 + 0.2 don't count as over 0.30
  const over = hasBudget && Math.round(spent * 100) > Math.round(budget * 100)
  const pct = hasBudget ? (spent / budget) * 100 : 0
  const remaining = hasBudget ? budget - spent : 0

  return (
    <section className="panel budget">
      <div className="budget-head">
        <h2>Monthly budget</h2>
        <input
          type="month"
          aria-label="Budget month"
          value={month}
          onChange={(e) => e.target.value && onMonthChange(e.target.value)}
        />
      </div>

      {hasBudget ? (
        <>
          <div
            className={`bar ${over ? 'over' : ''}`}
            role="progressbar"
            aria-label="Budget used"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.min(Math.round(pct), 100)}
            aria-valuetext={`${Math.round(pct)}% of budget used`}
          >
            <div className="bar-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <div className="budget-stats">
            <span>
              {formatMoney(spent)} of {formatMoney(budget)} ({Math.round(pct)}%)
            </span>
            <strong className={over ? 'expense' : 'income'}>
              {over
                ? `Over budget by ${formatMoney(-remaining)}`
                : `${formatMoney(remaining)} left`}
            </strong>
          </div>
        </>
      ) : (
        <p className="empty">
          No budget set for this month. You've spent {formatMoney(spent)} so far.
        </p>
      )}

      <form className="budget-form" onSubmit={submit}>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          aria-label="Budget amount"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={hasBudget ? `Current: ${formatMoney(budget)}` : 'Budget amount'}
          onFocus={() => setError('')}
          aria-invalid={error ? true : undefined}
        />
        <button type="submit" className="primary">
          {hasBudget ? 'Update' : 'Set budget'}
        </button>
        {hasBudget && (
          <button type="button" className="secondary" onClick={onClearBudget}>
            Remove
          </button>
        )}
      </form>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}
