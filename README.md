# TouchGrassTab

**Block sites. Get roasted. Touch grass.**

A Chrome extension that blocks distracting websites and roasts you with escalating Gen Z humor when you try to visit them. The more you try, the harder it hits.

### [> Download TouchGrassTab (ZIP)](https://github.com/oranjan/touch-grass-tab/raw/main/touchgrasstab.zip)

**Quick install:** Download the ZIP > Unzip > Open `chrome://extensions` > Enable Developer mode > Load unpacked > Select the folder > Done.

---

## What It Does

You add websites you want to stop visiting. When you try to open one, the extension hijacks the page and hits you with:

- A **flashbang** — strobing colors, spinning text, and sound spam
- A **roast** — pulled from 35+ insults that get meaner the more you visit
- A **skull rain** — falling emoji chaos raining down on your screen
- A **"Touch Grass" button** — opens Google Maps to find parks near you

The punishment escalates. First visit? A quick 2-second flash and a mild roast. Tenth visit? 32 seconds of chaos, screen shaking, 40 falling skulls, and an "INTERVENTION MODE" warning. It's designed to make you not want to come back.

## Features

- **Site Blocking** — Add any website. It gets intercepted and redirected to a roast page.
- **Escalating Roasts** — 5 tiers of insults that get progressively harsher (mild > medium > harsh > nuclear > final boss).
- **Flashbang Mode** — Strobing colors, spinning text, hue rotation, and 10 sound effects spamming every 400ms.
- **Intervention Mode** — After 10+ visits: screen shake, double the skull rain, warning badges.
- **6 Themes** — Skibidi Sigma, Fanum Tax, Rizz Mode, NPC Mode, Ohio Final Boss, Aura Points.
- **Social Media Presets** — One click to block 25 common social media sites.
- **Visit Tracking** — Per-site and total counters so you can see your shame in numbers.
- **Touch Grass Button** — Google Maps parks search. Go outside.
- **Reduced Motion Support** — Respects `prefers-reduced-motion` for accessibility.

## Install

1. [**Download the ZIP**](https://github.com/oranjan/touch-grass-tab/raw/main/touchgrasstab.zip)
2. Unzip it
3. Open **`chrome://extensions`** in Chrome (or `edge://extensions` in Edge)
4. Enable **Developer mode** (toggle in the top right)
5. Click **Load unpacked**
6. Select the unzipped folder
7. Done — try visiting a blocked site and get roasted

## Themes

| Theme | Vibe |
|-------|------|
| Skibidi Sigma | Neon green on void black, terminal grindset |
| Fanum Tax | Purple + magenta, main character energy |
| Rizz Mode | Warm sunset coral on cream, touch grass aesthetic |
| NPC Mode | Navy + cyan, lo-fi zen vibes |
| Ohio Final Boss | Acid yellow, Y2K maximalist chaos |
| Aura Points | Forest green + warm gold, anti-hustle |

## Permissions

| Permission | Why |
|-----------|-----|
| `storage` | Save your blocked sites and visit counts |
| `webNavigation` | Detect when you navigate to a blocked site |
| `tabs` | Redirect your tab to the roast page |
| `<all_urls>` | Needed to intercept navigation to any website |

---
---

# Technical Documentation

Everything below is the technical breakdown of how the extension works — architecture, data flow, file structure, and implementation details. This section is for developers, AI agents, and anyone who wants to understand or contribute to the codebase.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 5.9 |
| Build | Vite 7 + [@crxjs/vite-plugin](https://github.com/nicedoc/crxjs) (Chrome Extension bundling) |
| Styling | Tailwind CSS 4 + tw-animate-css |
| Components | Shadcn UI (base-nova style) + Base UI + Lucide icons |
| Fonts | Outfit (display), Space Grotesk (headings) |
| Extension | Chrome Manifest V3 |
| Testing | Vitest + Testing Library + jsdom |
| Linting | ESLint with TypeScript support |

## Project Structure

```
TouchGrassTab/
├── public/
│   ├── sounds/                      # 10 sound effects (.mp3)
│   │   ├── bruh.mp3, clown-horn.mp3, crickets.mp3
│   │   ├── emergency-meeting.mp3, fart.mp3
│   │   ├── record-scratch.mp3, rizz.mp3
│   │   ├── sad-trombone.mp3, vine-boom.mp3, wow.mp3
│   └── touchgrass.svg               # Extension icon
│
├── src/
│   ├── main.tsx                     # Popup React entry point
│   ├── blocked-main.tsx             # Blocked page React entry point
│   ├── App.tsx                      # Popup app (site management UI)
│   ├── BlockedApp.tsx               # Blocked page (flashbang + roast)
│   ├── background.ts               # Service worker (intercepts navigation)
│   ├── index.css                    # Global styles, animations, effects
│   ├── App.css                      # Minimal app styles
│   │
│   ├── components/
│   │   ├── popup/                   # Popup-specific components
│   │   │   ├── PopupHeader.tsx      # Header with logo + expand button
│   │   │   ├── SiteInput.tsx        # Domain input form
│   │   │   ├── SiteList.tsx         # Scrollable list of blocked sites
│   │   │   ├── SiteItem.tsx         # Single site row (favicon, domain, count, delete)
│   │   │   └── StatsBar.tsx         # Footer stats (sites blocked, total interventions)
│   │   ├── blocked/                 # Blocked page components
│   │   │   ├── RoastModal.tsx       # Roast message card with comeback + CTA
│   │   │   └── SkullRain.tsx        # Falling emoji animation overlay
│   │   └── ui/                      # Shadcn base components
│   │       ├── button.tsx, badge.tsx, input.tsx, card.tsx
│   │
│   └── lib/                         # Utility modules
│       ├── storage.ts               # Chrome storage API wrapper + localStorage fallback
│       ├── insults.ts               # Roast messages (5 tiers), page titles, emojis, comebacks
│       ├── sounds.ts                # Sound playback (sequential + spam modes)
│       ├── themes.ts                # 6 theme definitions + CSS variable application
│       ├── url-utils.ts             # Domain normalization (URL → clean domain)
│       ├── utils.ts                 # cn() helper (clsx + tailwind-merge)
│       └── __tests__/               # Unit tests (42 tests across 5 files)
│
├── index.html                       # Popup HTML shell
├── blocked.html                     # Blocked page HTML shell
├── manifest.json                    # Chrome Extension Manifest V3
├── vite.config.ts                   # Vite + CRX plugin config
├── tsconfig.json / tsconfig.app.json
├── components.json                  # Shadcn UI configuration
├── eslint.config.js                 # ESLint rules (350 line max per file)
└── package.json                     # Dependencies and scripts
```

## Architecture

### Three Entry Points

The extension has three independent entry points that never share runtime context:

1. **Popup** (`index.html` → `main.tsx` → `App.tsx`) — The toolbar popup UI where users manage their blocked sites list. Renders at 360×480px in popup mode or full-page when opened in a tab (`window.innerWidth > 400` detection).

2. **Blocked Page** (`blocked.html` → `blocked-main.tsx` → `BlockedApp.tsx`) — The full-page roast experience shown when a user tries to visit a blocked site. Receives the blocked domain via `?site=` query parameter.

3. **Service Worker** (`background.ts`) — Runs in the background with no UI. Listens to Chrome navigation events and redirects matching tabs to `blocked.html`.

### Data Flow

```
User navigates to blocked site
    ↓
Service Worker detects navigation via 3 listeners:
  • chrome.webNavigation.onBeforeNavigate (initial request)
  • chrome.tabs.onUpdated (all URL changes, catches 302s)
  • chrome.webNavigation.onCommitted (post-redirect)
    ↓
Extract hostname → normalize → check against blocked list
    ↓
Match found → chrome.tabs.update(tabId, { url: blocked.html?site=domain })
    ↓
Tab added to redirectedTabs Set (prevents infinite redirect loops)
    ↓
BlockedApp.tsx loads:
  1. Sanitize ?site= parameter (strip non-domain chars)
  2. incrementVisitCount(domain) in Chrome Storage
  3. Calculate flashbang duration: 2000ms + (visitCount × 3000ms)
  4. Phase 1: White flash (instant)
  5. Phase 2: Flashbang (strobing + sound spam every 400ms)
  6. Phase 3: RoastModal + SkullRain
    ↓
Popup reflects updated visit counts on next open
```

### Why Triple Navigation Listeners?

Some navigations (especially redirect chains from link shorteners, Google results, etc.) are only visible at certain stages of the Chrome navigation pipeline. Using three listeners — `onBeforeNavigate`, `onUpdated`, and `onCommitted` — ensures no navigation slips through regardless of how the user reaches the blocked site.

### Redirect Loop Prevention

A `redirectedTabs` Set tracks tab IDs currently being redirected. If a tab is already in the set, the redirect is skipped. Tabs are removed from the set when they finish loading or are closed. This prevents the blocked page URL itself from triggering another redirect.

### Domain Matching

```typescript
// Supports exact and subdomain matching
const h = hostname.toLowerCase()
for (const domain of domains) {
  if (h === domain || h.endsWith(`.${domain}`)) {
    return domain  // "www.instagram.com" matches "instagram.com"
  }
}
```

This prevents bypass via subdomains — blocking `instagram.com` also blocks `www.instagram.com`, `m.instagram.com`, etc.

### URL Normalization

`src/lib/url-utils.ts` converts any user input into a clean domain:
- `https://www.instagram.com/reels/` → `instagram.com`
- `WWW.TWITTER.COM` → `twitter.com`
- `reddit.com/r/programming` → `reddit.com`

## Storage

### Schema

```typescript
interface BlockedSite {
  domain: string      // normalized domain (e.g. "instagram.com")
  addedAt: number     // timestamp in ms
  visitCount: number  // times user tried to visit
}

interface StorageData {
  blockedSites: BlockedSite[]
  totalBlocks: number  // cumulative across all sites
}
```

### Dual Backend

`src/lib/storage.ts` uses `chrome.storage.local` in extension context, falling back to `localStorage` for development and testing outside the extension. Detection:

```typescript
const isChromeExtension = typeof chrome !== 'undefined' && !!chrome.storage?.local
```

### API

| Function | Purpose |
|----------|---------|
| `getStorage()` | Read entire storage state |
| `addSite(domain)` | Add domain (skips duplicates) |
| `removeSite(domain)` | Remove domain |
| `incrementVisitCount(domain)` | Bump visit counter + totalBlocks, returns new count |
| `addPresetSites()` | Bulk-add 25 social media sites |
| `onStorageChange(callback)` | Subscribe to storage updates |

## Roast System

`src/lib/insults.ts` — 35+ messages across 5 tiers:

| Tier | Visit Count | Tone | Example |
|------|-------------|------|---------|
| 1 | 1–7 | Mild | "bro really said 'one more scroll' for the 47th time today" |
| 2 | 8–14 | Medium | "your ancestors survived the black plague for you to be on THIS app?" |
| 3 | 15–21 | Harsh | "GIRL. THE DELULU IS NOT THE SOLULU." |
| 4 | 22–27 | Nuclear | "the FBI agent watching your screen submitted their two weeks notice" |
| 5 | 28+ | Final Boss | "this website should charge u rent at this point fr fr" |

At 10+ visits, **Intervention Mode** activates: screen shake, 40 skulls (vs 20), and a warning badge.

## Blocked Page Sequence

Three phases play in order when the user lands on the blocked page:

1. **White flash** — Instant full-screen white overlay
2. **Flashbang** (2s + 3s per visit) — Strobing colors every 150ms, spinning/skewing text, hue rotation, sound spam (random sound every 400ms from 10 available sounds)
3. **Roast modal** — The insult, visit count badge, comeback line, and "Touch Grass" button (Google Maps parks search)

Duration scales with addiction: 1st visit = 2s, 5th = 17s, 10th = 32s.

## Sound System

`src/lib/sounds.ts` manages 10 sound effects: bruh, clown-horn, crickets, emergency-meeting, fart, record-scratch, rizz, sad-trombone, vine-boom, wow.

| Function | Behavior |
|----------|----------|
| `playNextSound()` | Round-robin through sounds sequentially |
| `playSound(name)` | Play specific sound (whitelist-validated against path traversal) |
| `spamSounds(duration, interval)` | Random sounds every N ms for D duration |

During flashbang: `spamSounds(flashDuration, 400)` — so a 32-second flashbang plays ~80 random sounds.

## Theme System

`src/lib/themes.ts` — 6 themes, each defining 18 CSS custom properties applied to document root. Selection persists via `localStorage`.

| Theme | Mode | Palette |
|-------|------|---------|
| Skibidi Sigma | Dark | Neon green (#39ff14) on void black |
| Fanum Tax | Dark | Deep purple (#c850ff) + hot magenta |
| Rizz Mode | Light | Warm sunset coral on cream |
| NPC Mode | Dark | Muted navy + cyan |
| Ohio Final Boss | Light | Acid yellow (#e8ff00) on black |
| Aura Points | Dark | Forest green + warm gold |

CSS variables set: `--background`, `--foreground`, `--card`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring` (plus foreground variants).

## Animations

All defined in `src/index.css`:

| Animation | Duration | Purpose |
|-----------|----------|---------|
| `flashbang` | 0.15s infinite | Strobing colors + screen shake |
| `flashbang-text` | 0.12s infinite | Scale + rotate + skew chaos |
| `flashbang-spin` | 0.3s infinite | Continuous 360° rotation |
| `flashbang-hue` | 0.2s infinite | Hue rotate + saturate |
| `fall` | 3–7s | Skull rain emoji falling |
| `modal-enter` | 0.6s | Spring entrance for roast card |
| `shake` | 0.6s | Screen vibration (intervention) |
| `popup-in` | 0.25s | Popup entrance, scale + fade |

Visual effects: grain overlay (SVG fractal noise at 3% opacity), glow utilities via `color-mix()`, glitch text (pink/green offset pseudo-elements), pride gradient border on blocked page.

## Component Hierarchy

### Popup

```
App
  ├── PopupHeader (logo + expand button)
  ├── SiteInput (domain input form)
  ├── Button "Block all social media"
  ├── SiteList
  │   └── SiteItem × N (favicon, domain, visit count badge, delete button)
  └── StatsBar (sites blocked count, total interventions)
```

### Blocked Page

```
BlockedApp
  ├── Phase 1: White flash overlay
  ├── Phase 2: Flashbang layers (spinning text, hue rotation, tiled site name)
  └── Phase 3: Main content
      ├── Pride gradient background + vignette overlay
      ├── SkullRain (20–40 falling emoji elements)
      └── RoastModal
          ├── Shame banner (flicker effect)
          ├── Giant emoji (spin/bounce)
          ├── Site callout (strikethrough domain)
          ├── The roast (red text)
          ├── Intervention divider (if 10+ visits)
          ├── Shame counter (if 3+ visits)
          └── "Touch Grass Now" button
```

## Security

- **URL parameter sanitization**: `?site=` stripped to only `[a-zA-Z0-9.\-]`, max 253 chars
- **Sound whitelist**: `playSound()` validates against hardcoded list to prevent path traversal
- **CSP**: Content Security Policy restricts script execution to extension-bundled code
- **No external calls**: Fully self-contained, no CDN or API dependencies
- **Chrome Storage isolation**: Each extension instance has its own storage

## Development

```bash
npm install          # Install dependencies
npm run dev          # Vite dev server with HMR
npm run build        # Production build → dist/
npm run lint         # ESLint (350 char line limit)
npx vitest           # Run 42 unit tests
```

To test as a Chrome extension: `npm run build` → load `dist/` as unpacked extension in `chrome://extensions`.

## Testing

42 unit tests across 5 files using Vitest + jsdom:

| File | Tests | Coverage |
|------|-------|----------|
| `storage.test.ts` | 10 | Add, remove, increment, presets, duplicates |
| `insults.test.ts` | 8 | Tier selection, randomness, boundary conditions |
| `url-utils.test.ts` | 10 | Domain normalization edge cases |
| `sounds.test.ts` | 6 | Playback, spam, whitelist validation |
| `themes.test.ts` | 8 | Theme loading, CSS variable application |

## Key Files Reference

| File | Purpose |
|------|---------|
| `manifest.json` | Chrome extension configuration (MV3) |
| `src/background.ts` | Service worker — intercepts blocked site navigation |
| `src/App.tsx` | Popup UI — manage blocked sites |
| `src/BlockedApp.tsx` | Blocked page — flashbang + roast experience |
| `src/lib/storage.ts` | Chrome storage wrapper with localStorage fallback |
| `src/lib/insults.ts` | 35+ tiered roast messages, page titles, emojis |
| `src/lib/sounds.ts` | Sound playback engine (sequential + spam) |
| `src/lib/themes.ts` | 6 theme definitions with CSS variable application |
| `src/lib/url-utils.ts` | Domain normalization from any URL format |
| `src/index.css` | All animations, effects, grain overlay, glows |
| `vite.config.ts` | Build config with CRX plugin for extension bundling |

## License

MIT
