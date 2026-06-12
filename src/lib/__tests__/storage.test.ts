import { describe, it, expect, beforeEach } from 'vitest'
import {
  SOCIAL_MEDIA_PRESETS,
  getStorage,
  addSite,
  removeSite,
  incrementVisitCount,
  addPresetSites,
  addTimeSpent,
  clearTimeSpent,
} from '../storage'

const STORAGE_KEY = 'touchgrasstab'
const EMPTY = JSON.stringify({ blockedSites: [], totalBlocks: 0, blockAllMode: false, timeSpent: {} })

describe('storage (localStorage fallback)', () => {
  beforeEach(() => {
    // Setting the key explicitly works across module boundaries in vitest jsdom;
    // localStorage.clear() / removeItem does not propagate reliably.
    localStorage.setItem(STORAGE_KEY, EMPTY)
  })

  describe('getStorage', () => {
    it('returns defaults when storage is empty', async () => {
      const data = await getStorage()
      expect(data).toEqual({ blockedSites: [], totalBlocks: 0, blockAllMode: false, timeSpent: {} })
    })

    it('returns stored data', async () => {
      const stored = { blockedSites: [{ domain: 'x.com', addedAt: 1, visitCount: 3 }], totalBlocks: 5, blockAllMode: false, timeSpent: { 'x.com': 1000 } }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
      const data = await getStorage()
      expect(data).toEqual(stored)
    })

    it('backfills missing fields from defaults', async () => {
      // Data saved before timeSpent existed must still load cleanly.
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ blockedSites: [], totalBlocks: 2, blockAllMode: false }))
      const data = await getStorage()
      expect(data.timeSpent).toEqual({})
      expect(data.totalBlocks).toBe(2)
    })

    it('returns defaults for corrupted JSON', async () => {
      localStorage.setItem(STORAGE_KEY, '{{invalid}')
      const data = await getStorage()
      expect(data).toEqual({ blockedSites: [], totalBlocks: 0, blockAllMode: false, timeSpent: {} })
    })
  })

  describe('addSite', () => {
    it('adds a new site', async () => {
      await addSite('test-add.com')
      const { blockedSites } = await getStorage()
      expect(blockedSites).toHaveLength(1)
      expect(blockedSites[0].domain).toBe('test-add.com')
      expect(blockedSites[0].visitCount).toBe(0)
    })

    it('does not add a duplicate site', async () => {
      await addSite('test-dup.com')
      await addSite('test-dup.com')
      const { blockedSites } = await getStorage()
      expect(blockedSites).toHaveLength(1)
    })

    it('adds multiple different sites', async () => {
      await addSite('site-a.com')
      await addSite('site-b.com')
      const { blockedSites } = await getStorage()
      expect(blockedSites).toHaveLength(2)
    })
  })

  describe('removeSite', () => {
    it('removes an existing site', async () => {
      await addSite('to-remove.com')
      await removeSite('to-remove.com')
      const { blockedSites } = await getStorage()
      expect(blockedSites).toHaveLength(0)
    })

    it('does nothing when removing a non-existent site', async () => {
      await addSite('keeper.com')
      await removeSite('ghost.com')
      const { blockedSites } = await getStorage()
      expect(blockedSites).toHaveLength(1)
      expect(blockedSites[0].domain).toBe('keeper.com')
    })
  })

  describe('incrementVisitCount', () => {
    it('increments visit count for an existing site', async () => {
      await addSite('counter.com')
      const count = await incrementVisitCount('counter.com')
      expect(count).toBe(1)

      const count2 = await incrementVisitCount('counter.com')
      expect(count2).toBe(2)
    })

    it('increments totalBlocks', async () => {
      await addSite('blocks.com')
      await incrementVisitCount('blocks.com')
      await incrementVisitCount('blocks.com')
      const { totalBlocks } = await getStorage()
      expect(totalBlocks).toBe(2)
    })

    it('returns 1 for a non-existent site', async () => {
      const count = await incrementVisitCount('unknown.com')
      expect(count).toBe(1)
    })
  })

  describe('addPresetSites', () => {
    it('adds all social media presets', async () => {
      const added = await addPresetSites()
      expect(added).toBe(SOCIAL_MEDIA_PRESETS.length)
      const { blockedSites } = await getStorage()
      expect(blockedSites).toHaveLength(SOCIAL_MEDIA_PRESETS.length)
      for (const preset of SOCIAL_MEDIA_PRESETS) {
        expect(blockedSites.some((s) => s.domain === preset)).toBe(true)
      }
    })

    it('does not duplicate presets on second call', async () => {
      await addPresetSites()
      const added = await addPresetSites()
      expect(added).toBe(0)
    })

    it('only adds missing presets when some already exist', async () => {
      await addSite(SOCIAL_MEDIA_PRESETS[0])
      const added = await addPresetSites()
      expect(added).toBe(SOCIAL_MEDIA_PRESETS.length - 1)
    })
  })

  describe('addTimeSpent', () => {
    it('records time for a new domain', async () => {
      await addTimeSpent('youtube.com', 5000)
      const { timeSpent } = await getStorage()
      expect(timeSpent['youtube.com']).toBe(5000)
    })

    it('accumulates time across calls', async () => {
      await addTimeSpent('reddit.com', 3000)
      await addTimeSpent('reddit.com', 2000)
      const { timeSpent } = await getStorage()
      expect(timeSpent['reddit.com']).toBe(5000)
    })

    it('tracks domains independently', async () => {
      await addTimeSpent('a.com', 1000)
      await addTimeSpent('b.com', 2000)
      const { timeSpent } = await getStorage()
      expect(timeSpent).toEqual({ 'a.com': 1000, 'b.com': 2000 })
    })

    it('ignores non-positive durations and empty domains', async () => {
      await addTimeSpent('zero.com', 0)
      await addTimeSpent('neg.com', -1000)
      await addTimeSpent('', 5000)
      const { timeSpent } = await getStorage()
      expect(timeSpent).toEqual({})
    })
  })

  describe('clearTimeSpent', () => {
    it('wipes all recorded time', async () => {
      await addTimeSpent('youtube.com', 5000)
      await clearTimeSpent()
      const { timeSpent } = await getStorage()
      expect(timeSpent).toEqual({})
    })
  })
})
