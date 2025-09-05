import {useEffect, useRef} from 'react';

export const useEffectAfterMount = (fn: VoidFunction, deps: any[] = []) => {
  const isMounted = useRef<boolean>(false);
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    fn();
  }, deps);
};
