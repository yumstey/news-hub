import { cacheLife, cacheTag } from "next/cache"

import { apiError, fail, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { feedTag } from "@/shared/config"

import type { Category } from "../model/category"
import { toCategory } from "./categoryMapper"
import { parseCategorySource } from "./parseCategorySource"

export async function getNewsCategories(): Promise<ApiResult<Category[]>> {
  "use cache"
  cacheLife("reference")
  cacheTag(feedTag("news"))

  const source = parseCategorySource()

  if (source === null) {
    return fail(apiError("contract", "Список рубрик не соответствует контракту"))
  }

  return ok(source.filter((wire) => wire.module === "news").map(toCategory))
}
