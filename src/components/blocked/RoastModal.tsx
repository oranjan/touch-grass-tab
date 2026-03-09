import { Button } from '@/components/ui/button'

const PRIDE_COLORS = ['#E40303', '#FF8C00', '#FFED00', '#008026', '#004DFF', '#750787'] as const
const PRIDE_GRADIENT = `linear-gradient(90deg, ${PRIDE_COLORS.join(', ')})`

interface RoastModalProps {
  site: string
  insult: string
  visitCount: number
  emoji: string
  isIntervention: boolean
  isDark: boolean
}

const SHAME_LABELS = [
  "skill issue",
  "no rizz detected",
  "down bad",
  "caught lacking",
  "negative aura",
  "cooked",
  "ratio'd by yourself",
  "delulu",
] as const

function PrideText({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={className}
      style={{
        background: PRIDE_GRADIENT,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
    >
      {children}
    </span>
  )
}

export function RoastModal({ site, insult, visitCount, emoji, isIntervention, isDark }: RoastModalProps) {
  const shameLabel = SHAME_LABELS[visitCount % SHAME_LABELS.length]

  const handleTouchGrass = () => {
    const parksUrl = 'https://www.google.com/search?q=parks+near+me'
    if (typeof chrome !== 'undefined' && chrome.tabs?.update) {
      chrome.tabs.update({ url: parksUrl })
    } else {
      window.location.href = parksUrl
    }
  }

  return (
    <div
      className={`w-full max-w-2xl overflow-hidden rounded-3xl border-2 backdrop-blur-2xl animate-modal-enter ${isIntervention ? 'ring-2 ring-accent glow-accent' : ''}`}
      style={{
        background: isDark ? 'rgba(10, 10, 10, 0.92)' : 'rgba(255, 255, 255, 0.92)',
        borderImage: `${PRIDE_GRADIENT} 1`,
        boxShadow: `0 0 120px color-mix(in srgb, var(--primary) 15%, transparent),
                    0 32px 64px ${isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.15)'}`,
      }}
      role="alert"
      aria-live="polite"
    >
      {/* Top shame banner */}
      <div
        className="flex items-center justify-between border-b px-6 py-2.5"
        style={{
          background: isDark ? 'rgba(117, 7, 135, 0.15)' : 'rgba(117, 7, 135, 0.08)',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        }}
      >
        <PrideText className="text-[10px] font-black uppercase tracking-[0.35em] animate-flicker">
          {shameLabel}
        </PrideText>
        <span className="font-mono text-xs font-bold tabular-nums text-muted-foreground">
          attempt #{visitCount}
        </span>
      </div>

      <div className="flex flex-col items-center gap-5 px-8 py-8 text-center md:gap-7 md:px-14 md:py-12">

        {/* Giant emoji */}
        <div
          className={`text-[6rem] leading-none select-none md:text-[8rem] drop-shadow-lg ${isIntervention ? 'animate-spin-slow' : 'animate-bounce-slow'}`}
          aria-hidden="true"
        >
          {emoji}
        </div>

        {/* Site callout */}
        <div className="space-y-1">
          <PrideText className="text-[10px] font-bold uppercase tracking-[0.4em] animate-flicker block">
            you tried to visit
          </PrideText>
          <p
            className="font-mono text-xl font-black line-through decoration-[3px] md:text-2xl"
            style={{
              background: PRIDE_GRADIENT,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textDecorationColor: '#E40303',
            }}
          >
            {site}
          </p>
        </div>

        {/* THE ROAST */}
        <div className="relative max-w-lg">
          <p
            className="text-2xl font-black leading-snug tracking-tight md:text-[1.85rem]"
            style={{ color: '#E40303', textWrap: 'balance' }}
            data-text={insult}
          >
            {insult}
          </p>
        </div>

        {/* Intervention mode divider */}
        {isIntervention && (
          <div className="flex w-full items-center gap-3">
            <span className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${PRIDE_COLORS[0]}80)` }} />
            <PrideText className="rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-[0.5em] animate-pulse">
              intervention mode
            </PrideText>
            <span className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${PRIDE_COLORS[5]}80)` }} />
          </div>
        )}

        {/* Shame counter */}
        {visitCount > 3 && (
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            blocked <PrideText className="font-mono font-black">{visitCount}</PrideText> times from{' '}
            <span className="font-mono font-semibold text-foreground/70">{site}</span>.{' '}
            {visitCount > 10
              ? "this is genuinely concerning."
              : visitCount > 6
                ? "the lore is writing itself."
                : "let that sink in."}
          </p>
        )}

        {/* CTA */}
        <Button
          onClick={handleTouchGrass}
          className="mt-1 rounded-2xl px-10 py-5 text-base font-black uppercase tracking-widest text-white hover:scale-105 hover:brightness-110 [transition:transform_150ms,filter_150ms]"
          style={{ background: PRIDE_GRADIENT }}
        >
          Touch Grass Now
        </Button>

        {/* Watermark */}
        <p className="select-none text-[8px] font-bold uppercase tracking-[0.5em] text-muted-foreground/30">
          touchgrasstab — get roasted, go outside
        </p>
      </div>
    </div>
  )
}
