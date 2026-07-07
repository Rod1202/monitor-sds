import { useState } from 'react';
import type { CustomerDetailsResponse } from '../types';
import { getFromCache, setCache, TTL } from '../utils/cache';

const URL = '/api/dashboard?view=customer-details';

export function useCustomerDetails() {
  const [data, setData] = useState<CustomerDetailsResponse | null>(() => getFromCache<CustomerDetailsResponse>(URL, TTL.CUSTOMER_DETAILS));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function fetchData() {
    const cached = getFromCache<CustomerDetailsResponse>(URL, TTL.CUSTOMER_DETAILS);
    if (cached) { setData(cached); return; }
    if (data) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(URL)
      .then(r => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json() as Promise<CustomerDetailsResponse> })
      .then(json => { setCache(URL, json); if (!cancelled) setData(json) })
      .catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : 'Error') })
      .finally(() => { if (!cancelled) setLoading(false) });

    return () => { cancelled = true; };
  }

  return { data, loading, error, fetchData };
}
