import { useEffect, useState } from 'react';

function stored<T extends string>(key: string, fallback: T): T {
  try {
    return (localStorage.getItem(key) as T | null) ?? fallback;
  } catch {
    return fallback;
  }
}

/** A string setting kept in localStorage so the playground remembers it. */
export function useSetting<T extends string>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => stored(key, fallback));
  useEffect(() => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Private mode: the setting just won't persist.
    }
  }, [key, value]);
  return [value, setValue] as const;
}
