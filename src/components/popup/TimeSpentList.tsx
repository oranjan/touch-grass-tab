import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { formatDuration } from '@/lib/time-tracker'

const LIMIT = 20

interface TimeSpentListProps {
  timeSpent: Record<string, number>
  onClear: () => void
}

interface TimeRowProps {
  domain: string
  ms: number
  max: number
}

function TimeRow({ domain, ms, max }: TimeRowProps) {
  const [faviconFailed, setFaviconFailed] = useState(false)
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
  const pct = max > 0 ? Math.max(4, Math.round((ms / max) * 100)) : 0

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-secondary/40 px-3 py-2.5">
      {faviconFailed ? (
        <span className="text-sm" aria-hidden="true">&#x1F310;</span>
      ) : (
        <img
          src={faviconUrl}
          alt=""
          width={16}
          height={16}
          className="h-4 w-4 shrink-0 rounded-sm"
          onError={() => setFaviconFailed(true)}
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium text-foreground">{domain}</span>
          <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
            {formatDuration(ms)}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary/70" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  )
}

export function TimeSpentList({ timeSpent, onClear }: TimeSpentListProps) {
  const entries = Object.entries(timeSpent)
    .filter(([, ms]) => ms > 0)
    .sort((a, b) => b[1] - a[1])

  const total = entries.reduce((sum, [, ms]) => sum + ms, 0)
  const max = entries.length > 0 ? entries[0][1] : 0
  const visible = entries.slice(0, LIMIT)
  const hidden = entries.length - visible.length

  return (
    <div className="space-y-2">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Screen time
          {total > 0 && <span className="text-primary"> · {formatDuration(total)} total</span>}
        </h3>
        {entries.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 shrink-0 rounded-lg border-destructive/30 px-3 text-[11px] text-destructive hover:bg-destructive/10"
            onClick={onClear}
          >
            Clear
          </Button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-border/40 px-4 py-6 text-center">
          <p className="text-sm font-medium text-muted-foreground">No browsing time tracked yet</p>
          <p className="mt-0.5 text-xs text-muted-foreground/60">
            Time you spend on each site shows up here. Or you could, like, touch grass.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-1.5">
            {visible.map(([domain, ms]) => (
              <TimeRow key={domain} domain={domain} ms={ms} max={max} />
            ))}
          </div>
          {hidden > 0 && (
            <p className="pt-1 text-center text-[11px] text-muted-foreground/60">
              +{hidden} more site{hidden !== 1 ? 's' : ''}
            </p>
          )}
        </>
      )}
    </div>
  )
}
