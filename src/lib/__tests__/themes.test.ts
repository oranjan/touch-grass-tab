import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { initTheme, isDarkMode } from '../themes'

function mockMatchMedia(prefersDark: boolean) {
  const listeners: Array<(e: { matches: boolean }) => void> = []
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: query === '(prefers-color-scheme: dark)' ? prefersDark : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: (_: string, cb: (e: { matches: boolean }) => void) => listeners.push(cb),
      removeEventListener: vi.fn(),
      dispatchEvent: () => false,
    }),
  })
  return listeners
}

describe('initTheme', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark')
  })

  afterEach(() => {
    document.documentElement.classList.remove('dark')
  })

  it('adds dark class when system prefers dark', () => {
    mockMatchMedia(true)
    initTheme()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('does not add dark class when system prefers light', () => {
    mockMatchMedia(false)
    initTheme()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})

describe('isDarkMode', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark')
  })

  it('returns true when dark class is present', () => {
    document.documentElement.classList.add('dark')
    expect(isDarkMode()).toBe(true)
  })

  it('returns false when dark class is absent', () => {
    document.documentElement.classList.remove('dark')
    expect(isDarkMode()).toBe(false)
  })
})
