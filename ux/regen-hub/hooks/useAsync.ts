import { useCallback, useEffect, useRef, useState } from 'react';

type AsyncState<T> = {
  data: T | null;
  error: Error | null;
  loading: boolean;
};

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<AsyncState<T>>({ data: null, error: null, loading: true });
  const mountedRef = useRef(true);

  const run = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fn();
      if (!mountedRef.current) return;
      setState({ data, error: null, loading: false });
    } catch (e) {
      if (!mountedRef.current) return;
      setState({ data: null, error: e as Error, loading: false });
    }
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  deps);

  useEffect(() => {
    mountedRef.current = true;
    void run();
    return () => {
      mountedRef.current = false;
    };
  }, [run]);

  return { ...state, reload: run };
}
