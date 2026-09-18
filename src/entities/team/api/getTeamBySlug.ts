import { cacheLife, cacheTag } from "next/cache"

import { fail, ok, pandaOne } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { teamTag } from "@/shared/config"

import type { Team } from "../model/team"
import { getTeamRankings } from "./getTeamRankings"
import { getTeamRecord } from "./getTeamRecord"
import { toTeam } from "./pandaTeamMapper"
import { pandaTeamSchema } from "./pandaTeamSchema"

export async function getTeamBySlug(
  slug: string,
): Promise<ApiResult<Team>> {
  "use cache"
  cacheLife("reference")
  cacheTag(teamTag(slug))

  const result = await pandaOne(`/teams/${encodeURIComponent(slug)}`, pandaTeamSchema)

  if (!result.ok) return fail(result.error)

  const [record, rankings] = await Promise.all([
    getTeamRecord(slug, result.data.id),
    getTeamRankings(),
  ])
  const team = toTeam(result.data, record)
  // Место в рейтинге Valve живёт в отдельной выгрузке — сводим по id PandaScore.
  const row = rankings.ok ? rankings.data.find((entry) => entry.team.id === team.id) : undefined

  return ok(
    row === undefined
      ? team
      : { ...team, worldRanking: row.rank, rankingPoints: row.points, rankingChange: row.change },
  )
}
