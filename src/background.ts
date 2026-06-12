import { addTimeSpent, type BlockedSite } from './lib/storage'
import { normalizeDomain } from './lib/url-utils'
import { cappedElapsed, trackableDomain } from './lib/time-tracker'

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

function blockedPageUrl(domain: string): string {
  return chrome.runtime.getURL(`blocked.html?site=${encodeURIComponent(domain)}`)
}

async function tryRedirect(tabId: number, url: string) {
  if (url.startsWith(chrome.runtime.getURL(''))) {
    redirectedTabs.delete(tabId)
    return
  }
  if (redirectedTabs.has(tabId)) return

  const domain = await shouldBlock(url)
  if (!domain) return

  redirectedTabs.add(tabId)
  chrome.tabs.update(tabId, { url: blockedPageUrl(domain) })
}

// Catch ALL navigations including 302 redirects from Google
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url) tryRedirect(tabId, changeInfo.url)
})

// Catch initial navigations before they start
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId === 0) tryRedirect(details.tabId, details.url)
})

// Catch navigations AFTER server-side redirects resolve (e.g. google.com/url → instagram.com)
chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.frameId === 0) tryRedirect(details.tabId, details.url)
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
    redirectedTabs.add(tab.id)
    chrome.tabs.update(tab.id, { url: blockedPageUrl(domain) })
  }
})

// ───────────────────────────────────────────────────────────────────────────
// Time tracking — how long the user actively spends on each website.
//
// We keep one "active session" ({ domain, since }) describing the page the user
// is currently looking at. When the foreground page changes, the browser loses
// focus, or the user goes idle, we credit the elapsed time to that domain and
// either start a new session or stop. A 1-minute heartbeat alarm keeps long
// single-page sessions accruing and bounds over-counting after suspension.
//
// Session state lives in chrome.storage.local (not module memory) so it
// survives the service worker being suspended between events.
// ───────────────────────────────────────────────────────────────────────────

interface ActiveSession {
  domain: string
  since: number
}

const ACTIVE_SESSION_KEY = 'tt_activeSession'
const BROWSER_FOCUSED_KEY = 'tt_browserFocused'
const TICK_ALARM = 'tt-tick'
const IDLE_SECONDS = 60

async function getActiveSession(): Promise<ActiveSession | null> {
  const data = await chrome.storage.local.get([ACTIVE_SESSION_KEY])
  return (data[ACTIVE_SESSION_KEY] as ActiveSession | undefined) ?? null
}

async function setActiveSession(session: ActiveSession | null): Promise<void> {
  await chrome.storage.local.set({ [ACTIVE_SESSION_KEY]: session })
}

async function isBrowserFocused(): Promise<boolean> {
  const data = await chrome.storage.local.get([BROWSER_FOCUSED_KEY])
  // Default to focused: on a fresh worker we assume the user is looking at Chrome.
  return (data[BROWSER_FOCUSED_KEY] as boolean | undefined) ?? true
}

async function setBrowserFocused(focused: boolean): Promise<void> {
  await chrome.storage.local.set({ [BROWSER_FOCUSED_KEY]: focused })
}

async function isUserActive(): Promise<boolean> {
  try {
    return (await chrome.idle.queryState(IDLE_SECONDS)) === 'active'
  } catch {
    return true // idle API unavailable → don't block tracking
  }
}

async function currentForegroundDomain(): Promise<string | null> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
    return trackableDomain(tab?.url)
  } catch {
    return null
  }
}

async function creditSession(session: ActiveSession | null, now: number): Promise<void> {
  if (!session) return
  const ms = cappedElapsed(session.since, now)
  if (ms > 0) await addTimeSpent(session.domain, ms)
}

// Credit the open session and stop tracking entirely (blur / idle / lock).
async function stopTracking(now: number): Promise<void> {
  const prev = await getActiveSession()
  if (!prev) return
  await creditSession(prev, now)
  await setActiveSession(null)
}

// Credit the open session and rebase onto whatever is in the foreground now.
async function rebaseTracking(now: number): Promise<void> {
  const prev = await getActiveSession()
  await creditSession(prev, now)

  const trackable = (await isBrowserFocused()) && (await isUserActive())
  const domain = trackable ? await currentForegroundDomain() : null

  if (domain) {
    await setActiveSession({ domain, since: now })
  } else if (prev) {
    await setActiveSession(null)
  }
}

chrome.tabs.onActivated.addListener(() => {
  rebaseTracking(Date.now())
})

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  // The active tab navigated to a new URL — switch the session's domain.
  if (tab.active && changeInfo.url) rebaseTracking(Date.now())
})

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  const now = Date.now()
  const focused = windowId !== chrome.windows.WINDOW_ID_NONE
  await setBrowserFocused(focused)
  if (focused) await rebaseTracking(now)
  else await stopTracking(now)
})

chrome.idle.onStateChanged.addListener((state) => {
  const now = Date.now()
  if (state === 'active') rebaseTracking(now)
  else stopTracking(now)
})

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === TICK_ALARM) rebaseTracking(Date.now())
})

function initTimeTracking(): void {
  chrome.idle.setDetectionInterval(IDLE_SECONDS)
  chrome.alarms.create(TICK_ALARM, { periodInMinutes: 1 })
}

// Set the idle interval on every worker spin-up (idempotent); (re)create the
// heartbeat alarm on install and browser startup.
chrome.idle.setDetectionInterval(IDLE_SECONDS)
chrome.runtime.onInstalled.addListener(initTimeTracking)
chrome.runtime.onStartup.addListener(initTimeTracking)
