import { cacheLife, cacheTag } from "next/cache"

import { apiError, fail, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { categoryTag } from "@/shared/config"

import type { Category } from "../model/category"
import { toCategory } from "./categoryMapper"
import { parseCategorySource } from "./parseCategorySource"

export async function getNewsCategoryBySlug(slug: string): Promise<ApiResult<Category>> {
  "use cache"
  cacheLife("reference")
  cacheTag(categoryTag(slug))

  const source = parseCategorySource()

  if (source === null) {
    return fail(apiError("contract", "Список рубрик не соответствует контракту"))
  }

  const found = source.find((wire) => wire.module === "news" && wire.slug === slug)

  if (!found) {
    return fail(apiError("not-found", `Рубрика «${slug}» не найдена`, 404))
  }

  return ok(toCategory(found))
}
