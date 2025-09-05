import {useEffect, useRef, useState} from 'react';

function useChangedState<T>(initialValue: T) {
  const [state, setState] = useState<T>(initialValue);
  const [hasChanged, setHasChanged] = useState(false);
  const prevValueRef = useRef(initialValue);

  useEffect(() => {
    if (prevValueRef.current !== state) {
      setHasChanged(true);
    } else {
      setHasChanged(false);
    }
    prevValueRef.current = state; // Update the previous value after the comparison
  }, [state]);

  return [state, setState, hasChanged];
}

export default useChangedState;
