import { cacheLife, cacheTag } from "next/cache"

import { apiError, fail, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { CS2_MODULE, rankingTag } from "@/shared/config"

import type { RankingRow } from "../model/team"
import { normaliseName, resolveTeamRefs } from "./resolveTeamRefs"
import { fetchSnapshot, latestSnapshots } from "./valveStandings"

const RANKING_SIZE = 30

export async function getTeamRankings(
  limit?: number,
): Promise<ApiResult<RankingRow[]>> {
  "use cache"
  cacheLife("reference")
  cacheTag(rankingTag(CS2_MODULE))

  const [current, previous] = await latestSnapshots(new Date())

  if (current === undefined) {
    return fail(apiError("not-found", "Рейтинг Valve сейчас недоступен", 404))
  }

  const snapshot = await fetchSnapshot(current)

  if (!snapshot.ok) return fail(snapshot.error)

  const size = Math.min(limit ?? RANKING_SIZE, RANKING_SIZE)
  const top = snapshot.data.slice(0, size)

  const previousRanks = new Map<string, number>()

  if (previous !== undefined) {
    const earlier = await fetchSnapshot(previous)

    if (earlier.ok) {
      for (const row of earlier.data) previousRanks.set(normaliseName(row.name), row.rank)
    }
  }

  const refs = await resolveTeamRefs(top.map((row) => row.name))

  return ok(
    top.flatMap((row): RankingRow[] => {
      const key = normaliseName(row.name)
      const team = refs.get(key)

      if (team === undefined) return []

      const before = previousRanks.get(key)

      return [
        {
          rank: row.rank,
          change: before === undefined ? null : before - row.rank,
          points: row.points,
          team,
          region: null,
          form: [],
        },
      ]
    }),
  )
}
