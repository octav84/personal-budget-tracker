import { useEffect, useState } from 'react'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return initialValue
      const parsed = JSON.parse(raw)
      // ignore stored values whose shape doesn't match the default (null, wrong type, array vs object)
      const sameShape =
        parsed !== null &&
        typeof parsed === typeof initialValue &&
        Array.isArray(parsed) === Array.isArray(initialValue)
      return sameShape ? parsed : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage full or unavailable; keep working in memory
    }
  }, [key, value])

  return [value, setValue]
}
