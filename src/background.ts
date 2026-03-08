import type { BlockedSite } from './lib/storage'

async function getBlockedDomains(): Promise<string[]> {
  const data = await chrome.storage.local.get(['blockedSites'])
  const sites = (data.blockedSites as BlockedSite[] | undefined) ?? []
  return sites.map((s) => s.domain.toLowerCase())
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

// Track tabs we've already redirected to avoid infinite loops
const redirectedTabs = new Set<number>()

// Use tabs.onUpdated to catch ALL navigations, including 302 redirects from Google
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  // Only act when the URL actually changes
  if (!changeInfo.url) return

  let hostname: string
  try {
    hostname = new URL(changeInfo.url).hostname
  } catch {
    return
  }

  // Don't redirect if already on our extension page
  if (changeInfo.url.startsWith(chrome.runtime.getURL(''))) {
    redirectedTabs.delete(tabId)
    return
  }

  // Avoid double-redirecting the same tab
  if (redirectedTabs.has(tabId)) return

  const domains = await getBlockedDomains()
  const domain = matchesDomain(hostname, domains)
  if (!domain) return

  const blockedUrl = chrome.runtime.getURL(
    `blocked.html?site=${encodeURIComponent(domain)}`
  )

  redirectedTabs.add(tabId)
  chrome.tabs.update(tabId, { url: blockedUrl })
})

// Catch initial navigations before they start
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return

  let hostname: string
  try {
    hostname = new URL(details.url).hostname
  } catch {
    return
  }

  if (details.url.startsWith(chrome.runtime.getURL(''))) return
  if (redirectedTabs.has(details.tabId)) return

  const domains = await getBlockedDomains()
  const domain = matchesDomain(hostname, domains)
  if (!domain) return

  const blockedUrl = chrome.runtime.getURL(
    `blocked.html?site=${encodeURIComponent(domain)}`
  )

  redirectedTabs.add(details.tabId)
  chrome.tabs.update(details.tabId, { url: blockedUrl })
})

// Catch navigations AFTER server-side redirects resolve (e.g. google.com/url → instagram.com)
chrome.webNavigation.onCommitted.addListener(async (details) => {
  if (details.frameId !== 0) return

  let hostname: string
  try {
    hostname = new URL(details.url).hostname
  } catch {
    return
  }

  if (details.url.startsWith(chrome.runtime.getURL(''))) return
  if (redirectedTabs.has(details.tabId)) return

  const domains = await getBlockedDomains()
  const domain = matchesDomain(hostname, domains)
  if (!domain) return

  const blockedUrl = chrome.runtime.getURL(
    `blocked.html?site=${encodeURIComponent(domain)}`
  )

  redirectedTabs.add(details.tabId)
  chrome.tabs.update(details.tabId, { url: blockedUrl })
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
