import { PUBLIC_ENV } from "./env"

export const SITE = {
  name: "Counter-Strike 2",
  shortName: "CS2",
  description:
    "Матчи и результаты CS2 онлайн, турнирные сетки, рейтинг команд, статистика игроков, цены скинов, шансы кейсов и обновления Counter-Strike 2.",
  locale: "ru",
} as const

export const CS2 = {
  title: "Counter-Strike 2",
  shortTitle: "CS2",
  // Не «официальная»: сайт не связан с Valve, а такое слово — риск претензии по товарному знаку.
  tagline: "Матчи, статистика, скины и обновления Counter-Strike 2 в одном месте",
  logo: {
    url: "/cs2_logo.jpg",
    width: 360,
    height: 360,
    alt: "Логотип Counter-Strike 2",
  },
} as const

export const SITE_URL = PUBLIC_ENV.NEXT_PUBLIC_SITE_URL

/** Сгенерированная обложка 1200×630 из app/opengraph-image.tsx. */
export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: SITE.name,
} as const

export type SiteConfig = typeof SITE
