import { useEffect, useState, useCallback, useMemo } from 'react'
import { getStorage, removeSite, addPresetSites, SOCIAL_MEDIA_PRESETS, type StorageData } from '@/lib/storage'
import { Button } from '@/components/ui/button'
import { PopupHeader } from '@/components/popup/PopupHeader'
import { SiteInput } from '@/components/popup/SiteInput'
import { SiteList } from '@/components/popup/SiteList'
import { StatsBar } from '@/components/popup/StatsBar'

function App() {
  const isFullPage = useMemo(() => window.innerWidth > 400, [])

  const [data, setData] = useState<StorageData>({
    blockedSites: [],
    totalBlocks: 0,
  })

  const loadData = useCallback(() => {
    getStorage().then(setData)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleRemove = async (domain: string) => {
    await removeSite(domain)
    loadData()
  }

  const handleExpand = () => {
    const url = chrome.runtime.getURL('index.html')
    chrome.tabs.create({ url })
    window.close()
  }

  const content = (
    <>
      <PopupHeader onExpandClick={handleExpand} isFullPage={isFullPage} />
      <SiteInput
        existingDomains={data.blockedSites.map((s) => s.domain)}
        onSiteAdded={loadData}
      />
      {!SOCIAL_MEDIA_PRESETS.every((d) => data.blockedSites.some((s) => s.domain === d)) && (
        <div className="px-4 pb-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-xl text-xs"
            onClick={async () => {
              await addPresetSites()
              loadData()
            }}
          >
            Block all social media
          </Button>
        </div>
      )}
      <SiteList sites={data.blockedSites} onRemove={handleRemove} />
      <StatsBar siteCount={data.blockedSites.length} totalBlocks={data.totalBlocks} />
    </>
  )

  if (!isFullPage) {
    return (
      <div className="animate-popup-in flex h-120 w-90 flex-col overflow-hidden rounded-2xl bg-background text-foreground">
        {content}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-8 md:py-16 lg:px-16">
        {/* Hero header */}
        <div className="mb-10 text-center md:mb-14">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/15 glow-toxic">
            <img src="/touchgrass.svg" alt="" width={48} height={48} className="h-12 w-12" />
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
            <SiteInput
              existingDomains={data.blockedSites.map((s) => s.domain)}
              onSiteAdded={loadData}
            />
            {!SOCIAL_MEDIA_PRESETS.every((d) => data.blockedSites.some((s) => s.domain === d)) && (
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl text-xs"
                  onClick={async () => {
                    await addPresetSites()
                    loadData()
                  }}
                >
                  Block all social media
                </Button>
              </div>
            )}
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
