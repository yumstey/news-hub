import { cacheLife, cacheTag } from "next/cache"

import { apiError, fail, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { feedTag } from "@/shared/config"
import { paginate } from "@/shared/model"
import type { Paginated } from "@/shared/model"

import { ARTICLE_PER_PAGE } from "../model/article"
import type { ArticleFeedQuery, ArticlePreview } from "../model/article"
import { toArticlePreview } from "./articleMapper"
import { byPublishedDesc, byViewsDesc, isPublished, parseArticleSource } from "./parseArticleSource"

export async function getArticleFeed(
  query: ArticleFeedQuery,
): Promise<ApiResult<Paginated<ArticlePreview>>> {
  "use cache"
  cacheLife("feed")
  cacheTag(feedTag(query.module))

  const source = parseArticleSource()

  if (source === null) {
    return fail(apiError("contract", "Лента материалов не соответствует контракту"))
  }

  const matching = source
    .filter(isPublished)
    .filter((wire) => wire.module === query.module)
    .filter((wire) =>
      query.category === undefined
        ? true
        : wire.categories.some((category) => category.slug === query.category),
    )
    .filter((wire) => (query.tag === undefined ? true : wire.tags.includes(query.tag)))
    .sort(query.sort === "popular" ? byViewsDesc : byPublishedDesc)
    .map(toArticlePreview)

  return ok(paginate(matching, query.page ?? 1, query.perPage ?? ARTICLE_PER_PAGE))
}
