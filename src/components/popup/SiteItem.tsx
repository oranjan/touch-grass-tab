import { useState } from 'react'
import type { BlockedSite } from '@/lib/storage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface SiteItemProps {
  site: BlockedSite
  onRemove: (domain: string) => void
}

export function SiteItem({ site, onRemove }: SiteItemProps) {
  const [faviconFailed, setFaviconFailed] = useState(false)
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${site.domain}&sz=32`

  return (
    <div className="group flex items-center gap-2.5 rounded-xl border border-border/50 bg-secondary/60 px-3 py-2 transition-all hover:border-border hover:bg-secondary">
      {faviconFailed ? (
        <span className="text-sm" aria-hidden="true">&#x1F480;</span>
      ) : (
        <img
          src={faviconUrl}
          alt=""
          width={16}
          height={16}
          className="h-4 w-4 rounded-sm"
          onError={() => setFaviconFailed(true)}
        />
      )}
      <span className="flex-1 truncate text-sm font-medium text-foreground">
        {site.domain}
      </span>
      {site.visitCount > 0 && (
        <Badge variant="secondary" className="rounded-lg text-[10px] font-mono tabular-nums bg-primary/10 text-primary border border-primary/20">
          {site.visitCount}x
        </Badge>
      )}
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => onRemove(site.domain)}
        aria-label={`Remove ${site.domain}`}
        className="rounded-lg text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </Button>
    </div>
  )
}
