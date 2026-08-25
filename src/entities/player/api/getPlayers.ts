import { cacheLife, cacheTag } from "next/cache"
import { z } from "zod"

import { fail, ok, pandaList } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { CS2_MODULE, feedTag } from "@/shared/config"

import type { Player } from "../model/player"
import { toPlayer } from "./pandaPlayerMapper"
import { pandaPlayerSchema } from "./pandaPlayerSchema"

const PLAYER_PAGE_SIZE = 100
const TOURNAMENT_SCOPE_SIZE = 50
const TOP_TIERS = "s,a"

const tierTeamsSchema = z.object({
  tier: z.string().nullable().default(null),
  teams: z.array(z.object({ id: z.number().int() })).default([]),
})

async function topTeamIds(): Promise<number[]> {
  const scopes = await Promise.all(
    (["running", "upcoming", "past"] as const).map((scope) =>
      pandaList(`/csgo/tournaments/${scope}`, tierTeamsSchema, {
        "filter[tier]": TOP_TIERS,
        "page[size]": TOURNAMENT_SCOPE_SIZE,
        sort: scope === "past" ? "-begin_at" : "begin_at",
      }),
    ),
  )

  const ordered: number[] = []
  const seen = new Set<number>()

  for (const scope of scopes) {
    if (!scope.ok) continue

    for (const tournament of scope.data) {
      for (const team of tournament.teams) {
        if (seen.has(team.id)) continue

        seen.add(team.id)
        ordered.push(team.id)
      }
    }
  }

  return ordered
}

export async function getPlayers(): Promise<ApiResult<Player[]>> {
  "use cache"
  cacheLife("reference")
  cacheTag(feedTag(CS2_MODULE))

  const teamIds = await topTeamIds()

  if (teamIds.length > 0) {
    const result = await pandaList("/csgo/players", pandaPlayerSchema, {
      "filter[team_id]": teamIds.slice(0, 40).join(","),
      "page[size]": PLAYER_PAGE_SIZE,
    })

    if (result.ok && result.data.length > 0) {
      const rank = new Map(teamIds.map((id, index) => [id, index]))

      return ok(
        result.data
          .slice()
          .sort((left, right) => {
            const leftRank = rank.get(left.current_team?.id ?? -1) ?? Number.MAX_SAFE_INTEGER
            const rightRank = rank.get(right.current_team?.id ?? -1) ?? Number.MAX_SAFE_INTEGER

            if (leftRank !== rightRank) return leftRank - rightRank

            return left.name.localeCompare(right.name)
          })
          .map(toPlayer),
      )
    }
  }

  const fallback = await pandaList("/csgo/players", pandaPlayerSchema, {
    "page[size]": PLAYER_PAGE_SIZE,
    sort: "-modified_at",
  })

  if (!fallback.ok) return fail(fallback.error)

  return ok(fallback.data.filter((wire) => wire.current_team !== null).map(toPlayer))
}
