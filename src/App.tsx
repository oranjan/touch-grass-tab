import { useEffect, useState, useCallback, useMemo, memo } from 'react'
import { toast } from 'sonner'
import {
  getStorage,
  removeSite,
  addPresetSites,
  removePresetSites,
  setBlockAllMode,
  SOCIAL_MEDIA_PRESETS,
  TOP_30_SITES,
  ADULT_SITES,
  ALL_SITES,
  type StorageData,
} from '@/lib/storage'
import { Button } from '@/components/ui/button'
import { PopupHeader } from '@/components/popup/PopupHeader'
import { SiteInput } from '@/components/popup/SiteInput'
import { SiteList } from '@/components/popup/SiteList'
import { StatsBar } from '@/components/popup/StatsBar'

const PRESET_GROUPS = [
  { label: 'Social Media', presets: SOCIAL_MEDIA_PRESETS },
  { label: 'Top 30 Sites', presets: TOP_30_SITES },
  { label: 'Adult Sites', presets: ADULT_SITES },
  { label: 'All Preset Sites', presets: ALL_SITES },
] as const

interface PresetGroupProps {
  label: string
  presets: readonly string[]
  blockedDomains: Set<string>
  onAction: () => void
}

const PresetGroup = memo(function PresetGroup({ label, presets, blockedDomains, onAction }: PresetGroupProps) {
  const [open, setOpen] = useState(false)
  const allBlocked = presets.every((d) => blockedDomains.has(d))
  const blockedCount = presets.filter((d) => blockedDomains.has(d)).length

  return (
    <div className="rounded-xl border border-border/40 overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium hover:bg-muted/40 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          <span className={`text-xs transition-transform ${open ? 'rotate-90' : ''}`}>&#9654;</span>
          <span>{label}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
            {blockedCount}/{presets.length}
          </span>
        </div>
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {!allBlocked ? (
            <Button
              variant="outline"
              size="sm"
              className="h-7 rounded-lg text-[11px] px-3"
              onClick={async () => {
                try {
                  const added = await addPresetSites([...presets])
                  onAction()
                  if (added > 0) toast.success(`${added} sites blocked`)
                } catch {
                  toast.error('Failed to block sites')
                }
              }}
            >
              Block all
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-7 rounded-lg text-[11px] px-3 border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={async () => {
                try {
                  const removed = await removePresetSites([...presets])
                  onAction()
                  if (removed > 0) toast.success(`${removed} sites unblocked`)
                } catch {
                  toast.error('Failed to unblock sites')
                }
              }}
            >
              Unblock all
            </Button>
          )}
        </div>
      </button>
      {open && (
        <div className="border-t border-border/30 px-4 py-2 flex flex-wrap gap-1.5">
          {presets.map((domain) => {
            const isBlocked = blockedDomains.has(domain)
            return (
              <span
                key={domain}
                className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] ${
                  isBlocked
                    ? 'bg-primary/15 text-primary'
                    : 'bg-muted/50 text-muted-foreground'
                }`}
              >
                {domain}
                {isBlocked && (
                  <button
                    type="button"
                    className="ml-1.5 text-destructive hover:text-destructive/80"
                    onClick={async () => {
                      try {
                        await removeSite(domain)
                        onAction()
                        toast.success(`${domain} unblocked`)
                      } catch {
                        toast.error('Failed to unblock')
                      }
                    }}
                  >
                    &times;
                  </button>
                )}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
})

function App() {
  const isFullPage = useMemo(() => window.innerWidth > 400, [])

  const [data, setData] = useState<StorageData>({
    blockedSites: [],
    totalBlocks: 0,
    blockAllMode: false,
  })

  const loadData = useCallback(() => {
    getStorage().then(setData).catch(() => {
      toast.error('Failed to load blocked sites')
    })
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleRemove = useCallback(async (domain: string) => {
    try {
      await removeSite(domain)
      loadData()
      toast.success(`${domain} unblocked`)
    } catch {
      toast.error('Failed to remove site. Try again.')
    }
  }, [loadData])

  const handleExpand = useCallback(() => {
    const url = chrome.runtime.getURL('index.html')
    chrome.tabs.create({ url })
    window.close()
  }, [])

  const blockedDomains = useMemo(
    () => new Set(data.blockedSites.map((s) => s.domain)),
    [data.blockedSites],
  )

  const existingDomains = useMemo(
    () => data.blockedSites.map((s) => s.domain),
    [data.blockedSites],
  )

  if (!isFullPage) {
    return (
      <div className="animate-popup-in flex h-120 w-90 flex-col overflow-hidden rounded-2xl bg-background text-foreground">
        <PopupHeader onExpandClick={handleExpand} isFullPage={false} />
        <SiteInput existingDomains={existingDomains} onSiteAdded={loadData} />
        <SiteList sites={data.blockedSites} onRemove={handleRemove} />
        <StatsBar siteCount={data.blockedSites.length} totalBlocks={data.totalBlocks} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-8 md:py-16 lg:px-16">
        {/* Hero header */}
        <div className="mb-10 text-center md:mb-14">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/15 glow-toxic">
            <img src="/icons/icon.png" alt="" width={48} height={48} className="h-12 w-12" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-primary text-glow-toxic sm:text-3xl md:text-4xl">
            TouchGrassTab
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">block sites. get roasted. touch grass.</p>
        </div>

        {/* Main card */}
        <div className="animate-popup-in overflow-hidden rounded-2xl border border-border/40 bg-card shadow-xl shadow-primary/5 sm:rounded-3xl">
          {/* Input section */}
          <div className="border-b border-border/40 px-4 py-5 sm:px-8 sm:py-6">
            <SiteInput existingDomains={existingDomains} onSiteAdded={loadData} />
          </div>

          {/* Bulk block groups */}
          <div className="border-b border-border/40 px-4 py-4 sm:px-8 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Quick block</h3>
            {PRESET_GROUPS.map((group) => (
              <PresetGroup
                key={group.label}
                label={group.label}
                presets={group.presets}
                blockedDomains={blockedDomains}
                onAction={loadData}
              />
            ))}

            {/* Block Everything toggle */}
            <div className={`rounded-xl border overflow-hidden ${data.blockAllMode ? 'border-destructive/40 bg-destructive/5' : 'border-border/40'}`}>
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <span className="text-sm font-medium">Block Everything</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Redirects <em>every</em> website to the roast page. Nuclear option.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-7 rounded-lg text-[11px] px-3 shrink-0 ${
                    data.blockAllMode
                      ? 'border-destructive/30 text-destructive hover:bg-destructive/10'
                      : ''
                  }`}
                  onClick={async () => {
                    try {
                      await setBlockAllMode(!data.blockAllMode)
                      loadData()
                      toast.success(data.blockAllMode ? 'Block-everything mode disabled' : 'Block-everything mode enabled — every site will be roasted')
                    } catch {
                      toast.error('Failed to toggle block-everything mode')
                    }
                  }}
                >
                  {data.blockAllMode ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </div>
          </div>

          {/* Search hint */}
          <div className="px-4 py-2 sm:px-8 text-center">
            <p className="text-[11px] text-muted-foreground">
              Use <kbd className="rounded border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[10px] font-mono">Ctrl+F</kbd> / <kbd className="rounded border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[10px] font-mono">Cmd+F</kbd> to find a specific site
            </p>
          </div>

          {/* Site list */}
          <div className="max-h-[50vh] overflow-y-auto px-4 py-3 sm:px-6 md:max-h-[55vh]">
            <SiteList sites={data.blockedSites} onRemove={handleRemove} />
          </div>

          {/* Stats footer */}
          <StatsBar siteCount={data.blockedSites.length} totalBlocks={data.totalBlocks} />
        </div>
      </div>
    </div>
  )
}

export default App
