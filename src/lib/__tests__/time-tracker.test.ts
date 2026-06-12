import { describe, it, expect } from 'vitest'
import { trackableDomain, cappedElapsed, formatDuration, MAX_FLUSH_MS } from '../time-tracker'

describe('trackableDomain', () => {
  it('extracts the domain from an http(s) URL', () => {
    expect(trackableDomain('https://youtube.com/watch?v=1')).toBe('youtube.com')
    expect(trackableDomain('http://example.com')).toBe('example.com')
  })

  it('strips www and lowercases', () => {
    expect(trackableDomain('https://WWW.Twitter.com/home')).toBe('twitter.com')
  })

  it('keeps non-www subdomains distinct', () => {
    expect(trackableDomain('https://mail.google.com')).toBe('mail.google.com')
  })

  it('ignores non-web protocols', () => {
    expect(trackableDomain('chrome-extension://abc/blocked.html')).toBeNull()
    expect(trackableDomain('chrome://extensions')).toBeNull()
    expect(trackableDomain('about:blank')).toBeNull()
    expect(trackableDomain('file:///Users/me/page.html')).toBeNull()
  })

  it('ignores hostnames without a dot (e.g. localhost, new tab)', () => {
    expect(trackableDomain('http://localhost:3000')).toBeNull()
  })

  it('returns null for empty, nullish, or invalid input', () => {
    expect(trackableDomain(undefined)).toBeNull()
    expect(trackableDomain(null)).toBeNull()
    expect(trackableDomain('')).toBeNull()
    expect(trackableDomain('not a url')).toBeNull()
  })
})

describe('cappedElapsed', () => {
  it('returns the elapsed time for normal intervals', () => {
    expect(cappedElapsed(1000, 6000)).toBe(5000)
  })

  it('caps at MAX_FLUSH_MS to bound suspended-worker over-counting', () => {
    expect(cappedElapsed(0, MAX_FLUSH_MS + 10_000_000)).toBe(MAX_FLUSH_MS)
  })

  it('honours a custom cap', () => {
    expect(cappedElapsed(0, 100_000, 1000)).toBe(1000)
  })

  it('returns 0 for zero, negative, or non-finite intervals', () => {
    expect(cappedElapsed(5000, 5000)).toBe(0)
    expect(cappedElapsed(6000, 1000)).toBe(0)
    expect(cappedElapsed(NaN, 1000)).toBe(0)
  })
})

describe('formatDuration', () => {
  it('formats sub-minute durations in seconds', () => {
    expect(formatDuration(0)).toBe('0s')
    expect(formatDuration(500)).toBe('0s')
    expect(formatDuration(5000)).toBe('5s')
    expect(formatDuration(59_000)).toBe('59s')
  })

  it('formats minutes', () => {
    expect(formatDuration(60_000)).toBe('1m')
    expect(formatDuration(90_000)).toBe('1m')
    expect(formatDuration(59 * 60_000)).toBe('59m')
  })

  it('formats hours with optional minutes', () => {
    expect(formatDuration(60 * 60_000)).toBe('1h')
    expect(formatDuration(61 * 60_000)).toBe('1h 1m')
    expect(formatDuration(2 * 60 * 60_000)).toBe('2h')
  })
})
