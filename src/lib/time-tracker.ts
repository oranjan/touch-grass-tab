import { normalizeDomain } from './url-utils'

/**
 * Maximum time credited to a single flush, in milliseconds.
 *
 * The service worker can be suspended (laptop sleep, long idle) while a session
 * is open. When it wakes, `now - since` may be enormous. Capping each flush
 * stops a single stale session from dumping hours of phantom time onto a domain.
 * The heartbeat alarm fires every minute, so real sessions never need more.
 */
export const MAX_FLUSH_MS = 90_000

/**
 * Extract the trackable domain from a tab URL, or null if it should be ignored.
 * Only http/https pages are tracked — extension pages, chrome://, about:,
 * file://, the new-tab page, etc. are skipped. Domains are normalised the same
 * way blocked sites are (lowercased, `www.` stripped) so totals line up.
 */
export function trackableDomain(url: string | undefined | null): string | null {
  if (!url) return null
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
  const domain = normalizeDomain(parsed.hostname)
  if (!domain || !domain.includes('.')) return null
  return domain
}

/** Elapsed ms from `since` to `now`, clamped to [0, cap]. */
export function cappedElapsed(since: number, now: number, cap = MAX_FLUSH_MS): number {
  const elapsed = now - since
  if (!Number.isFinite(elapsed) || elapsed <= 0) return 0
  return Math.min(elapsed, cap)
}

/**
 * Human-readable duration: "45s", "12m", "3h", "1h 20m".
 * Sub-second values render as "0s".
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  if (totalSeconds < 60) return `${totalSeconds}s`
  const totalMinutes = Math.floor(totalSeconds / 60)
  if (totalMinutes < 60) return `${totalMinutes}m`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
}
