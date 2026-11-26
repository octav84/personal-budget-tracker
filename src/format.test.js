import { afterEach, describe, expect, it, vi } from 'vitest'
import { currentMonth, formatMoney, isValidMonth, todayLocal } from './format'

describe('formatMoney', () => {
  it('formats whole and fractional amounts with two decimals', () => {
    expect(formatMoney(0)).toMatch(/0\D00$/)
    expect(formatMoney(10.5)).toMatch(/10\D50$/)
    expect(formatMoney(1234.5)).toMatch(/1\D?234\D50$/)
  })

  it('includes a currency symbol', () => {
    expect(formatMoney(5)).toContain('$')
  })

  it('formats negative amounts with a minus sign', () => {
    expect(formatMoney(-5)).toMatch(/-/)
  })

  it('handles very large amounts without throwing', () => {
    expect(() => formatMoney(1e15)).not.toThrow()
    expect(formatMoney(1e15)).toMatch(/1\D?000/)
  })

  it('rounds sub-cent values to cents', () => {
    expect(formatMoney(0.1 + 0.2)).toMatch(/0\D30$/)
  })
})

describe('isValidMonth', () => {
  it.each(['2024-01', '2024-12', '1999-06', '0001-09'])('accepts %s', (m) => {
    expect(isValidMonth(m)).toBe(true)
  })

  it.each([
    '',
    '2024-00',
    '2024-13',
    '2024-1',
    '24-01',
    '2024/01',
    '2024-01-15',
    ' 2024-01',
    '2024-01 ',
    'abcd-ef',
    'null',
    "2024-01'; DROP TABLE x;--",
  ])('rejects %j', (m) => {
    expect(isValidMonth(m)).toBe(false)
  })
})

describe('todayLocal / currentMonth', () => {
  afterEach(() => vi.useRealTimers())

  it('uses local time, zero-padded', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2024, 0, 5, 12, 0, 0))
    expect(todayLocal()).toBe('2024-01-05')
    expect(currentMonth()).toBe('2024-01')
  })

  it('does not roll into the next month late on the last day', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2024, 0, 31, 23, 59, 59))
    expect(todayLocal()).toBe('2024-01-31')
    expect(currentMonth()).toBe('2024-01')
  })

  it('handles leap day', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2024, 1, 29, 8, 0, 0))
    expect(todayLocal()).toBe('2024-02-29')
  })

  it('returns a valid month string', () => {
    expect(isValidMonth(currentMonth())).toBe(true)
  })
})
