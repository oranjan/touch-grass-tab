import type { BlockedSite } from './lib/storage'
import { normalizeDomain } from './lib/url-utils'

async function getBlockConfig(): Promise<{ domains: string[]; blockAll: boolean }> {
  const data = await chrome.storage.local.get(['blockedSites', 'blockAllMode'])
  const sites = (data.blockedSites as BlockedSite[] | undefined) ?? []
  return {
    domains: sites.map((s) => s.domain.toLowerCase()),
    blockAll: (data.blockAllMode as boolean | undefined) ?? false,
  }
}

function matchesDomain(hostname: string, domains: string[]): string | null {
  const h = hostname.toLowerCase()
  for (const domain of domains) {
    if (h === domain || h.endsWith(`.${domain}`)) {
      return domain
    }
  }
  return null
}

// Returns the matched domain string if the URL should be blocked, or null
async function shouldBlock(url: string): Promise<string | null> {
  let hostname: string
  try {
    hostname = new URL(url).hostname
  } catch {
    return null
  }

  const { domains, blockAll } = await getBlockConfig()

  if (blockAll) return hostname

  return matchesDomain(hostname, domains)
}

// Track tabs we've already redirected to avoid infinite loops
const redirectedTabs = new Set<number>()

// Use tabs.onUpdated to catch ALL navigations, including 302 redirects from Google
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (!changeInfo.url) return
  if (changeInfo.url.startsWith(chrome.runtime.getURL(''))) {
    redirectedTabs.delete(tabId)
    return
  }
  if (redirectedTabs.has(tabId)) return

  const domain = await shouldBlock(changeInfo.url)
  if (!domain) return

  redirectedTabs.add(tabId)
  chrome.tabs.update(tabId, {
    url: chrome.runtime.getURL(`blocked.html?site=${encodeURIComponent(domain)}`),
  })
})

// Catch initial navigations before they start
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return
  if (details.url.startsWith(chrome.runtime.getURL(''))) return
  if (redirectedTabs.has(details.tabId)) return

  const domain = await shouldBlock(details.url)
  if (!domain) return

  redirectedTabs.add(details.tabId)
  chrome.tabs.update(details.tabId, {
    url: chrome.runtime.getURL(`blocked.html?site=${encodeURIComponent(domain)}`),
  })
})

// Catch navigations AFTER server-side redirects resolve (e.g. google.com/url → instagram.com)
chrome.webNavigation.onCommitted.addListener(async (details) => {
  if (details.frameId !== 0) return
  if (details.url.startsWith(chrome.runtime.getURL(''))) return
  if (redirectedTabs.has(details.tabId)) return

  const domain = await shouldBlock(details.url)
  if (!domain) return

  redirectedTabs.add(details.tabId)
  chrome.tabs.update(details.tabId, {
    url: chrome.runtime.getURL(`blocked.html?site=${encodeURIComponent(domain)}`),
  })
})

// Clean up when a tab finishes loading our blocked page or is closed
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete') {
    redirectedTabs.delete(tabId)
  }
})

chrome.tabs.onRemoved.addListener((tabId) => {
  redirectedTabs.delete(tabId)
})

// Context menu: "Block this site with TouchGrassTab"
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'block-current-site',
    title: 'Block this site with TouchGrassTab',
    contexts: ['page'],
    documentUrlPatterns: ['http://*/*', 'https://*/*'],
  })
})

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== 'block-current-site') return
  if (!tab?.url) return

  // Don't allow blocking extension pages, chrome pages, etc.
  if (!tab.url.startsWith('http://') && !tab.url.startsWith('https://')) return

  let hostname: string
  try {
    hostname = new URL(tab.url).hostname
  } catch {
    return
  }

  const domain = normalizeDomain(hostname)
  if (!domain) return

  // Add to blocked sites via storage API
  const data = await chrome.storage.local.get(['blockedSites'])
  const sites = (data.blockedSites as BlockedSite[] | undefined) ?? []
  if (sites.some((s) => s.domain === domain)) return // already blocked

  sites.push({ domain, addedAt: Date.now(), visitCount: 0 })
  await chrome.storage.local.set({ blockedSites: sites })

  // Redirect the current tab to the blocked page
  if (tab.id) {
    const blockedUrl = chrome.runtime.getURL(
      `blocked.html?site=${encodeURIComponent(domain)}`
    )
    redirectedTabs.add(tab.id)
    chrome.tabs.update(tab.id, { url: blockedUrl })
  }
})
