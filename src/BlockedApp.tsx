import { useEffect, useState, useMemo, useRef } from 'react'
import { incrementVisitCount } from '@/lib/storage'
import { getInsult, getRandomPageTitle, getRandomEmoji } from '@/lib/insults'
import { playNextSound, spamSounds } from '@/lib/sounds'
import { loadSavedTheme } from '@/lib/themes'
import { RoastModal } from '@/components/blocked/RoastModal'
import { SkullRain } from '@/components/blocked/SkullRain'

// LGBT pride flag gradient
const PRIDE_GRADIENT = 'linear-gradient(135deg, #E40303, #FF8C00, #FFED00, #008026, #004DFF, #750787)'

function getInitialState() {
  const params = new URLSearchParams(window.location.search)
  return {
    site: params.get('site') ?? 'unknown',
    emoji: getRandomEmoji(),
    pageTitle: getRandomPageTitle(),
  }
}

const initial = getInitialState()

const FLASHBANG_TEXTS = [
  'CAUGHT IN 4K',
  'NO RIZZ DETECTED',
  'DOWN BAD',
  'SKILL ISSUE',
  'TOUCH GRASS',
  'COOKED',
  'NEGATIVE AURA',
  'RATIO',
  'L + COPE',
  'NPC MOMENT',
  'CERTIFIED OHIO',
  'DELULU',
]

export function BlockedApp() {
  const [visitCount, setVisitCount] = useState(0)
  const [insult, setInsult] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [annoyanceDone, setAnnoyanceDone] = useState(false)
  const [flashText, setFlashText] = useState(0)
  const soundSpammed = useRef(false)

  const gradient = PRIDE_GRADIENT

  // Load user's saved theme so blocked page matches their light/dark preference
  const theme = useMemo(() => loadSavedTheme(), [])
  const isDark = theme.tag === 'Dark'

  useEffect(() => {
    document.title = initial.pageTitle

    incrementVisitCount(initial.site).then((count) => {
      setVisitCount(count)
      setInsult(getInsult(count))
      setLoaded(true)
      playNextSound()
    })
  }, [])

  // Flashbang duration: 2s base + 3s per visit (escalates each time)
  const flashDuration = 2000 + visitCount * 3000

  // End the flashbang after the computed duration
  useEffect(() => {
    if (!loaded) return
    const timer = setTimeout(() => setAnnoyanceDone(true), flashDuration)
    return () => clearTimeout(timer)
  }, [loaded, flashDuration])

  // Rapid text cycling + sound spam during flashbang
  useEffect(() => {
    if (!loaded || annoyanceDone) return

    // Spam sounds every 400ms for the full flashbang duration
    if (!soundSpammed.current) {
      soundSpammed.current = true
      spamSounds(flashDuration, 400)
    }

    // Cycle text every 150ms
    const interval = setInterval(() => {
      setFlashText((i) => (i + 1) % FLASHBANG_TEXTS.length)
    }, 150)
    return () => clearInterval(interval)
  }, [loaded, annoyanceDone, flashDuration])

  // Before data loads — blinding white
  if (!loaded) {
    return <div className="fixed inset-0" style={{ background: '#ffffff' }} />
  }

  // 3-second NUCLEAR flashbang annoyance phase
  if (!annoyanceDone) {
    return (
      <div className="animate-flashbang fixed inset-0 overflow-hidden select-none">
        {/* Layer 1: Spinning giant text background */}
        <div className="animate-flashbang-spin pointer-events-none absolute inset-0 flex items-center justify-center">
          <p
            className="whitespace-nowrap text-[20rem] font-black leading-none md:text-[30rem]"
            style={{ color: '#ff0000', opacity: 0.3 }}
          >
            {FLASHBANG_TEXTS[(flashText + 3) % FLASHBANG_TEXTS.length]}
          </p>
        </div>

        {/* Layer 2: Counter-spinning text */}
        <div
          className="animate-flashbang-spin pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ animationDirection: 'reverse', animationDuration: '0.2s' }}
        >
          <p
            className="whitespace-nowrap text-[12rem] font-black leading-none md:text-[18rem]"
            style={{ color: '#ff00ff', opacity: 0.4 }}
          >
            {FLASHBANG_TEXTS[(flashText + 7) % FLASHBANG_TEXTS.length]}
          </p>
        </div>

        {/* Layer 3: Hue-rotating site name tiled */}
        <div className="animate-flashbang-hue pointer-events-none absolute inset-0 flex flex-wrap items-center justify-center gap-0 overflow-hidden">
          {Array.from({ length: 30 }, (_, i) => (
            <span
              key={i}
              className="inline-block px-4 text-3xl font-black uppercase md:text-5xl"
              style={{
                color: i % 2 === 0 ? '#ff0000' : '#00ff00',
                transform: `rotate(${(i * 37) % 360}deg)`,
              }}
            >
              {initial.site}
            </span>
          ))}
        </div>

        {/* Layer 4: Main center text — maximum chaos */}
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="animate-flashbang-text text-center">
            <p
              className="text-[6rem] font-black leading-none tracking-tight md:text-[10rem]"
              style={{ color: '#000000', mixBlendMode: 'difference' }}
            >
              {FLASHBANG_TEXTS[flashText]}
            </p>
            <p
              className="animate-flashbang-hue mt-6 text-3xl font-black uppercase tracking-[0.5em] md:text-5xl"
              style={{ color: '#ff0000' }}
            >
              {initial.site}
            </p>
            <p
              className="mt-4 text-6xl font-black md:text-8xl"
              style={{ mixBlendMode: 'difference', color: '#ffffff' }}
            >
              {initial.emoji} {initial.emoji} {initial.emoji}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const isIntervention = visitCount >= 10

  return (
    <div
      className={`relative min-h-screen overflow-hidden font-(--font-display) ${isIntervention ? 'animate-shake' : ''}`}
      style={{ background: isDark ? '#050505' : '#fafafa' }}
    >
      {/* Pride gradient background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: gradient,
          opacity: isDark ? 0.3 : 0.2,
        }}
      />
      {/* Vignette overlay for text contrast */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.75) 100%)'
            : 'radial-gradient(ellipse at center, transparent 20%, rgba(255,255,255,0.8) 100%)',
        }}
      />
      <SkullRain intensity={isIntervention ? 'high' : 'normal'} />
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <RoastModal
          site={initial.site}
          insult={insult}
          visitCount={visitCount}
          emoji={initial.emoji}
          isIntervention={isIntervention}
          isDark={isDark}
        />
      </div>
    </div>
  )
}
