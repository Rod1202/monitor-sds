import { useState, useEffect } from 'react';
import type { CustomerRestDTO } from '../types';
import { getFromCache, setCache, TTL } from '../utils/cache';

const URL = '/api/dashboard?view=customers';

export function useCustomerSearch() {
  const [customers, setCustomers] = useState<CustomerRestDTO[]>(() => getFromCache<CustomerRestDTO[]>(URL, TTL.CUSTOMERS) ?? []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customers.length > 0) return;
    setLoading(true);
    fetch(URL)
      .then(r => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json() as Promise<CustomerRestDTO[]> })
      .then(data => { setCache(URL, data); setCustomers(data) })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { customers, loading };
}
