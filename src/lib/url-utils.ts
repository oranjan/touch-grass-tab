const BLOCKED_PREFIXES = ['chrome-extension', 'chrome', 'edge', 'about', 'localhost'] as const

export function normalizeDomain(input: string): string {
  let domain = input.toLowerCase().trim()
  domain = domain.replace(/^(https?:\/\/)?(www\.)?/, '')
  domain = domain.replace(/\/.*$/, '')
  domain = domain.replace(/^\.+|\.+$/g, '')
  return domain
}

/** Returns an error message if the domain is invalid, or null if valid. */
export function validateDomain(domain: string): string | null {
  if (!domain || !domain.includes('.')) {
    return 'Enter a valid domain like instagram.com'
  }
  if (BLOCKED_PREFIXES.some((b) => domain.startsWith(b))) {
    return "nice try bestie, can't block that"
  }
  return null
}
