import { cacheLife, cacheTag } from "next/cache"

import { apiError, fail, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { articleTag } from "@/shared/config"
import type { ContentModule } from "@/shared/model"

import type { Article } from "../model/article"
import { toArticle } from "./articleMapper"
import { isPublished, parseArticleSource } from "./parseArticleSource"

export async function getArticleBySlug(
  module: ContentModule,
  slug: string,
): Promise<ApiResult<Article>> {
  "use cache"
  cacheLife("article")
  cacheTag(articleTag(slug))

  const source = parseArticleSource()

  if (source === null) {
    return fail(apiError("contract", "Материал не соответствует контракту"))
  }

  const found = source
    .filter(isPublished)
    .find((wire) => wire.module === module && wire.slug === slug)

  if (!found) {
    return fail(apiError("not-found", `Материал «${slug}» не найден`, 404))
  }

  return ok(toArticle(found))
}
