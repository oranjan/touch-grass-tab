export const SOCIAL_MEDIA_PRESETS: string[] = [
  // Social media
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
  // Video / streaming
  'youtube.com',
  'twitch.tv',
  // Messaging / forums
  'discord.com',
  'telegram.org',
  'web.whatsapp.com',
  // Time sinks
  'buzzfeed.com',
  '9gag.com',
  'imgur.com',
]

export interface BlockedSite {
  domain: string
  addedAt: number
  visitCount: number
}

export interface StorageData {
  blockedSites: BlockedSite[]
  totalBlocks: number
}

const DEFAULTS: StorageData = { blockedSites: [], totalBlocks: 0 }
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

export async function addSite(domain: string): Promise<void> {
  const { blockedSites, totalBlocks } = await getStorage()
  if (blockedSites.some((s) => s.domain === domain)) return
  blockedSites.push({ domain, addedAt: Date.now(), visitCount: 0 })
  await setStorage({ blockedSites, totalBlocks })
}

export async function removeSite(domain: string): Promise<void> {
  const { blockedSites, totalBlocks } = await getStorage()
  const filtered = blockedSites.filter((s) => s.domain !== domain)
  await setStorage({ blockedSites: filtered, totalBlocks })
}

export async function incrementVisitCount(domain: string): Promise<number> {
  const { blockedSites, totalBlocks } = await getStorage()
  const site = blockedSites.find((s) => s.domain === domain)
  if (!site) return 1
  site.visitCount += 1
  await setStorage({ blockedSites, totalBlocks: totalBlocks + 1 })
  return site.visitCount
}

export async function addPresetSites(): Promise<number> {
  const { blockedSites, totalBlocks } = await getStorage()
  let added = 0
  for (const domain of SOCIAL_MEDIA_PRESETS) {
    if (!blockedSites.some((s) => s.domain === domain)) {
      blockedSites.push({ domain, addedAt: Date.now(), visitCount: 0 })
      added++
    }
  }
  if (added > 0) await setStorage({ blockedSites, totalBlocks })
  return added
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
