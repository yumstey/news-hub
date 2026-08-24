import { cacheLife, cacheTag } from "next/cache"

import { apiError, fail, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { disciplineTag } from "@/shared/config"

import type { Team } from "../model/team"
import { toTeam } from "./teamMapper"
import { parseTeamSource } from "./parseTeamSource"

export async function getTeams(disciplineSlug: string): Promise<ApiResult<Team[]>> {
  "use cache"
  cacheLife("reference")
  cacheTag(disciplineTag(disciplineSlug))

  const source = parseTeamSource()

  if (source === null) {
    return fail(apiError("contract", "Список команд не соответствует контракту"))
  }

  return ok(
    source
      .filter((wire) => wire.discipline.slug === disciplineSlug)
      .map(toTeam)
      .sort((left, right) => (left.worldRanking ?? 999) - (right.worldRanking ?? 999)),
  )
}
