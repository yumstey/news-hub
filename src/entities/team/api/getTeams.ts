import { cacheLife, cacheTag } from "next/cache"
import { z } from "zod"

import { fail, ok, pandaList } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { CS2_MODULE, feedTag } from "@/shared/config"

import type { Team } from "../model/team"
import { getTeamRankings } from "./getTeamRankings"
import { CS2_PATH, TEAM_INDEX_SIZE } from "./pandaTeamEndpoints"
import { toTeam } from "./pandaTeamMapper"
import { pandaTeamSchema } from "./pandaTeamSchema"

const ACTIVE_TOURNAMENT_SIZE = 50

const tournamentTeamsSchema = z.object({
  teams: z.array(pandaTeamSchema).default([]),
})

async function activeTeams(scope: "running" | "upcoming"): Promise<Team[]> {
  const result = await pandaList(`${CS2_PATH}/tournaments/${scope}`, tournamentTeamsSchema, {
    "page[size]": ACTIVE_TOURNAMENT_SIZE,
  })

  if (!result.ok) return []

  return result.data.flatMap((tournament) => tournament.teams.map((wire) => toTeam(wire)))
}

export async function getTeams(): Promise<ApiResult<Team[]>> {
  "use cache"
  cacheLife("reference")
  cacheTag(feedTag(CS2_MODULE))

  const [rankings, running, upcoming] = await Promise.all([
    getTeamRankings(),
    activeTeams("running"),
    activeTeams("upcoming"),
  ])

  const ranked: Team[] = []
  const seen = new Set<string>()

  if (rankings.ok) {
    for (const row of rankings.data) {
      if (seen.has(row.team.id)) continue

      seen.add(row.team.id)
      ranked.push({
        id: row.team.id,
        slug: row.team.slug,
        name: row.team.name,
        shortName: row.team.shortName,
        logo: row.team.logo,
        darkLogo: row.team.darkLogo,
        country: row.team.country,
        region: null,
        foundedYear: null,
        worldRanking: row.rank,
        rankingPoints: row.points,
        rankingChange: row.change,
        stats: {
          matchesWon: 0,
          matchesLost: 0,
          mapsPlayed: null,
          roundWinRate: null,
          currentStreak: 0,
          winRate: 0,
        },
        recentForm: [],
        seo: {
          title: `${row.team.name} — состав, матчи и результаты`,
          description: `${row.team.name}: актуальный состав, ближайшие матчи и результаты Counter-Strike 2.`,
          canonical: `/teams/${row.team.slug}`,
        },
        ref: row.team,
      })
    }
  }

  const rest: Team[] = []

  for (const team of [...running, ...upcoming]) {
    if (seen.has(team.id)) continue

    seen.add(team.id)
    rest.push(team)
  }

  rest.sort((left, right) => left.name.localeCompare(right.name))

  const teams = [...ranked, ...rest]

  if (teams.length === 0) {
    const fallback = await pandaList(`${CS2_PATH}/teams`, pandaTeamSchema, {
      "page[size]": TEAM_INDEX_SIZE,
      sort: "-modified_at",
    })

    if (!fallback.ok) return fail(fallback.error)

    return ok(fallback.data.map((wire) => toTeam(wire)))
  }

  return ok(teams)
}
