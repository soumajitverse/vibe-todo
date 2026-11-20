import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce value changes (ideal for search input)
 * @param {any} value Value to debounce
 * @param {number} delay Delay in milliseconds
 * @returns {any} Debounced value
 */
export function useDebounce(value, delay = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
