import { cacheLife, cacheTag } from "next/cache"

import { apiError, fail, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { feedTag } from "@/shared/config"
import type { ContentModule } from "@/shared/model"

import type { ArticlePreview } from "../model/article"
import { toArticlePreview } from "./articleMapper"
import { byPublishedDesc, isPublished, parseArticleSource } from "./parseArticleSource"

export async function getFeaturedArticles(
  module: ContentModule,
  limit: number,
): Promise<ApiResult<ArticlePreview[]>> {
  "use cache"
  cacheLife("feed")
  cacheTag(feedTag(module))

  const source = parseArticleSource()

  if (source === null) {
    return fail(apiError("contract", "Подборка главных материалов не соответствует контракту"))
  }

  return ok(
    source
      .filter(isPublished)
      .filter((wire) => wire.module === module && wire.is_featured)
      .sort(byPublishedDesc)
      .slice(0, limit)
      .map(toArticlePreview),
  )
}
