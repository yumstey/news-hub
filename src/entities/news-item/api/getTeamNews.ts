import { ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"

import type { NewsItem } from "../model/newsItem"
import { getAllNews } from "./getNewsFeed"

const TEAM_NEWS_LIMIT = 6

function matches(item: NewsItem, needles: readonly string[]): boolean {
  const haystack = `${item.title} ${item.excerpt}`.toLowerCase()

  return needles.some((needle) => haystack.includes(needle))
}

export async function getTeamNews(
  teamName: string,
  shortName: string,
): Promise<ApiResult<NewsItem[]>> {
  const items = await getAllNews()
  const needles = [teamName, shortName]
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length >= 3)

  if (needles.length === 0) return ok([])

  return ok(items.filter((item) => matches(item, needles)).slice(0, TEAM_NEWS_LIMIT))
}
