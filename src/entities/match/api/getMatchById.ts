import { cacheLife, cacheTag } from "next/cache"

import { apiError, fail, ok, pandaOne } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { matchTag } from "@/shared/config"

import type { Match } from "../model/match"
import { getMatchLineups } from "./getMatchLineups"
import { toMatch } from "./pandaMatchMapper"
import { pandaMatchSchema } from "./pandaMatchSchema"

export async function getMatchById(id: string): Promise<ApiResult<Match>> {
  "use cache"
  cacheLife("schedule")
  cacheTag(matchTag(id))

  const result = await pandaOne(`/matches/${encodeURIComponent(id)}`, pandaMatchSchema)

  if (!result.ok) return fail(result.error)

  const match = toMatch(result.data)

  if (match === null) {
    return fail(apiError("not-found", `Матч «${id}» не найден`, 404))
  }

  const [first, second] = match.teams

  return ok({ ...match, lineups: await getMatchLineups(id, first.team.id, second.team.id) })
}
