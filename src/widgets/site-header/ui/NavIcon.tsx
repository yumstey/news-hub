import {
  Box,
  CalendarDays,
  Crosshair,
  LayoutDashboard,
  ListOrdered,
  Megaphone,
  Newspaper,
  Radio,
  RefreshCw,
  SquarePlay,
  Swords,
  Trophy,
  UserRound,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import type { SectionKey } from "@/shared/config"

const ICONS: Record<SectionKey | "advertise", LucideIcon> = {
  home: LayoutDashboard,
  news: Newspaper,
  matches: Swords,
  results: ListOrdered,
  rankings: Trophy,
  teams: Users,
  players: UserRound,
  events: CalendarDays,
  streams: Radio,
  videos: SquarePlay,
  skins: Crosshair,
  cases: Box,
  updates: RefreshCw,
  advertise: Megaphone,
}

export function NavIcon({ section, className }: { section: SectionKey | "advertise"; className?: string }) {
  const Icon = ICONS[section]

  return <Icon aria-hidden="true" className={className ?? "size-4"} />
}
