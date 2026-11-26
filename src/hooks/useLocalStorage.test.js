import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useLocalStorage } from './useLocalStorage'

const KEY = 'test.key'

describe('useLocalStorage', () => {
  it('returns the initial value when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, []))
    expect(result.current[0]).toEqual([])
  })

  it('loads a previously stored value', () => {
    localStorage.setItem(KEY, JSON.stringify([{ id: 1 }]))
    const { result } = renderHook(() => useLocalStorage(KEY, []))
    expect(result.current[0]).toEqual([{ id: 1 }])
  })

  it('persists updates to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, []))
    act(() => result.current[1]([1, 2, 3]))
    expect(result.current[0]).toEqual([1, 2, 3])
    expect(JSON.parse(localStorage.getItem(KEY))).toEqual([1, 2, 3])
  })

  it('supports functional updates', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, []))
    act(() => result.current[1]((prev) => [...prev, 'a']))
    act(() => result.current[1]((prev) => [...prev, 'b']))
    expect(result.current[0]).toEqual(['a', 'b'])
  })

  describe('corrupt or unexpected stored data falls back to the initial value', () => {
    it.each([
      ['invalid JSON', '{not json'],
      ['truncated JSON', '[{"id":'],
      ['the string "null"', 'null'],
      ['a string', '"hello"'],
      ['a number', '42'],
      ['a boolean', 'true'],
      ['an object where an array is expected', '{"a":1}'],
    ])('%s', (_label, raw) => {
      localStorage.setItem(KEY, raw)
      const { result } = renderHook(() => useLocalStorage(KEY, []))
      expect(result.current[0]).toEqual([])
    })

    it('rejects an array where an object is expected', () => {
      localStorage.setItem(KEY, '[1,2]')
      const { result } = renderHook(() => useLocalStorage(KEY, {}))
      expect(result.current[0]).toEqual({})
    })

    it('treats an empty string as missing', () => {
      localStorage.setItem(KEY, '')
      const { result } = renderHook(() => useLocalStorage(KEY, ['x']))
      expect(result.current[0]).toEqual(['x'])
    })
  })

  it('keeps working in memory when localStorage.setItem throws (storage full)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })
    const { result } = renderHook(() => useLocalStorage(KEY, []))
    expect(() => act(() => result.current[1](['still works']))).not.toThrow()
    expect(result.current[0]).toEqual(['still works'])
  })

  it('falls back to the initial value when localStorage.getItem throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const { result } = renderHook(() => useLocalStorage(KEY, ['default']))
    expect(result.current[0]).toEqual(['default'])
  })

  it('keeps separate keys independent', () => {
    const a = renderHook(() => useLocalStorage('k.a', []))
    const b = renderHook(() => useLocalStorage('k.b', []))
    act(() => a.result.current[1]([1]))
    expect(b.result.current[0]).toEqual([])
  })
})
