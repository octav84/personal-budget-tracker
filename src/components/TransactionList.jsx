import { memo, useState } from 'react'
import { formatMoney } from '../format'

export default memo(function TransactionList({ transactions, onDelete }) {
  const [confirmingId, setConfirmingId] = useState(null)

  return (
    <section className="panel">
      <h2>Transactions</h2>
      {transactions.length === 0 ? (
        <p className="empty">Nothing here yet.</p>
      ) : (
        <ul className="tx-list">
          {transactions.map((t) => (
            <li key={t.id}>
              <div className="tx-main">
                <span className="tx-cat">{t.category}</span>
                <span className="tx-desc">{t.description || '—'}</span>
                <span className="tx-date">{t.date}</span>
              </div>
              <span className={`tx-amt ${t.type}`}>
                {t.type === 'income' ? '+' : '−'}
                {formatMoney(t.amount)}
              </span>
              {confirmingId === t.id ? (
                <div className="confirm" role="group" aria-label="Confirm delete">
                  <button
                    className="danger"
                    autoFocus
                    onClick={() => {
                      setConfirmingId(null)
                      onDelete(t.id)
                    }}
                  >
                    Delete
                  </button>
                  <button className="secondary" onClick={() => setConfirmingId(null)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  className="del"
                  onClick={() => setConfirmingId(t.id)}
                  aria-label={`Delete ${t.category} transaction`}
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
})
