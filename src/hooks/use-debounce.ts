import {useEffect, useState} from 'react';

// ----------------------------------------------------------------------

type ReturnType = any;

export function useDebounce(value: any, delay = 500): ReturnType {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
