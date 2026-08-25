import { cacheLife, cacheTag } from "next/cache"

import { fail, ok, pandaOne } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { teamTag } from "@/shared/config"
import { z } from "zod"

import type { Player } from "../model/player"
import { toPlayer } from "./pandaPlayerMapper"
import { pandaPlayerSchema } from "./pandaPlayerSchema"

const rosterSchema = z.object({
  players: z.array(pandaPlayerSchema).default([]),
})

export async function getTeamPlayers(teamSlug: string): Promise<ApiResult<Player[]>> {
  "use cache"
  cacheLife("reference")
  cacheTag(teamTag(teamSlug))

  const result = await pandaOne(`/teams/${encodeURIComponent(teamSlug)}`, rosterSchema)

  if (!result.ok) return fail(result.error)

  return ok(result.data.players.map(toPlayer))
}
