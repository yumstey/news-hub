import { cacheLife, cacheTag } from "next/cache"

import { apiError, fail, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { teamTag } from "@/shared/config"

import type { Match } from "../model/match"
import { toMatch } from "./matchMapper"
import { byStartAsc, byStartDesc, hasTeam, parseMatchSource } from "./parseMatchSource"

export async function getTeamMatches(
  disciplineSlug: string,
  teamSlug: string,
  kind: "upcoming" | "results",
  limit?: number,
): Promise<ApiResult<Match[]>> {
  "use cache"
  cacheLife("schedule")
  cacheTag(teamTag(teamSlug))

  const source = parseMatchSource()

  if (source === null) {
    return fail(apiError("contract", "Матчи команды не соответствуют контракту"))
  }

  const matches = source
    .filter((wire) => wire.discipline.slug === disciplineSlug && hasTeam(wire, teamSlug))
    .filter((wire) =>
      kind === "upcoming"
        ? wire.status === "scheduled" || wire.status === "live"
        : wire.status === "finished",
    )
    .sort(kind === "upcoming" ? byStartAsc : byStartDesc)
    .map(toMatch)

  return ok(limit === undefined ? matches : matches.slice(0, limit))
}
