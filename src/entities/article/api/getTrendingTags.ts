import { cacheLife, cacheTag } from "next/cache"

import { apiError, fail, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { feedTag } from "@/shared/config"
import type { ContentModule } from "@/shared/model"

import type { TrendingTag } from "../model/article"
import { isPublished, parseArticleSource } from "./parseArticleSource"

export async function getTrendingTags(
  module: ContentModule,
  limit: number,
): Promise<ApiResult<TrendingTag[]>> {
  "use cache"
  cacheLife("feed")
  cacheTag(feedTag(module))

  const source = parseArticleSource()

  if (source === null) {
    return fail(apiError("contract", "Подборка тем не соответствует контракту"))
  }

  const counts = new Map<string, number>()

  for (const wire of source.filter(isPublished).filter((item) => item.module === module)) {
    for (const tag of wire.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }

  return ok(
    [...counts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((left, right) => right.count - left.count || left.tag.localeCompare(right.tag))
      .slice(0, limit),
  )
}
