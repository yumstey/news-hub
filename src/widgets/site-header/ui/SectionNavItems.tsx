import {
  CalendarDays,
  LayoutDashboard,
  ListOrdered,
  Newspaper,
  Swords,
  Trophy,
  UserRound,
  Users,
} from "lucide-react"
import Link from "next/link"

import { MAIN_NAV } from "@/shared/config"
import type { SectionKey } from "@/shared/config"
import { cn } from "@/shared/lib/style"

const sectionIcon: Record<SectionKey, React.ReactNode> = {
  home: <LayoutDashboard className="size-4" />,
  news: <Newspaper className="size-4" />,
  matches: <Swords className="size-4" />,
  results: <ListOrdered className="size-4" />,
  rankings: <Trophy className="size-4" />,
  teams: <Users className="size-4" />,
  players: <UserRound className="size-4" />,
  events: <CalendarDays className="size-4" />,
}

export function isSectionActive(href: string, pathname: string | null): boolean {
  if (pathname === null) return false
  if (href === "/") return pathname === "/"

  return pathname === href || pathname.startsWith(`${href}/`)
}

export type SectionNavItemsProps = {
  pathname?: string | null
  onSelect?: () => void
}

export function SectionNavItems({ pathname = null, onSelect }: SectionNavItemsProps) {
  return (
    <>
      {MAIN_NAV.map((item) => {
        const active = isSectionActive(item.href, pathname)

        return (
          <li key={item.section}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={onSelect}
              className={cn(
                "inline-flex h-11 items-center gap-2 whitespace-nowrap border-b-2 px-3 text-sm font-medium transition-colors duration-150",
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:border-border-strong hover:text-foreground",
              )}
            >
              <span aria-hidden="true" className={active ? "text-primary" : undefined}>
                {sectionIcon[item.section]}
              </span>
              {item.label}
            </Link>
          </li>
        )
      })}
    </>
  )
}
