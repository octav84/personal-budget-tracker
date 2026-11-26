import { formatMoney } from '../format'

export default function Summary({ income, expenses }) {
  const balance = income - expenses
  return (
    <section className="cards">
      <div className="card">
        <span className="label">Total income</span>
        <strong className="value income">{formatMoney(income)}</strong>
      </div>
      <div className="card">
        <span className="label">Total expenses</span>
        <strong className="value expense">{formatMoney(expenses)}</strong>
      </div>
      <div className="card">
        <span className="label">Balance</span>
        <strong className={`value ${balance >= 0 ? 'income' : 'expense'}`}>
          {formatMoney(balance)}
        </strong>
      </div>
    </section>
  )
}
