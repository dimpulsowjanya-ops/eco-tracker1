import { useState, useEffect, useCallback } from 'react';

/**
 * Type-safe localStorage hook with error handling.
 * @template T
 * @param {string} key - localStorage key
 * @param {T} initialValue - Default value if key is not set
 * @returns {[T, (value: T | ((prev: T) => T)) => void]}
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      setStoredValue(prev => {
        const valueToStore = typeof value === 'function' ? value(prev) : value;
        localStorage.setItem(key, JSON.stringify(valueToStore));
        return valueToStore;
      });
    } catch {
      // Storage may be full or unavailable — fail silently in production
    }
  }, [key]);

  return [storedValue, setValue];
}
