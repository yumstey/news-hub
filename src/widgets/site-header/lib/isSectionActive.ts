export function isSectionActive(href: string, pathname: string | null): boolean {
  if (pathname === null) return false
  if (href === "/") return pathname === "/"

  return pathname === href || pathname.startsWith(`${href}/`)
}
