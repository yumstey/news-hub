import { cacheLife, cacheTag } from "next/cache"

import { ok, pandaList } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { CS2_MODULE, feedTag } from "@/shared/config"

import type { Tournament } from "../model/tournament"
import {
  CS2_PATH,
  RELEVANT_TIERS,
  SCOPE_PAGE_SIZE,
} from "./pandaTournamentEndpoints"
import { groupBySerie, toTournament } from "./pandaTournamentMapper"
import { pandaStageSchema } from "./pandaTournamentSchema"
import type { PandaStageWire } from "./pandaTournamentSchema"

const TIER_RANK: Record<Tournament["tier"], number> = { s: 0, a: 1, b: 2, c: 3 }

async function stages(scope: "running" | "upcoming" | "past"): Promise<PandaStageWire[]> {
  const result = await pandaList(`${CS2_PATH}/tournaments/${scope}`, pandaStageSchema, {
    "filter[tier]": RELEVANT_TIERS,
    "page[size]": SCOPE_PAGE_SIZE,
    sort: scope === "past" ? "-begin_at" : "begin_at",
  })

  return result.ok ? result.data : []
}

export async function getTournaments(): Promise<ApiResult<Tournament[]>> {
  "use cache"
  cacheLife("reference")
  cacheTag(feedTag(CS2_MODULE))

  const [running, upcoming, past] = await Promise.all([
    stages("running"),
    stages("upcoming"),
    stages("past"),
  ])

  const now = new Date()
  const tournaments = groupBySerie([...running, ...upcoming, ...past]).flatMap((group) => {
    const tournament = toTournament(group, now)

    return tournament === null ? [] : [tournament]
  })

  return ok(
    tournaments.sort((left, right) => {
      const byTier = TIER_RANK[left.tier] - TIER_RANK[right.tier]

      if (byTier !== 0) return byTier

      return right.startsAt.getTime() - left.startsAt.getTime()
    }),
  )
}
