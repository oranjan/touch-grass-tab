interface PopupHeaderProps {
  onExpandClick: () => void
  isFullPage?: boolean
}

export function PopupHeader({ onExpandClick, isFullPage }: PopupHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-t-2xl border-b border-border bg-linear-to-br from-primary/10 via-background to-accent/10 px-4 py-4">
      {/* Subtle gradient orb */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
      <div className="pointer-events-none absolute -left-4 bottom-0 h-16 w-16 rounded-full bg-accent/10 blur-2xl" />

      <div className="relative flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 glow-toxic">
          <img src="/icons/icon.png" alt="" width={28} height={28} className="h-7 w-7" />
        </div>
        <div className="flex-1">
          <h1 className="text-base font-bold tracking-tight text-primary text-glow-toxic">
            TouchGrassTab
          </h1>
          <p className="text-[11px] text-muted-foreground">block sites. get roasted. touch grass.</p>
        </div>
        <button
          onClick={onExpandClick}
          className={`flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted hover:text-foreground ${isFullPage ? 'hidden' : ''}`}
          title="Open in new tab"
          aria-label="Open in new tab"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </button>
      </div>
    </div>
  )
}
