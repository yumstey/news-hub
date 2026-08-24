import { cacheLife, cacheTag } from "next/cache"

import { apiError, fail, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { disciplineTag } from "@/shared/config"

import type { Match } from "../model/match"
import { toMatch } from "./matchMapper"
import { byStartAsc, parseMatchSource } from "./parseMatchSource"

export async function getUpcomingMatches(
  disciplineSlug: string,
  limit?: number,
): Promise<ApiResult<Match[]>> {
  "use cache"
  cacheLife("schedule")
  cacheTag(disciplineTag(disciplineSlug))

  const source = parseMatchSource()

  if (source === null) {
    return fail(apiError("contract", "Расписание матчей не соответствует контракту"))
  }

  const matches = source
    .filter((wire) => wire.discipline.slug === disciplineSlug && wire.status === "scheduled")
    .sort(byStartAsc)
    .map(toMatch)

  return ok(limit === undefined ? matches : matches.slice(0, limit))
}
