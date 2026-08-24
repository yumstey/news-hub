import { cacheLife, cacheTag } from "next/cache"

import { apiError, fail, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { tournamentTag } from "@/shared/config"

import type { Tournament } from "../model/tournament"
import { toTournament } from "./tournamentMapper"
import { parseTournamentSource } from "./parseTournamentSource"

export async function getTournamentBySlug(
  disciplineSlug: string,
  slug: string,
): Promise<ApiResult<Tournament>> {
  "use cache"
  cacheLife("reference")
  cacheTag(tournamentTag(slug))

  const source = parseTournamentSource()

  if (source === null) {
    return fail(apiError("contract", "Турнир не соответствует контракту"))
  }

  const found = source.find(
    (wire) => wire.discipline.slug === disciplineSlug && wire.slug === slug,
  )

  if (!found) {
    return fail(apiError("not-found", `Турнир «${slug}» не найден`, 404))
  }

  return ok(toTournament(found))
}
