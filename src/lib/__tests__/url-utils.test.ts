import { describe, it, expect } from 'vitest'
import { normalizeDomain } from '../url-utils'

describe('normalizeDomain', () => {
  it('returns a simple domain as-is', () => {
    expect(normalizeDomain('example.com')).toBe('example.com')
  })

  it('lowercases the domain', () => {
    expect(normalizeDomain('Example.COM')).toBe('example.com')
  })

  it('trims whitespace', () => {
    expect(normalizeDomain('  reddit.com  ')).toBe('reddit.com')
  })

  it('strips http://', () => {
    expect(normalizeDomain('http://twitter.com')).toBe('twitter.com')
  })

  it('strips https://', () => {
    expect(normalizeDomain('https://twitter.com')).toBe('twitter.com')
  })

  it('strips www.', () => {
    expect(normalizeDomain('www.facebook.com')).toBe('facebook.com')
  })

  it('strips https://www.', () => {
    expect(normalizeDomain('https://www.instagram.com')).toBe('instagram.com')
  })

  it('removes trailing path', () => {
    expect(normalizeDomain('reddit.com/r/programming')).toBe('reddit.com')
  })

  it('removes trailing path with protocol', () => {
    expect(normalizeDomain('https://www.youtube.com/watch?v=123')).toBe('youtube.com')
  })

  it('strips leading and trailing dots', () => {
    expect(normalizeDomain('.example.com.')).toBe('example.com')
  })

  it('handles empty string', () => {
    expect(normalizeDomain('')).toBe('')
  })

  it('handles just a protocol', () => {
    expect(normalizeDomain('https://')).toBe('')
  })
})
