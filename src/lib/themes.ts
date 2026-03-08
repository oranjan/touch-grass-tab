export interface Theme {
  id: string
  name: string
  vibe: string
  tag: "Dark" | "Light"
  desc: string
  vars: {
    "--background": string
    "--foreground": string
    "--card": string
    "--card-foreground": string
    "--popover": string
    "--popover-foreground": string
    "--primary": string
    "--primary-foreground": string
    "--secondary": string
    "--secondary-foreground": string
    "--muted": string
    "--muted-foreground": string
    "--accent": string
    "--accent-foreground": string
    "--destructive": string
    "--border": string
    "--input": string
    "--ring": string
  }
}

const themes: Theme[] = [
  {
    id: "skibidi",
    name: "Skibidi Sigma",
    vibe: "Neon grindset. You locked in fr fr.",
    tag: "Dark",
    desc: "Electric green on void black. Terminal-coded with rave energy. For when you're in your sigma arc and actually getting stuff done at 3am.",
    vars: {
      "--background": "#050505",
      "--foreground": "#f0fff0",
      "--card": "#0a0f0a",
      "--card-foreground": "#f0fff0",
      "--popover": "#0a0f0a",
      "--popover-foreground": "#e8ffe8",
      "--primary": "#39ff14",
      "--primary-foreground": "#020502",
      "--secondary": "#0d1a0d",
      "--secondary-foreground": "#b8ffb8",
      "--muted": "#0d1a0d",
      "--muted-foreground": "#4a8a4a",
      "--accent": "#ff2d6f",
      "--accent-foreground": "#fff0f5",
      "--destructive": "#ff3131",
      "--border": "#1a3a1a",
      "--input": "#0f1f0f",
      "--ring": "#39ff1466",
    },
  },
  {
    id: "fanum",
    name: "Fanum Tax",
    vibe: "Unhinged purple chaos. Main character energy.",
    tag: "Dark",
    desc: "Deep void purple with hot magenta accents. Feels like scrolling at 2am but productive. Chaotic but you're actually locking in.",
    vars: {
      "--background": "#0c0812",
      "--foreground": "#f0e8ff",
      "--card": "#130e1e",
      "--card-foreground": "#f0e8ff",
      "--popover": "#130e1e",
      "--popover-foreground": "#f0e8ff",
      "--primary": "#c850ff",
      "--primary-foreground": "#0c0812",
      "--secondary": "#1a1228",
      "--secondary-foreground": "#d4b8ff",
      "--muted": "#1a1228",
      "--muted-foreground": "#7a5fa0",
      "--accent": "#ff4da6",
      "--accent-foreground": "#fff0f8",
      "--destructive": "#ff4040",
      "--border": "#2a1e42",
      "--input": "#1a1228",
      "--ring": "#c850ff55",
    },
  },
  {
    id: "rizz",
    name: "Rizz Mode",
    vibe: "Warm sunset energy. Touch grass coded.",
    tag: "Light",
    desc: "Creamy warm whites with sunset coral. Anti-doomscroll aesthetic. Feels like golden hour on your screen. You're healing fr.",
    vars: {
      "--background": "#fef9f3",
      "--foreground": "#1a1210",
      "--card": "#fff7ee",
      "--card-foreground": "#1a1210",
      "--popover": "#fff7ee",
      "--popover-foreground": "#1a1210",
      "--primary": "#ff6b3d",
      "--primary-foreground": "#fff5f0",
      "--secondary": "#f5ede4",
      "--secondary-foreground": "#4a3830",
      "--muted": "#f0e6da",
      "--muted-foreground": "#9a8478",
      "--accent": "#e84393",
      "--accent-foreground": "#fff0f8",
      "--destructive": "#d63031",
      "--border": "#e8d8c8",
      "--input": "#f0e6da",
      "--ring": "#ff6b3d44",
    },
  },
  {
    id: "npc",
    name: "NPC Mode",
    vibe: "Calm blue. Zen state unlocked.",
    tag: "Dark",
    desc: "Muted navy with cool cyan. Like a chill lo-fi stream background. You're in NPC mode — just vibing, no thoughts, pure focus.",
    vars: {
      "--background": "#080c14",
      "--foreground": "#dce8f8",
      "--card": "#0e1420",
      "--card-foreground": "#dce8f8",
      "--popover": "#0e1420",
      "--popover-foreground": "#dce8f8",
      "--primary": "#00d4ff",
      "--primary-foreground": "#020e14",
      "--secondary": "#121c2e",
      "--secondary-foreground": "#a0c4e8",
      "--muted": "#121c2e",
      "--muted-foreground": "#5580a8",
      "--accent": "#7c5cff",
      "--accent-foreground": "#f0ecff",
      "--destructive": "#ff4757",
      "--border": "#1a2a44",
      "--input": "#121c2e",
      "--ring": "#00d4ff44",
    },
  },
  {
    id: "ohio",
    name: "Ohio Final Boss",
    vibe: "Nuclear yellow. Only in Ohio.",
    tag: "Light",
    desc: "Acid yellow-green with hard black. Maximalist, unhinged, Y2K brainrot. For people who think light mode is a personality trait.",
    vars: {
      "--background": "#e8ff00",
      "--foreground": "#0a0a00",
      "--card": "#f0ff4d",
      "--card-foreground": "#0a0a00",
      "--popover": "#f0ff4d",
      "--popover-foreground": "#0a0a00",
      "--primary": "#0a0a00",
      "--primary-foreground": "#e8ff00",
      "--secondary": "#d4eb00",
      "--secondary-foreground": "#1a1a00",
      "--muted": "#c8de00",
      "--muted-foreground": "#4a4a00",
      "--accent": "#ff00aa",
      "--accent-foreground": "#fff0fa",
      "--destructive": "#ff2200",
      "--border": "#0a0a0025",
      "--input": "#d4eb0088",
      "--ring": "#0a0a0033",
    },
  },
  {
    id: "aura",
    name: "Aura Points",
    vibe: "Forest dark. +1000 aura.",
    tag: "Dark",
    desc: "Deep forest green with warm gold. Earthy, grounded, anti-hustle. You're not grinding, you're cultivating. Touch grass literally.",
    vars: {
      "--background": "#080d08",
      "--foreground": "#e0ead0",
      "--card": "#0e150e",
      "--card-foreground": "#e0ead0",
      "--popover": "#0e150e",
      "--popover-foreground": "#e0ead0",
      "--primary": "#a8e063",
      "--primary-foreground": "#0a1205",
      "--secondary": "#142014",
      "--secondary-foreground": "#b8d8a0",
      "--muted": "#142014",
      "--muted-foreground": "#5a8050",
      "--accent": "#ffc857",
      "--accent-foreground": "#1a1400",
      "--destructive": "#e05040",
      "--border": "#1e3018",
      "--input": "#142014",
      "--ring": "#a8e06344",
    },
  },
]

export function getThemes() {
  return themes
}

export function getThemeById(id: string) {
  return themes.find((t) => t.id === id) ?? themes[0]
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value)
  }
  localStorage.setItem("tgt-theme", theme.id)
}

export function loadSavedTheme() {
  const savedId = localStorage.getItem("tgt-theme")
  const theme = savedId ? getThemeById(savedId) : themes[0]
  applyTheme(theme)
  return theme
}
