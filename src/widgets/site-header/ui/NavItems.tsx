import Link from "next/link"

import type { NavItem } from "@/shared/config"
import { cn } from "@/shared/lib/style"

export function isNavItemActive(href: string, pathname: string | null): boolean {
  if (pathname === null) return false
  if (href === "/") return pathname === "/"

  return pathname === href || pathname.startsWith(`${href}/`)
}

export type NavItemsProps = {
  items: readonly NavItem[]
  pathname?: string | null
  variant?: "desktop" | "mobile"
  onSelect?: () => void
}

export function NavItems({
  items,
  pathname = null,
  variant = "desktop",
  onSelect,
}: NavItemsProps) {
  return (
    <>
      {items.map((item) => {
        const active = isNavItemActive(item.href, pathname)

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={onSelect}
            className={cn(
              "rounded-control font-medium transition-colors duration-150",
              variant === "desktop" ? "px-3 py-2 text-sm" : "px-3 py-3 text-base",
              active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </>
  )
}
