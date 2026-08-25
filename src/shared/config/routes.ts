import type { Route } from "next"

export const ROUTES = {
  home: "/",
  news: "/news",
  matches: "/matches",
  results: "/results",
  rankings: "/rankings",
  teams: "/teams",
  players: "/players",
  events: "/events",
} as const satisfies Record<string, Route>

export type SectionKey = keyof typeof ROUTES

export type MatchPath = `/matches/${string}`
export type TeamPath = `/teams/${string}`
export type PlayerPath = `/players/${string}`
export type EventPath = `/events/${string}`

export type NavItem = {
  readonly section: SectionKey
  readonly label: string
  readonly href: Route
}

export type NavGroup = {
  readonly title: string
  readonly items: readonly NavItem[]
}

export const MAIN_NAV: readonly NavItem[] = [
  { section: "home", label: "Обзор", href: ROUTES.home },
  { section: "news", label: "Новости", href: ROUTES.news },
  { section: "matches", label: "Матчи", href: ROUTES.matches },
  { section: "results", label: "Результаты", href: ROUTES.results },
  { section: "rankings", label: "Рейтинг", href: ROUTES.rankings },
  { section: "teams", label: "Команды", href: ROUTES.teams },
  { section: "players", label: "Игроки", href: ROUTES.players },
  { section: "events", label: "Ивенты", href: ROUTES.events },
]

export const FOOTER_NAV: readonly NavGroup[] = [
  {
    title: "Соревнования",
    items: [
      { section: "matches", label: "Матчи", href: ROUTES.matches },
      { section: "results", label: "Результаты", href: ROUTES.results },
      { section: "events", label: "Ивенты", href: ROUTES.events },
    ],
  },
  {
    title: "Сцена",
    items: [
      { section: "rankings", label: "Рейтинг", href: ROUTES.rankings },
      { section: "teams", label: "Команды", href: ROUTES.teams },
      { section: "players", label: "Игроки", href: ROUTES.players },
    ],
  },
]
