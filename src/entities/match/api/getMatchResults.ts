import { cacheLife, cacheTag } from "next/cache"

import { apiError, fail, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { disciplineTag } from "@/shared/config"

import type { Match } from "../model/match"
import { toMatch } from "./matchMapper"
import { byStartDesc, parseMatchSource } from "./parseMatchSource"

export async function getMatchResults(
  disciplineSlug: string,
  limit?: number,
): Promise<ApiResult<Match[]>> {
  "use cache"
  cacheLife("schedule")
  cacheTag(disciplineTag(disciplineSlug))

  const source = parseMatchSource()

  if (source === null) {
    return fail(apiError("contract", "Результаты матчей не соответствуют контракту"))
  }

  const matches = source
    .filter((wire) => wire.discipline.slug === disciplineSlug && wire.status === "finished")
    .sort(byStartDesc)
    .map(toMatch)

  return ok(limit === undefined ? matches : matches.slice(0, limit))
}
