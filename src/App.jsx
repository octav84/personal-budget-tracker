import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { STORAGE_KEY, BUDGETS_KEY } from './constants'
import { currentMonth, isValidMonth } from './format'
import Summary from './components/Summary'
import BudgetProgress from './components/BudgetProgress'
import TransactionForm from './components/TransactionForm'
import SpendingChart from './components/SpendingChart'
import TransactionList from './components/TransactionList'

const UNDO_MS = 6000

const logo = (
  <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="13" fill="none" stroke="#fff" strokeWidth="3.5" />
    <circle cx="24.5" cy="9" r="4.5" fill="#ffb020" />
  </svg>
)

export default function App() {
  const [transactions, setTransactions] = useLocalStorage(STORAGE_KEY, [])

  const [budgets, setBudgets] = useLocalStorage(BUDGETS_KEY, {})
  const [month, setMonth] = useState(currentMonth)

  // Depends only on transactions, so changing the month doesn't re-sort the list.
  const { income, expenses, byCategory, sorted } = useMemo(() => {
    let income = 0
    let expenses = 0
    const byCategory = {}
    for (const t of transactions) {
      if (t.type === 'income') {
        income += t.amount
      } else {
        expenses += t.amount
        byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount
      }
    }
    // Newest date first; within the same date, most recently added first
    // (transactions are appended, so reversing before the stable sort does it).
    const sorted = transactions.toReversed().sort((a, b) => b.date.localeCompare(a.date))
    return { income, expenses, byCategory, sorted }
  }, [transactions])

  const monthSpent = useMemo(() => {
    let total = 0
    for (const t of transactions) {
      if (t.type !== 'income' && t.date.startsWith(month)) total += t.amount
    }
    return total
  }, [transactions, month])

  const [deleted, setDeleted] = useState(null)
  const undoTimer = useRef(null)

  useEffect(() => () => clearTimeout(undoTimer.current), [])

  // Stable between transaction changes so the memoized TransactionList can skip re-renders.
  const deleteTransaction = useCallback(
    (id) => {
      const index = transactions.findIndex((x) => x.id === id)
      if (index === -1) return
      setTransactions((prev) => prev.filter((x) => x.id !== id))
      setDeleted({ transaction: transactions[index], index })
      clearTimeout(undoTimer.current)
      undoTimer.current = setTimeout(() => setDeleted(null), UNDO_MS)
    },
    [transactions, setTransactions],
  )

  function undoDelete() {
    if (!deleted) return
    const { transaction, index } = deleted
    // Put it back at its original position so same-day ordering is preserved.
    setTransactions((prev) =>
      prev.some((x) => x.id === transaction.id)
        ? prev
        : [...prev.slice(0, index), transaction, ...prev.slice(index)],
    )
    clearTimeout(undoTimer.current)
    setDeleted(null)
  }

  return (
    <>
    <header className="topbar">
      <div className="topbar-inner">
        {logo}
        <h1>Budget Tracker</h1>
      </div>
    </header>
    <main className="app">
      <Summary income={income} expenses={expenses} />
      <BudgetProgress
        key={month}
        month={month}
        onMonthChange={(m) => isValidMonth(m) && setMonth(m)}
        spent={monthSpent}
        budget={budgets[month]}
        onSetBudget={(amount) => setBudgets((prev) => ({ ...prev, [month]: amount }))}
        onClearBudget={() =>
          setBudgets((prev) => {
            const { [month]: _removed, ...rest } = prev
            return rest
          })
        }
      />
      <div className="grid">
        <TransactionForm onAdd={(t) => setTransactions((prev) => [...prev, t])} />
        <SpendingChart byCategory={byCategory} total={expenses} />
      </div>
      <TransactionList transactions={sorted} onDelete={deleteTransaction} />
      {deleted && (
        <div className="toast" role="status">
          <span>Transaction deleted.</span>
          <button onClick={undoDelete}>Undo</button>
        </div>
      )}
    </main>
    </>
  )
}
