import { z } from "zod"

import type { AuthorRef } from "@/entities/author/@x/article"
import type { CategoryRef } from "@/entities/category/@x/article"
import type { DisciplineRef } from "@/entities/discipline/@x/article"
import type { ContentModule, ImageAsset, SeoFields, Slug, Timestamps } from "@/shared/model"

import type { ContentBlock } from "./contentBlock"

export const articleIdSchema = z.string().min(1).brand<"ArticleId">()
export type ArticleId = z.infer<typeof articleIdSchema>

export type Article = {
  id: ArticleId
  slug: Slug
  module: ContentModule
  discipline: DisciplineRef | null
  title: string
  excerpt: string
  cover: ImageAsset
  author: AuthorRef
  primaryCategory: CategoryRef
  categories: CategoryRef[]
  tags: string[]
  views: number
  isFeatured: boolean
  readingMinutes: number
  timestamps: Timestamps
  body: ContentBlock[]
  seo: SeoFields
}

export type ArticlePreview = Omit<Article, "body" | "seo">

export const articleSortSchema = z.enum(["latest", "popular"])
export type ArticleSort = z.infer<typeof articleSortSchema>

export type ArticleFeedQuery = {
  module: ContentModule
  page?: number
  perPage?: number
  category?: string
  tag?: string
  sort?: ArticleSort
}

export type TrendingTag = {
  tag: string
  count: number
}

export const ARTICLE_PER_PAGE = 9
