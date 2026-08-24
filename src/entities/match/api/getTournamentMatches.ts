import { cacheLife, cacheTag } from "next/cache"

import { apiError, fail, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { tournamentTag } from "@/shared/config"

import type { Match } from "../model/match"
import { toMatch } from "./matchMapper"
import { byStartDesc, parseMatchSource } from "./parseMatchSource"

export async function getTournamentMatches(
  disciplineSlug: string,
  tournamentSlug: string,
  limit?: number,
): Promise<ApiResult<Match[]>> {
  "use cache"
  cacheLife("schedule")
  cacheTag(tournamentTag(tournamentSlug))

  const source = parseMatchSource()

  if (source === null) {
    return fail(apiError("contract", "Матчи турнира не соответствуют контракту"))
  }

  const matches = source
    .filter(
      (wire) =>
        wire.discipline.slug === disciplineSlug && wire.tournament.slug === tournamentSlug,
    )
    .sort(byStartDesc)
    .map(toMatch)

  return ok(limit === undefined ? matches : matches.slice(0, limit))
}
