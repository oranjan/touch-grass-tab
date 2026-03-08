export function normalizeDomain(input: string): string {
  let domain = input.toLowerCase().trim()
  domain = domain.replace(/^(https?:\/\/)?(www\.)?/, '')
  domain = domain.replace(/\/.*$/, '')
  domain = domain.replace(/^\.+|\.+$/g, '')
  return domain
}
