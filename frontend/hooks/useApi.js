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
  const [loading, setLoading] = useState(Boolean(path));
  const key = path ? `${path}?${JSON.stringify(options?.query ?? {})}#${options?.key ?? ''}` : null;

  const load = useCallback(
    async (signal) => {
      if (!path) return;
      setLoading(true);
      setError(null);
      try {
        setData(await api(path, { ...options, signal }));
      } catch (err) {
        if (err.name !== 'AbortError') setError(err);
      } finally {
        if (!signal?.aborted) setLoading(false);
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
