import { z } from "zod"

import type { ImageAsset } from "@/shared/model"

export const newsItemIdSchema = z.string().min(1).brand<"NewsItemId">()
export type NewsItemId = z.infer<typeof newsItemIdSchema>

export type NewsSource = {
  name: string
  url: string
}

export type NewsItem = {
  id: NewsItemId
  title: string
  excerpt: string
  url: string
  source: NewsSource
  image: ImageAsset | null
  publishedAt: Date
}

export const NEWS_PER_PAGE = 10
