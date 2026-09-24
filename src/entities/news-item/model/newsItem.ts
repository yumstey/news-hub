import { z } from "zod"

import type { ImageAsset } from "@/shared/model"

export const newsItemIdSchema = z.string().min(1).brand<"NewsItemId">()
export type NewsItemId = z.infer<typeof newsItemIdSchema>

export type NewsSource = {
  name: string
  url: string
}

export type NewsLanguage = "ru" | "en"

export const NEWS_LANGUAGE_LABEL: Record<NewsLanguage, string> = {
  ru: "На русском",
  en: "English",
}

export type NewsImage = ImageAsset & {
  /**
   * false — картинка грузится браузером прямо с CDN источника: защита HLTV
   * отдаёт 403 на серверные запросы оптимизатора, а браузеру — отдаёт.
   */
  optimize: boolean
}

export type NewsItem = {
  id: NewsItemId
  title: string
  excerpt: string
  url: string
  source: NewsSource
  language: NewsLanguage
  image: NewsImage | null
  publishedAt: Date
}

export const NEWS_PER_PAGE = 10
