import { CATEGORY_COLORS } from '../constants'
import { formatMoney } from '../format'

const R = 70
const C = 2 * Math.PI * R

const colorFor = (cat) => CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.Other

export default function SpendingChart({ byCategory, total }) {
  const rows = Object.entries(byCategory).sort((a, b) => b[1] - a[1])

  const slices = []
  let offset = 0
  for (const [cat, amt] of rows) {
    const len = (amt / total) * C
    slices.push({ cat, amt, len, offset })
    offset += len
  }

  return (
    <section className="panel">
      <h2>Spending by category</h2>
      {total === 0 ? (
        <p className="empty">No expenses yet. Add one to see the breakdown.</p>
      ) : (
        <div className="chart">
          <svg viewBox="0 0 200 200" role="img" aria-label="Spending by category donut chart">
            <g transform="rotate(-90 100 100)">
              {slices.map((s) => (
                <circle
                  key={s.cat}
                  cx="100"
                  cy="100"
                  r={R}
                  fill="none"
                  stroke={colorFor(s.cat)}
                  strokeWidth="28"
                  strokeDasharray={`${s.len} ${C - s.len}`}
                  strokeDashoffset={-s.offset}
                >
                  <title>{`${s.cat}: ${formatMoney(s.amt)}`}</title>
                </circle>
              ))}
            </g>
            <text x="100" y="96" textAnchor="middle" className="donut-label">
              Spent
            </text>
            <text x="100" y="116" textAnchor="middle" className="donut-total">
              {formatMoney(total)}
            </text>
          </svg>
          <ul className="legend">
            {rows.map(([cat, amt]) => (
              <li key={cat}>
                <span className="swatch" style={{ background: colorFor(cat) }} />
                <span className="name">{cat}</span>
                <span className="amt">{formatMoney(amt)}</span>
                <span className="pct">{Math.round((amt / total) * 100)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
