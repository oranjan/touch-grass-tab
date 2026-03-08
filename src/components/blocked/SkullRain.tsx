const RAIN_EMOJIS = ['💀', '🤡', '😭', '🗿', '☠️', '🫠', '😵', '🪦', '👻', '🤣']

interface SkullRainProps {
  intensity: 'normal' | 'high'
}

interface RainDrop {
  id: number
  emoji: string
  left: string
  delay: string
  duration: string
  size: string
  rotation: number
}

function generateDrops(count: number): RainDrop[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    emoji: RAIN_EMOJIS[Math.floor(Math.random() * RAIN_EMOJIS.length)],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 5}s`,
    duration: `${3 + Math.random() * 4}s`,
    size: `${1 + Math.random() * 1.5}rem`,
    rotation: Math.random() * 360,
  }))
}

const normalDrops = generateDrops(20)
const highDrops = generateDrops(40)

export function SkullRain({ intensity }: SkullRainProps) {
  const drops = intensity === 'high' ? highDrops : normalDrops

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {drops.map((drop) => (
        <span
          key={drop.id}
          className="absolute animate-fall opacity-60"
          style={{
            left: drop.left,
            top: '-5%',
            animationDelay: drop.delay,
            animationDuration: drop.duration,
            fontSize: drop.size,
            transform: `rotate(${drop.rotation}deg)`,
          }}
        >
          {drop.emoji}
        </span>
      ))}
    </div>
  )
}
