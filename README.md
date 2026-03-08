# TouchGrassTab

**Block sites. Get roasted. Touch grass.**

A Chrome extension that blocks distracting websites and roasts you with escalating Gen Z humor when you try to visit them. The more you try, the harder it hits.

---

## Features

- **Site Blocking** — Add any website to your block list. Attempts to visit blocked sites are intercepted and redirected to a roast page.
- **Escalating Roast System** — 35+ insults across 5 tiers that get progressively harsher based on how many times you've tried visiting a blocked site.
- **Flashbang Mode** — Blocked page opens with a disorienting strobe sequence, spinning text, and sound spam before delivering the roast.
- **Intervention Mode** — After 10+ visits to the same site, the extension activates screen shake, increased skull rain, and warning badges.
- **Sound Effects** — 10 sound effects (bruh, vine boom, sad trombone, fart, etc.) that fire during the flashbang sequence.
- **6 Themes** — Skibidi Sigma, Fanum Tax, Rizz Mode, NPC Mode, Ohio Final Boss, Aura Points — each with custom color palettes and CSS variables.
- **Social Media Presets** — One-click button to block 25 common social media sites.
- **Visit Tracking** — Tracks how many times you've tried visiting each blocked site with per-site and total counters.
- **Touch Grass Button** — Opens a Google search for "parks near me" so you can actually go outside.
- **Reduced Motion Support** — Respects `prefers-reduced-motion` for accessibility.

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

---

## Project Structure

```
TouchGrassTab/
├── public/
│   ├── sounds/                      # 10 sound effects (.mp3)
│   │   ├── bruh.mp3
│   │   ├── clown-horn.mp3
│   │   ├── crickets.mp3
│   │   ├── emergency-meeting.mp3
│   │   ├── fart.mp3
│   │   ├── record-scratch.mp3
│   │   ├── rizz.mp3
│   │   ├── sad-trombone.mp3
│   │   ├── vine-boom.mp3
│   │   └── wow.mp3
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
│   │       ├── button.tsx
│   │       ├── badge.tsx
│   │       ├── input.tsx
│   │       └── card.tsx
│   │
│   └── lib/                         # Utility modules
│       ├── storage.ts               # Chrome storage API wrapper + localStorage fallback
│       ├── insults.ts               # Roast messages (5 tiers), page titles, emojis, comebacks
│       ├── sounds.ts                # Sound playback (sequential + spam modes)
│       ├── themes.ts                # 6 theme definitions + CSS variable application
│       ├── url-utils.ts             # Domain normalization (URL → clean domain)
│       ├── utils.ts                 # cn() helper (clsx + tailwind-merge)
│       └── __tests__/               # Unit tests
│           ├── storage.test.ts      # 10 tests
│           ├── insults.test.ts      # 8 tests
│           ├── url-utils.test.ts    # 10 tests
│           ├── sounds.test.ts       # 6 tests
│           └── themes.test.ts       # 8 tests
│
├── index.html                       # Popup HTML shell
├── blocked.html                     # Blocked page HTML shell
├── manifest.json                    # Chrome Extension Manifest V3
├── vite.config.ts                   # Vite + CRX plugin config
├── tsconfig.json                    # Base TypeScript config
├── tsconfig.app.json                # App TypeScript config (ES2022)
├── components.json                  # Shadcn UI configuration
├── eslint.config.js                 # ESLint rules (350 line max per file)
└── package.json                     # Dependencies and scripts
```

---

## Architecture

### Extension Entry Points

The extension has three independent entry points:

1. **Popup** (`index.html` → `main.tsx` → `App.tsx`) — The toolbar popup UI where users manage their blocked sites list. Renders at 360×480px in popup mode or full-page when opened in a tab.

2. **Blocked Page** (`blocked.html` → `blocked-main.tsx` → `BlockedApp.tsx`) — The full-page roast experience shown when a user tries to visit a blocked site. Receives the blocked domain via `?site=` query parameter.

3. **Service Worker** (`background.ts`) — Runs in the background with no UI. Listens to `chrome.tabs.onUpdated` and `chrome.webNavigation.onBeforeNavigate` events. When a navigation matches a blocked domain, it redirects the tab to `blocked.html`.

### Data Flow

```
User navigates to blocked site
    ↓
Service Worker (background.ts) detects navigation
    ↓
Checks domain against blocked list in Chrome Storage
    ↓
Redirects tab to blocked.html?site={domain}
    ↓
BlockedApp.tsx renders flashbang → roast modal → skull rain
    ↓
incrementVisitCount() updates Chrome Storage
    ↓
Popup reflects updated visit counts on next open
```

### Storage

Data is persisted via `chrome.storage.local` with a localStorage fallback for development/testing outside the extension context.

**Schema:**
```typescript
interface BlockedSite {
  domain: string      // normalized domain (e.g. "instagram.com")
  addedAt: number     // timestamp
  visitCount: number  // times user tried to visit
}

interface StorageData {
  blockedSites: BlockedSite[]
  totalBlocks: number
}
```

**API** (`src/lib/storage.ts`):
- `getStorage()` — Read current storage state
- `addSite(domain)` — Add a site to the block list
- `removeSite(domain)` — Remove a site from the block list
- `incrementVisitCount(domain)` — Bump visit counter for a domain
- `addPresetSites()` — Add 25 social media sites at once
- `onStorageChange(callback)` — Subscribe to storage updates

### Domain Matching

`src/lib/url-utils.ts` normalizes user input into clean domains:
- `https://www.instagram.com/reels/` → `instagram.com`
- `WWW.TWITTER.COM` → `twitter.com`
- `reddit.com/r/programming` → `reddit.com`

The service worker matches against both exact domain and subdomain patterns (`hostname === domain || hostname.endsWith('.' + domain)`).

### Roast System

`src/lib/insults.ts` contains 35+ messages across 5 escalation tiers:

| Tier | Visit Count | Tone | Example |
|------|-------------|------|---------|
| 1 | 1–7 | Mild | "bro really said 'one more scroll' for the 47th time today" |
| 2 | 8–14 | Medium | "your ancestors survived the black plague for you to be on THIS app?" |
| 3 | 15–21 | Harsh | "GIRL. THE DELULU IS NOT THE SOLULU." |
| 4 | 22–27 | Nuclear | "the FBI agent watching your screen submitted their two weeks notice" |
| 5 | 28+ | Final Boss | "this website should charge u rent at this point fr fr" |

### Blocked Page Sequence

When the user lands on the blocked page, a 3-stage sequence plays:

1. **White flash** — Instant full-screen white overlay
2. **Flashbang** (2–5s) — Strobing colors, spinning/skewing text, hue rotation, rapid sound spam (10 sounds every 400ms)
3. **Roast modal** — Displays the insult, visit count badge, comeback line, and a "Touch Grass" button (links to Google Maps parks search)

At 10+ visits, **Intervention Mode** activates: screen shake, 40 falling skull emojis (vs 20), and a special warning badge.

### Themes

6 themes defined in `src/lib/themes.ts`, each setting CSS custom properties:

| Theme | Mode | Palette |
|-------|------|---------|
| Skibidi Sigma | Dark | Neon green on void black |
| Fanum Tax | Dark | Purple + magenta accents |
| Rizz Mode | Light | Warm sunset coral on cream |
| NPC Mode | Dark | Navy + cyan accents |
| Ohio Final Boss | Light | Acid yellow, Y2K aesthetic |
| Aura Points | Dark | Forest green + warm gold |

Theme selection persists via localStorage. CSS variables are applied dynamically to the document root.

### Animations

All animations are defined in `src/index.css`:

- `animate-flashbang` — 0.15s nuclear strobe + shake
- `animate-flashbang-text` — Scale + rotation + skew chaos
- `animate-flashbang-spin` — Continuous 360 rotation
- `animate-flashbang-hue` — Hue rotation + saturation boost
- `animate-fall` — Falling emoji with rotation (skull rain)
- `animate-modal-enter` — Spring entrance for roast card
- `animate-shake` — Gentle vibration (intervention mode)
- `glitch-text` — Green/pink offset glitch effect

Visual effects include a grain overlay (SVG noise texture), vignette overlays, and glow shadows.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

This starts the Vite dev server with hot reload. To test as an extension:

1. Run `npm run build`
2. Open `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `dist/` folder

### Build

```bash
npm run build
```

Outputs a production build to `dist/` ready to be loaded as an unpacked Chrome extension.

### Test

```bash
npx vitest
```

Runs the test suite (42 tests across 5 files covering storage, insults, URL utils, sounds, and themes).

### Lint

```bash
npm run lint
```

---

## Extension Permissions

| Permission | Why |
|-----------|-----|
| `storage` | Persist blocked sites list and visit counts |
| `webNavigation` | Detect when the user navigates to a blocked site |
| `tabs` | Redirect blocked tabs to the roast page |
| `<all_urls>` (host) | Required to intercept navigation to any website |

---

## Key Files Quick Reference

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

---

## License

MIT
