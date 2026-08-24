import { Suspense } from "react"

import type { NavItem } from "@/shared/config"
import { cn } from "@/shared/lib/style"

import { ActiveNavItems } from "./ActiveNavItems"
import { NavItems } from "./NavItems"

export type SiteNavProps = {
  items: readonly NavItem[]
  label: string
  className?: string
}

export function SiteNav({ items, label, className }: SiteNavProps) {
  return (
    <nav aria-label={label} className={cn("items-center gap-1", className)}>
      <Suspense fallback={<NavItems items={items} />}>
        <ActiveNavItems items={items} />
      </Suspense>
    </nav>
  )
}
