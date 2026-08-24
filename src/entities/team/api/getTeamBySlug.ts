import { cacheLife, cacheTag } from "next/cache"

import { apiError, fail, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { teamTag } from "@/shared/config"

import type { Team } from "../model/team"
import { toTeam } from "./teamMapper"
import { parseTeamSource } from "./parseTeamSource"

export async function getTeamBySlug(
  disciplineSlug: string,
  slug: string,
): Promise<ApiResult<Team>> {
  "use cache"
  cacheLife("reference")
  cacheTag(teamTag(slug))

  const source = parseTeamSource()

  if (source === null) {
    return fail(apiError("contract", "Профиль команды не соответствует контракту"))
  }

  const found = source.find(
    (wire) => wire.discipline.slug === disciplineSlug && wire.slug === slug,
  )

  if (!found) {
    return fail(apiError("not-found", `Команда «${slug}» не найдена`, 404))
  }

  return ok(toTeam(found))
}
