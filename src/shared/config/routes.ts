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
  streams: "/streams",
  videos: "/videos",
  skins: "/skins",
  cases: "/cases",
  updates: "/updates",
  advertise: "/advertise",
  game: "/cs2",
} as const satisfies Record<string, Route>

export type SectionKey = Exclude<keyof typeof ROUTES, "advertise" | "game">

export type MatchPath = `/matches/${string}`
export type TeamPath = `/teams/${string}`
export type PlayerPath = `/players/${string}`
export type EventPath = `/events/${string}`
export type SkinPath = `/skins/${string}`
export type WeaponPath = `/skins/weapons/${string}`
export type CasePath = `/cases/${string}`
export type UpdatePath = `/updates/${string}`

export type NavItem = {
  readonly section: SectionKey
  readonly label: string
  readonly href: Route
}

export type NavGroup = {
  readonly title: string
  readonly items: readonly NavItem[]
}

export type HeaderGroupKey = "esports" | "game" | "media"

/**
 * Пункт шапки. `tier` решает, где он живёт: 1 — в строке меню с 1024px,
 * 2 — в строке с 1280px, а на промежуточной ширине — в меню «Ещё».
 * Так шапка остаётся в одну строку без горизонтальной прокрутки.
 */
export type HeaderNavItem = NavItem & {
  readonly group: HeaderGroupKey
  readonly tier: 1 | 2
}

export const HEADER_GROUP_LABEL: Record<HeaderGroupKey, string> = {
  esports: "Киберспорт",
  game: "Игра",
  media: "Медиа",
}

export const MAIN_NAV: readonly HeaderNavItem[] = [
  { section: "matches", label: "Матчи", href: ROUTES.matches, group: "esports", tier: 1 },
  { section: "results", label: "Результаты", href: ROUTES.results, group: "esports", tier: 1 },
  { section: "events", label: "Турниры", href: ROUTES.events, group: "esports", tier: 1 },
  { section: "rankings", label: "Рейтинг", href: ROUTES.rankings, group: "esports", tier: 1 },
  { section: "teams", label: "Команды", href: ROUTES.teams, group: "esports", tier: 1 },
  { section: "players", label: "Игроки", href: ROUTES.players, group: "esports", tier: 1 },
  { section: "skins", label: "Скины", href: ROUTES.skins, group: "game", tier: 1 },
  { section: "cases", label: "Кейсы", href: ROUTES.cases, group: "game", tier: 1 },
  { section: "updates", label: "Обновления", href: ROUTES.updates, group: "game", tier: 2 },
  { section: "news", label: "Новости", href: ROUTES.news, group: "media", tier: 2 },
  { section: "videos", label: "Видео", href: ROUTES.videos, group: "media", tier: 2 },
  { section: "streams", label: "Эфиры", href: ROUTES.streams, group: "media", tier: 2 },
]

export const FOOTER_NAV: readonly NavGroup[] = [
  {
    title: "Соревнования",
    items: [
      { section: "matches", label: "Матчи", href: ROUTES.matches },
      { section: "results", label: "Результаты", href: ROUTES.results },
      { section: "events", label: "Турниры", href: ROUTES.events },
      { section: "streams", label: "Эфиры", href: ROUTES.streams },
    ],
  },
  {
    title: "Сцена",
    items: [
      { section: "rankings", label: "Рейтинг", href: ROUTES.rankings },
      { section: "teams", label: "Команды", href: ROUTES.teams },
      { section: "players", label: "Игроки", href: ROUTES.players },
      { section: "news", label: "Новости", href: ROUTES.news },
      { section: "videos", label: "Видео и хайлайты", href: ROUTES.videos },
    ],
  },
  {
    title: "Игра",
    items: [
      { section: "skins", label: "Скины и цены", href: ROUTES.skins },
      { section: "cases", label: "Кейсы и шансы", href: ROUTES.cases },
      { section: "updates", label: "Обновления CS2", href: ROUTES.updates },
      { section: "updates", label: "Системные требования", href: ROUTES.game },
    ],
  },
]
