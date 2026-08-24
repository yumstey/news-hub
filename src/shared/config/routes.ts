import type { Route } from "next"

export const ROUTES = {
  home: "/",
  news: "/news",
  sport: "/sport",
  esports: "/esports",
} as const satisfies Record<string, Route>

export type CategoryPath = `/news/${string}`
export type ArticlePath = `/news/${string}/${string}`
export type FeedBasePath = "/news" | CategoryPath
export type FeedHref = FeedBasePath | `${FeedBasePath}?${string}`

export type DisciplinePath = `/esports/${string}`
export type EsportsNewsPath = `/esports/${string}/news`
export type MatchPath = `/esports/${string}/matches/${string}`
export type TeamPath = `/esports/${string}/teams/${string}`
export type PlayerPath = `/esports/${string}/players/${string}`
export type EventPath = `/esports/${string}/events/${string}`
export type EsportsArticlePath = `/esports/${string}/news/${string}`

export type DisciplineSectionPath =
  | DisciplinePath
  | EsportsNewsPath
  | `/esports/${string}/matches`
  | `/esports/${string}/results`
  | `/esports/${string}/rankings`
  | `/esports/${string}/teams`
  | `/esports/${string}/players`
  | `/esports/${string}/events`

export type NavItem = {
  readonly label: string
  readonly href: Route
  readonly description?: string
}

export type NavGroup = {
  readonly title: string
  readonly items: readonly NavItem[]
}

export const MAIN_NAV: readonly NavItem[] = [
  { label: "Главная", href: ROUTES.home },
  { label: "Новости", href: ROUTES.news },
  { label: "Спорт", href: ROUTES.sport },
  { label: "Киберспорт", href: ROUTES.esports },
]

export const FOOTER_NAV: readonly NavGroup[] = [
  {
    title: "Разделы",
    items: [
      { label: "Новости", href: ROUTES.news },
      { label: "Спорт", href: ROUTES.sport },
      { label: "Киберспорт", href: ROUTES.esports },
    ],
  },
]
