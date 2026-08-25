import { PUBLIC_ENV } from "./env"

export const SITE = {
  name: "Counter-Strike 2",
  shortName: "CS2",
  description:
    "Матчи, результаты, мировой рейтинг команд, составы и статистика игроков Counter-Strike 2.",
  locale: "ru",
} as const

export const CS2 = {
  title: "Counter-Strike 2",
  shortTitle: "CS2",
  tagline: "Официальная площадка о киберспортивной сцене Counter-Strike 2",
  logo: {
    url: "/cs2_logo.jpg",
    width: 360,
    height: 360,
    alt: "Логотип Counter-Strike 2",
  },
} as const

export const SITE_URL = PUBLIC_ENV.NEXT_PUBLIC_SITE_URL

export const DEFAULT_OG_IMAGE = {
  url: "/cs2_logo.jpg",
  width: 360,
  height: 360,
  alt: SITE.name,
} as const

export type SiteConfig = typeof SITE
