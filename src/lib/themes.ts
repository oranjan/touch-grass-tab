/** Apply dark/light mode based on browser preference and keep it in sync. */

function applySystemTheme() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  document.documentElement.classList.toggle("dark", prefersDark)
}

/** Returns true if dark mode is active */
export function isDarkMode() {
  return document.documentElement.classList.contains("dark")
}

/**
 * Initialise theme from system preference and listen for changes.
 * Call once at startup (e.g. in main.tsx).
 */
export function initTheme() {
  applySystemTheme()
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", applySystemTheme)
}
