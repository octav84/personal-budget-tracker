const fmt = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
})

export const formatMoney = (n) => fmt.format(n)

const pad = (n) => String(n).padStart(2, '0')

// Local-time date/month strings (toISOString would use UTC and can land in the wrong month)
export const todayLocal = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
export const currentMonth = () => todayLocal().slice(0, 7)

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/
export const isValidMonth = (s) => MONTH_RE.test(s)
