import { cacheLife, cacheTag } from "next/cache"

import { fail, ok, pandaOne } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { teamTag } from "@/shared/config"

import type { Team } from "../model/team"
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

  const record = await getTeamRecord(slug, result.data.id)

  return ok(toTeam(result.data, record))
}
