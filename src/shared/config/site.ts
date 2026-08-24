import { PUBLIC_ENV } from "./env"

export const SITE = {
  name: "Info",
  shortName: "Info",
  description:
    "Новости, спорт и киберспорт в одном месте — редакционные материалы, расписание матчей, live-счёт и профили команд.",
  locale: "ru",
  modules: ["news", "sport", "esports"],
} as const

export const SITE_URL = PUBLIC_ENV.NEXT_PUBLIC_SITE_URL

export const DEFAULT_OG_IMAGE = {
  url: "/mock/covers/cover-01.png",
  width: 1200,
  height: 675,
  alt: SITE.name,
} as const

export type SiteConfig = typeof SITE
