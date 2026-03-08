interface StatsBarProps {
  siteCount: number
  totalBlocks: number
}

export function StatsBar({ siteCount, totalBlocks }: StatsBarProps) {
  return (
    <div className="flex items-center justify-between rounded-b-2xl border-t border-border/50 bg-secondary/30 px-4 py-2.5">
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
        <span className="text-xs text-muted-foreground">
          {siteCount} site{siteCount !== 1 ? 's' : ''} blocked
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-accent/60" />
        <span className="text-xs text-muted-foreground">
          {totalBlocks} intervention{totalBlocks !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}
