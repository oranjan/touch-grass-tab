export const SOCIAL_MEDIA_PRESETS: string[] = [
  'facebook.com',
  'instagram.com',
  'twitter.com',
  'x.com',
  'tiktok.com',
  'snapchat.com',
  'reddit.com',
  'threads.net',
  'linkedin.com',
  'pinterest.com',
  'tumblr.com',
  'youtube.com',
  'twitch.tv',
  'discord.com',
  'telegram.org',
  'web.whatsapp.com',
  'buzzfeed.com',
  '9gag.com',
  'imgur.com',
]

export const TOP_30_SITES: string[] = [
  // Search & portals
  'google.com',
  'bing.com',
  'yahoo.com',
  'baidu.com',
  'yandex.com',
  // Social media (overlap with SOCIAL_MEDIA_PRESETS)
  'facebook.com',
  'instagram.com',
  'twitter.com',
  'x.com',
  'tiktok.com',
  'reddit.com',
  'linkedin.com',
  'pinterest.com',
  // Video & streaming
  'youtube.com',
  'twitch.tv',
  'netflix.com',
  // Messaging
  'discord.com',
  'web.whatsapp.com',
  'telegram.org',
  // News & media
  'cnn.com',
  'bbc.com',
  'nytimes.com',
  // Shopping
  'amazon.com',
  'ebay.com',
  'aliexpress.com',
  // Entertainment & misc
  'wikipedia.org',
  'fandom.com',
  'imdb.com',
  'quora.com',
  'medium.com',
  'spotify.com',
]

export const ADULT_SITES: string[] = [
  'pornhub.com',
  'xvideos.com',
  'xhamster.com',
  'xnxx.com',
  'redtube.com',
  'youporn.com',
  'spankbang.com',
  'eporner.com',
  'tube8.com',
  'pornone.com',
  'ixxx.com',
  'tnaflix.com',
  'drtuber.com',
  'hclips.com',
  'porntrex.com',
  'thumbzilla.com',
  'fuq.com',
  'beeg.com',
  'porn.com',
  'chaturbate.com',
  'stripchat.com',
  'bongacams.com',
  'cam4.com',
  'livejasmin.com',
  'onlyfans.com',
  'fansly.com',
  'redgifs.com',
]

export const ALL_SITES: string[] = [
  ...new Set([
    ...SOCIAL_MEDIA_PRESETS,
    ...TOP_30_SITES,
    ...ADULT_SITES,
    // Additional sites
    'snapchat.com',
    'threads.net',
    'tumblr.com',
    'buzzfeed.com',
    '9gag.com',
    'imgur.com',
    'dailymotion.com',
    'vimeo.com',
    'soundcloud.com',
    'pandora.com',
    'hulu.com',
    'disneyplus.com',
    'hbomax.com',
    'primevideo.com',
    'crunchyroll.com',
    'twitch.tv',
    'kick.com',
    'rumble.com',
    'bilibili.com',
    'weibo.com',
    'vk.com',
    'ok.ru',
    'line.me',
    'kakaotalk.com',
    'wechat.com',
    'signal.org',
    'slack.com',
    'teams.microsoft.com',
    'zoom.us',
    'skype.com',
    'clubhouse.com',
    'mastodon.social',
    'bluesky.social',
    'truth-social.com',
    'parler.com',
    'gab.com',
    'flickr.com',
    'deviantart.com',
    'behance.net',
    'dribbble.com',
    'producthunt.com',
    'hackernews.com',
    'news.ycombinator.com',
    'digg.com',
    'slashdot.org',
    'techcrunch.com',
    'theverge.com',
    'mashable.com',
    'huffpost.com',
    'foxnews.com',
    'washingtonpost.com',
    'theguardian.com',
    'reuters.com',
    'apnews.com',
    'vice.com',
    'vox.com',
    'wired.com',
    'arstechnica.com',
    'engadget.com',
    'gizmodo.com',
    'kotaku.com',
    'polygon.com',
    'ign.com',
    'gamespot.com',
    'twitch.tv',
    'roblox.com',
    'steampowered.com',
    'epicgames.com',
    'ea.com',
    'walmart.com',
    'target.com',
    'bestbuy.com',
    'etsy.com',
    'wish.com',
    'shein.com',
    'temu.com',
    'flipkart.com',
    'shopify.com',
    'zillow.com',
    'craigslist.org',
    'yelp.com',
    'tripadvisor.com',
    'booking.com',
    'airbnb.com',
    'expedia.com',
    'kayak.com',
    'indeed.com',
    'glassdoor.com',
    'monster.com',
    'fiverr.com',
    'upwork.com',
  ]),
]

export interface BlockedSite {
  domain: string
  addedAt: number
  visitCount: number
}

export interface StorageData {
  blockedSites: BlockedSite[]
  totalBlocks: number
  blockAllMode: boolean
}

const DEFAULTS: StorageData = { blockedSites: [], totalBlocks: 0, blockAllMode: false }
const STORAGE_KEY = 'touchgrasstab'

const isChromeExtension = typeof chrome !== 'undefined' && !!chrome.storage?.local

function getLocalStorage(): StorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULTS }
    return JSON.parse(raw) as StorageData
  } catch {
    return { ...DEFAULTS }
  }
}

function setLocalStorage(data: StorageData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export async function getStorage(): Promise<StorageData> {
  if (!isChromeExtension) return getLocalStorage()

  const keys = Object.keys(DEFAULTS) as (keyof StorageData)[]
  const data = await chrome.storage.local.get(keys)
  return {
    blockedSites: (data.blockedSites as BlockedSite[] | undefined) ?? DEFAULTS.blockedSites,
    totalBlocks: (data.totalBlocks as number | undefined) ?? DEFAULTS.totalBlocks,
    blockAllMode: (data.blockAllMode as boolean | undefined) ?? DEFAULTS.blockAllMode,
  }
}

async function setStorage(data: Partial<StorageData>): Promise<void> {
  if (!isChromeExtension) {
    const current = getLocalStorage()
    setLocalStorage({ ...current, ...data })
    return
  }
  await chrome.storage.local.set(data)
}

export async function setBlockAllMode(enabled: boolean): Promise<void> {
  await setStorage({ blockAllMode: enabled })
}

export async function addSite(domain: string): Promise<void> {
  const { blockedSites, totalBlocks } = await getStorage()
  if (blockedSites.some((s) => s.domain === domain)) return
  const updated = [...blockedSites, { domain, addedAt: Date.now(), visitCount: 0 }]
  await setStorage({ blockedSites: updated, totalBlocks })
}

export async function removeSite(domain: string): Promise<void> {
  const { blockedSites, totalBlocks } = await getStorage()
  const filtered = blockedSites.filter((s) => s.domain !== domain)
  await setStorage({ blockedSites: filtered, totalBlocks })
}

export async function incrementVisitCount(domain: string): Promise<number> {
  const { blockedSites, totalBlocks } = await getStorage()
  const index = blockedSites.findIndex((s) => s.domain === domain)
  if (index === -1) return 1
  const updated = blockedSites.map((s, i) =>
    i === index ? { ...s, visitCount: s.visitCount + 1 } : s
  )
  await setStorage({ blockedSites: updated, totalBlocks: totalBlocks + 1 })
  return updated[index].visitCount
}

export async function addPresetSites(presets: string[] = SOCIAL_MEDIA_PRESETS): Promise<number> {
  const { blockedSites, totalBlocks } = await getStorage()
  const existingDomains = new Set(blockedSites.map((s) => s.domain))
  const newSites = presets
    .filter((d) => !existingDomains.has(d))
    .map((domain) => ({ domain, addedAt: Date.now(), visitCount: 0 }))
  if (newSites.length > 0) {
    await setStorage({ blockedSites: [...blockedSites, ...newSites], totalBlocks })
  }
  return newSites.length
}

export async function removePresetSites(presets: string[]): Promise<number> {
  const { blockedSites, totalBlocks } = await getStorage()
  const toRemove = new Set(presets)
  const filtered = blockedSites.filter((s) => !toRemove.has(s.domain))
  const removed = blockedSites.length - filtered.length
  if (removed > 0) await setStorage({ blockedSites: filtered, totalBlocks })
  return removed
}

export function onStorageChange(
  cb: (data: StorageData) => void,
): () => void {
  if (!isChromeExtension) return () => {}
  const listener = () => {
    getStorage().then(cb)
  }
  chrome.storage.onChanged.addListener(listener)
  return () => chrome.storage.onChanged.removeListener(listener)
}
