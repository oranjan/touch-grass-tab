import type { BlockedSite } from '@/lib/storage'
import { SiteItem } from './SiteItem'

interface SiteListProps {
  sites: BlockedSite[]
  onRemove: (domain: string) => void
}

export function SiteList({ sites, onRemove }: SiteListProps) {
  if (sites.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <span className="text-3xl">&#x1F33F;</span>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">No sites blocked yet</p>
          <p className="mt-0.5 text-xs text-muted-foreground/50">Add a site above to start your glow up</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2">
      <div className="space-y-1.5">
        {sites.map((site) => (
          <SiteItem key={site.domain} site={site} onRemove={onRemove} />
        ))}
      </div>
    </div>
  )
}
