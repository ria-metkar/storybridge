'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';

/**
 * Fetches `path` on mount and whenever path/query (or `options.key`) change.
 * Pass `null` as path to skip.
 */
export function useApi(path, options) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [fetching, setFetching] = useState(Boolean(path));
  const [settledKey, setSettledKey] = useState(null);
  const key = path ? `${path}?${JSON.stringify(options?.query ?? {})}#${options?.key ?? ''}` : null;
  // Also "loading" on the render where the key has just changed but the effect hasn't started yet,
  // so callers never see loading=false with stale or missing data.
  const loading = Boolean(path) && (fetching || settledKey !== key);

  const load = useCallback(
    async (signal) => {
      if (!path) return;
      setFetching(true);
      setError(null);
      try {
        setData(await api(path, { ...options, signal }));
      } catch (err) {
        if (err.name !== 'AbortError') setError(err);
      } finally {
        if (!signal?.aborted) {
          setFetching(false);
          setSettledKey(key);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return { data, error, loading, reload: () => load(), setData };
}
