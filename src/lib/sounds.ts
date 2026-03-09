const SOUNDS = [
  'bruh.mp3',
  'clown-horn.mp3',
  'crickets.mp3',
  'emergency-meeting.mp3',
  'fart.mp3',
  'record-scratch.mp3',
  'rizz.mp3',
  'sad-trombone.mp3',
  'vine-boom.mp3',
  'wow.mp3',
] as const

let soundIndex = 0

export function playNextSound(): void {
  const sound = SOUNDS[soundIndex % SOUNDS.length]
  soundIndex++
  playSound(sound)
}

export function playSound(name: string): void {
  if (!SOUNDS.includes(name as typeof SOUNDS[number])) return
  const url = typeof chrome !== 'undefined' && chrome.runtime?.getURL
    ? chrome.runtime.getURL(`sounds/${name}`)
    : `/sounds/${name}`
  const audio = new Audio(url)
  audio.volume = 1.0
  audio.play().catch(() => {})
}

/** Spam random sounds every `intervalMs` for `durationMs`. Returns a cancel function. */
export function spamSounds(durationMs: number, intervalMs: number): () => void {
  let cancelled = false
  const end = Date.now() + durationMs
  const tick = () => {
    if (cancelled || Date.now() >= end) return
    const sound = SOUNDS[Math.floor(Math.random() * SOUNDS.length)]
    playSound(sound)
    setTimeout(tick, intervalMs)
  }
  tick()
  return () => { cancelled = true }
}
