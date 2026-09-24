import { cacheLife, cacheTag } from "next/cache"

import { fetchText, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { CS2_MODULE, feedTag } from "@/shared/config"
import { paginate } from "@/shared/model"
import type { Paginated } from "@/shared/model"

import { NEWS_PER_PAGE } from "../model/newsItem"
import type { NewsItem, NewsLanguage } from "../model/newsItem"
import { FEEDS, isCs2Related } from "./newsSources"
import type { FeedDefinition } from "./newsSources"
import { parseRssFeed } from "./parseRssFeed"

export type NewsQuery = {
  page?: number
  perPage?: number
  query?: string
  language?: NewsLanguage
}

async function loadFeed(feed: FeedDefinition): Promise<NewsItem[]> {
  const result = await fetchText(feed.url)

  if (!result.ok) return []

  const items = parseRssFeed(result.data, {
    source: feed.source,
    images: feed.images,
    language: feed.language,
  })
  const { scope } = feed

  if (scope === "all") return items
  if (scope === "keywords") return items.filter((item) => isCs2Related(item.title, item.excerpt))

  return items.filter((item) => item.url.includes(scope.linkIncludes))
}

function dedupe(items: readonly NewsItem[]): NewsItem[] {
  const seen = new Set<string>()
  const unique: NewsItem[] = []

  for (const item of items) {
    const key = item.title.toLowerCase().replace(/[^a-zа-я0-9]/gi, "").slice(0, 60)

    if (seen.has(key)) continue

    seen.add(key)
    unique.push(item)
  }

  return unique
}

export async function getAllNews(): Promise<NewsItem[]> {
  "use cache"
  cacheLife("feed")
  cacheTag(feedTag(CS2_MODULE))

  const feeds = await Promise.all(FEEDS.map(loadFeed))
  const merged = feeds.flat().sort(
    (left, right) => right.publishedAt.getTime() - left.publishedAt.getTime(),
  )

  return dedupe(merged)
}

export async function getNewsFeed(
  query: NewsQuery = {},
): Promise<ApiResult<Paginated<NewsItem>>> {
  const all = await getAllNews()
  const items = query.language === undefined ? all : all.filter((item) => item.language === query.language)
  const needle = query.query?.trim().toLowerCase()
  const matching =
    needle === undefined || needle.length === 0
      ? items
      : items.filter((item) =>
          `${item.title} ${item.excerpt}`.toLowerCase().includes(needle),
        )

  return ok(paginate(matching, query.page ?? 1, query.perPage ?? NEWS_PER_PAGE))
}
