export const INSULTS: string[] = [
  // Tier 1: Mild Corruption (1-7)
  "bro really said 'one more scroll' and meant it ironically 💀",
  "ur the reason they put warning labels on websites",
  "this is giving main character delusion but ur literally the loading screen NPC",
  "the digital ghost haunting this blocked page... is u. has always been u.",
  "tell me ur a chronic understimulation girlie without telling me 🫵",
  "you and this website are in ur 'complicated' era huh",
  "POV: u thought u had discipline. u did not have discipline.",

  // Tier 2: Medium Crispy (8-14)
  "your ancestors survived the black plague so you could do THIS?? 🗿",
  "ratio. L. no aura. cope. seethe. go outside.",
  "the sigma grindset did NOT include this website bestie",
  "you're so cooked rn. like extra crispy. like the bottom of the air fryer.",
  "skibidi toilet has more plot than your productivity rn",
  "the amount of emotional damage this causes me as a website blocker 😤",
  "bro fell off harder than the Roman Empire and that's saying something",

  // Tier 3: It's Giving Unwell (15-21)
  "GIRL. THE DELULU IS NOT THE SOLULU HERE.",
  "your villain arc is so unimpressive it's actually inspiring",
  "even NPC characters in GTA have more goals than you rn",
  "you've unlocked: Sigma Fail. Gigachad Fumble. NPC Moment of the Century.",
  "the way you just speedran disappointing yourself again no-clip glitchless 💀",
  "current aura points: -47,000. current rizz: audited. current future: grim.",
  "bro is NOT built different. bro is built exactly the same. maybe worse.",

  // Tier 4: Nuclear Brain Rot (22-27)
  "the lore of you returning to this page is genuinely unmatched in fiction",
  "certified Ohio moment. Caught in 4K. Logged. Timestamped. Leaked to the timeline.",
  "this page is your Roman Empire and you're the guy who set it on fire",
  "ur government assigned internet addiction arc is NOT the character development we needed",
  "MEWING cannot fix this. LOOKSMAXXING cannot fix this. ONLY CLOSING THE TAB CAN.",
  "the FBI agent watching your screen just submitted their two weeks notice",
  "real talk: the slay has LEFT the building. it got an Uber. it blocked ur number.",

  // Tier 5: Final Boss Humiliation (28-35)
  "this website should charge u rent, emotional support fees, AND a late checkout penalty",
  "bro is literally speedrunning the 'no life% any glitch' category and losing",
  "your rizz is in shambles. your aura is a war crime. your screen time is a documentary.",
  "NEGATIVE AURA. NEGATIVE RIZZ. NEGATIVE SOCIAL CREDIT. ur cooked different fr.",
  "we are so past 'touch grass'. we're at 'become the grass'. merge with nature. leave.",
  "the fact that you're reading this AGAIN means ur beyond saving bestie 💀🪦",
  "congratulations ur the plot twist nobody wanted and everyone saw coming",
  "this ain't even a vibe check anymore this is a vibe autopsy 🔬☠️",
]

export const PAGE_TITLES: string[] = [
  "CAUGHT IN 4K (AGAIN)",
  "L + RATIO + NO AURA",
  "RIZZ: NOT FOUND",
  "TOUCH GRASS IMMEDIATELY 🌿",
  "DOWN BAD CRITICAL ERROR",
  "SKILL ISSUE DETECTED FR FR",
  "CERTIFIED OHIO MOMENT",
  "GIGACHAD FUMBLE OF THE YEAR",
  "CHRONICALLY ONLINE DETECTED",
  "NPC BEHAVIOR UNLOCKED",
  "SIGMA GRINDSET FAILED",
  "DELULU LEVEL: MAXIMUM",
  "THE LORE CONTINUES...",
  "MEWING WON'T SAVE U NOW",
]

export const ROAST_EMOJIS: string[] = [
  "💀", "🤡", "😭", "🗿", "☠️", "🤣", "😤", "🪦", "📸", "🚨",
  "🫵", "💅", "🔥", "🧂", "🎪", "🪤", "🧠💨", "📉", "🏳️‍🌈", "⚰️",
]

export const COMEBACK_LINES: string[] = [
  "close the tab. close it. RIGHT NOW.",
  "go touch some grass. we beg.",
  "literally just close this. please. for us.",
  "ur phone's battery dying is a sign from the universe.",
  "your ancestors are watching. they are not proud.",
  "the tab won't close itself bestie 🙏",
]

export function getInsult(visitCount: number): string {
  const index = Math.min(visitCount - 1, INSULTS.length - 1)
  return INSULTS[Math.max(0, index)]
}

export function getRandomPageTitle(): string {
  return PAGE_TITLES[Math.floor(Math.random() * PAGE_TITLES.length)]
}

export function getRandomEmoji(): string {
  return ROAST_EMOJIS[Math.floor(Math.random() * ROAST_EMOJIS.length)]
}
