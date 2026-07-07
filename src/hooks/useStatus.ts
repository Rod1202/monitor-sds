import { useState, useEffect } from 'react';
import type { StatusResponse } from '../types';
import { getFromCache, setCache, TTL } from '../utils/cache';

const URL = '/api/dashboard?view=status';

export function useStatus() {
  const [data, setData] = useState<StatusResponse | null>(() => getFromCache<StatusResponse>(URL, TTL.STATUS));
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) return;
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(URL);
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        const json: StatusResponse = await res.json();
        setCache(URL, json);
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading, error };
}
