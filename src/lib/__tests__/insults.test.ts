import { describe, it, expect, vi } from 'vitest'
import {
  INSULTS,
  PAGE_TITLES,
  ROAST_EMOJIS,
  COMEBACK_LINES,
  getInsult,
  getRandomPageTitle,
  getRandomEmoji,
} from '../insults'

describe('constants', () => {
  it('INSULTS is a non-empty array of strings', () => {
    expect(INSULTS.length).toBeGreaterThan(0)
    INSULTS.forEach((i) => expect(typeof i).toBe('string'))
  })

  it('PAGE_TITLES is a non-empty array of strings', () => {
    expect(PAGE_TITLES.length).toBeGreaterThan(0)
  })

  it('ROAST_EMOJIS is a non-empty array', () => {
    expect(ROAST_EMOJIS.length).toBeGreaterThan(0)
  })

  it('COMEBACK_LINES is a non-empty array', () => {
    expect(COMEBACK_LINES.length).toBeGreaterThan(0)
  })
})

describe('getInsult', () => {
  it('returns the first insult for visitCount 1', () => {
    expect(getInsult(1)).toBe(INSULTS[0])
  })

  it('returns the second insult for visitCount 2', () => {
    expect(getInsult(2)).toBe(INSULTS[1])
  })

  it('clamps to the last insult for very high visitCount', () => {
    expect(getInsult(9999)).toBe(INSULTS[INSULTS.length - 1])
  })

  it('returns the first insult for visitCount 0 (clamped)', () => {
    expect(getInsult(0)).toBe(INSULTS[0])
  })

  it('returns the first insult for negative visitCount', () => {
    expect(getInsult(-5)).toBe(INSULTS[0])
  })
})

describe('getRandomPageTitle', () => {
  it('returns a value from PAGE_TITLES', () => {
    const title = getRandomPageTitle()
    expect(PAGE_TITLES).toContain(title)
  })

  it('uses Math.random to pick a title', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(getRandomPageTitle()).toBe(PAGE_TITLES[0])

    vi.spyOn(Math, 'random').mockReturnValue(0.999)
    expect(getRandomPageTitle()).toBe(PAGE_TITLES[PAGE_TITLES.length - 1])

    vi.restoreAllMocks()
  })
})

describe('getRandomEmoji', () => {
  it('returns a value from ROAST_EMOJIS', () => {
    const emoji = getRandomEmoji()
    expect(ROAST_EMOJIS).toContain(emoji)
  })

  it('uses Math.random to pick an emoji', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(getRandomEmoji()).toBe(ROAST_EMOJIS[0])

    vi.spyOn(Math, 'random').mockReturnValue(0.999)
    expect(getRandomEmoji()).toBe(ROAST_EMOJIS[ROAST_EMOJIS.length - 1])

    vi.restoreAllMocks()
  })
})
