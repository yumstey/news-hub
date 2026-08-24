import { cacheLife, cacheTag } from "next/cache"

import { apiError, fail, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { matchTag } from "@/shared/config"

import type { Match } from "../model/match"
import { toMatch } from "./matchMapper"
import { parseMatchSource } from "./parseMatchSource"

export async function getMatchById(
  disciplineSlug: string,
  id: string,
): Promise<ApiResult<Match>> {
  "use cache"
  cacheLife("schedule")
  cacheTag(matchTag(id))

  const source = parseMatchSource()

  if (source === null) {
    return fail(apiError("contract", "Матч не соответствует контракту"))
  }

  const found = source.find(
    (wire) => wire.discipline.slug === disciplineSlug && wire.id === id,
  )

  if (!found) {
    return fail(apiError("not-found", `Матч «${id}» не найден`, 404))
  }

  return ok(toMatch(found))
}
