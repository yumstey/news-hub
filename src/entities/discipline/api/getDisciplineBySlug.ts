import { cacheLife, cacheTag } from "next/cache"

import { apiError, fail, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { disciplineTag } from "@/shared/config"

import type { Discipline } from "../model/discipline"
import { toDiscipline } from "./disciplineMapper"
import { parseDisciplineSource } from "./parseDisciplineSource"

export async function getDisciplineBySlug(slug: string): Promise<ApiResult<Discipline>> {
  "use cache"
  cacheLife("reference")
  cacheTag(disciplineTag(slug))

  const source = parseDisciplineSource()

  if (source === null) {
    return fail(apiError("contract", "Список дисциплин не соответствует контракту"))
  }

  const found = source.find((wire) => wire.kind === "esport" && wire.slug === slug)

  if (!found) {
    return fail(apiError("not-found", `Дисциплина «${slug}» не найдена`, 404))
  }

  return ok(toDiscipline(found))
}
