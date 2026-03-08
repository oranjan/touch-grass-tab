import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockPlay = vi.fn().mockResolvedValue(undefined)

vi.stubGlobal(
  'Audio',
  vi.fn(function (this: { volume: number; play: typeof mockPlay }) {
    this.volume = 1
    this.play = mockPlay
    return this
  }),
)

const { playSound, playNextSound, spamSounds } = await import('../sounds')

describe('playSound', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates an Audio element with the correct URL', () => {
    playSound('bruh.mp3')
    expect(Audio).toHaveBeenCalledWith('/sounds/bruh.mp3')
  })

  it('sets volume to max', () => {
    playSound('fart.mp3')
    const instance = (Audio as unknown as ReturnType<typeof vi.fn>).mock.results[0].value
    expect(instance.volume).toBe(1.0)
  })

  it('calls play()', () => {
    playSound('vine-boom.mp3')
    expect(mockPlay).toHaveBeenCalled()
  })

  it('does not throw when play() rejects', () => {
    mockPlay.mockRejectedValueOnce(new Error('not allowed'))
    expect(() => playSound('sad-trombone.mp3')).not.toThrow()
  })
})

describe('playNextSound', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('cycles through sounds sequentially', () => {
    playNextSound()
    const firstUrl = (Audio as unknown as ReturnType<typeof vi.fn>).mock.calls.at(-1)?.[0]

    playNextSound()
    const secondUrl = (Audio as unknown as ReturnType<typeof vi.fn>).mock.calls.at(-1)?.[0]

    expect(firstUrl).not.toBe(secondUrl)
  })
})

describe('spamSounds', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('plays multiple sounds over the duration', () => {
    spamSounds(1000, 200)

    // Advance through the full duration
    vi.advanceTimersByTime(1000)

    // Should have played ~5 sounds (at 0, 200, 400, 600, 800ms)
    expect(mockPlay.mock.calls.length).toBeGreaterThanOrEqual(4)
  })

  it('stops after duration expires', () => {
    spamSounds(500, 100)

    vi.advanceTimersByTime(1000)
    const countAfter = mockPlay.mock.calls.length

    vi.advanceTimersByTime(2000)
    expect(mockPlay.mock.calls.length).toBe(countAfter)
  })
})
