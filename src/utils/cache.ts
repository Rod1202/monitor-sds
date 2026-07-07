const CACHE_PREFIX = 'sds_'

export const TTL = {
  STATUS: 120_000,
  ALERTS: 120_000,
  CUSTOMERS: 300_000,
  CUSTOMER_DETAILS: 120_000,
  CUSTOMER_SUMMARY: 120_000,
}

function cacheKey(url: string): string {
  return CACHE_PREFIX + url
}

export function getFromCache<T>(url: string, ttlMs: number): T | null {
  try {
    const raw = sessionStorage.getItem(cacheKey(url))
    if (!raw) return null
    const { data, timestamp } = JSON.parse(raw)
    if (Date.now() - timestamp > ttlMs) {
      sessionStorage.removeItem(cacheKey(url))
      return null
    }
    return data as T
  } catch {
    return null
  }
}

export function setCache(url: string, data: unknown): void {
  try {
    sessionStorage.setItem(cacheKey(url), JSON.stringify({ data, timestamp: Date.now() }))
  } catch {
    /* quota exceeded — ignore */
  }
}

export function invalidateCache(url: string): void {
  sessionStorage.removeItem(cacheKey(url))
}

export function clearAllCache(): void {
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const key = sessionStorage.key(i)
    if (key?.startsWith(CACHE_PREFIX)) sessionStorage.removeItem(key)
  }
}
