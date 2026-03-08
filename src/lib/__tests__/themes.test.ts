import { describe, it, expect, beforeEach } from 'vitest'
import { getThemes, getThemeById, applyTheme, loadSavedTheme } from '../themes'

describe('getThemes', () => {
  it('returns a non-empty array of themes', () => {
    const themes = getThemes()
    expect(themes.length).toBeGreaterThan(0)
  })

  it('each theme has required fields', () => {
    for (const theme of getThemes()) {
      expect(theme.id).toBeTruthy()
      expect(theme.name).toBeTruthy()
      expect(theme.tag).toMatch(/^(Dark|Light)$/)
      expect(Object.keys(theme.vars).length).toBeGreaterThan(0)
    }
  })

  it('all theme ids are unique', () => {
    const ids = getThemes().map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('getThemeById', () => {
  it('returns the correct theme for a known id', () => {
    const themes = getThemes()
    for (const theme of themes) {
      expect(getThemeById(theme.id)).toBe(theme)
    }
  })

  it('returns the first theme for an unknown id', () => {
    const fallback = getThemeById('nonexistent-id')
    expect(fallback).toBe(getThemes()[0])
  })
})

describe('applyTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    // Reset inline styles
    for (const key of Object.keys(getThemes()[0].vars)) {
      document.documentElement.style.removeProperty(key)
    }
  })

  it('sets CSS variables on document root', () => {
    const theme = getThemes()[0]
    applyTheme(theme)
    for (const [key, value] of Object.entries(theme.vars)) {
      expect(document.documentElement.style.getPropertyValue(key)).toBe(value)
    }
  })

  it('saves theme id to localStorage', () => {
    const theme = getThemes()[1]
    applyTheme(theme)
    expect(localStorage.getItem('tgt-theme')).toBe(theme.id)
  })
})

describe('loadSavedTheme', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('loads the default (first) theme when nothing is saved', () => {
    const theme = loadSavedTheme()
    expect(theme).toBe(getThemes()[0])
  })

  it('loads the saved theme from localStorage', () => {
    const target = getThemes()[2]
    localStorage.setItem('tgt-theme', target.id)
    const theme = loadSavedTheme()
    expect(theme).toBe(target)
  })

  it('falls back to default for an invalid saved id', () => {
    localStorage.setItem('tgt-theme', 'bogus')
    const theme = loadSavedTheme()
    expect(theme).toBe(getThemes()[0])
  })
})
