import { useState } from 'react';
import type { CustomerSummaryResponse } from '../types';
import { getFromCache, setCache, TTL } from '../utils/cache';

export function useCustomerSummary() {
  const [data, setData] = useState<CustomerSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);

  function fetchSummary(customerId: number) {
    const url = `/api/dashboard?view=customer-summary&customerId=${customerId}`;
    const cached = getFromCache<CustomerSummaryResponse>(url, TTL.CUSTOMER_SUMMARY);
    if (cached) { setData(cached); return; }
    setLoading(true);
    setData(null);

    fetch(url)
      .then(r => { if (!r.ok) throw new Error('Error'); return r.json() as Promise<CustomerSummaryResponse> })
      .then(json => { setCache(url, json); setData(json) })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }

  return { data, loading, fetchSummary };
}
