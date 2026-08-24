import { cacheLife, cacheTag } from "next/cache"

import { apiError, fail, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { rankingTag } from "@/shared/config"

import type { RankingRow } from "../model/team"
import { toTeam } from "./teamMapper"
import { parseTeamSource } from "./parseTeamSource"

export async function getTeamRankings(
  disciplineSlug: string,
  limit?: number,
): Promise<ApiResult<RankingRow[]>> {
  "use cache"
  cacheLife("reference")
  cacheTag(rankingTag(disciplineSlug))

  const source = parseTeamSource()

  if (source === null) {
    return fail(apiError("contract", "Рейтинг команд не соответствует контракту"))
  }

  const rows = source
    .filter((wire) => wire.discipline.slug === disciplineSlug && wire.world_ranking !== null)
    .map(toTeam)
    .sort((left, right) => (left.worldRanking ?? 999) - (right.worldRanking ?? 999))
    .map((team, index) => ({
      rank: team.worldRanking ?? index + 1,
      change: team.rankingChange,
      points: team.rankingPoints,
      team: team.ref,
      region: team.region,
      form: team.recentForm,
    }))

  return ok(limit === undefined ? rows : rows.slice(0, limit))
}
