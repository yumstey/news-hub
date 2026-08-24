import { cacheLife, cacheTag } from "next/cache"

import { apiError, fail, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { disciplineTag } from "@/shared/config"

import type { Tournament, TournamentStatus } from "../model/tournament"
import { toTournament } from "./tournamentMapper"
import { parseTournamentSource } from "./parseTournamentSource"

const STATUS_ORDER: Record<TournamentStatus, number> = {
  ongoing: 0,
  upcoming: 1,
  finished: 2,
}

export async function getTournaments(
  disciplineSlug: string,
  status?: TournamentStatus,
): Promise<ApiResult<Tournament[]>> {
  "use cache"
  cacheLife("reference")
  cacheTag(disciplineTag(disciplineSlug))

  const source = parseTournamentSource()

  if (source === null) {
    return fail(apiError("contract", "Список турниров не соответствует контракту"))
  }

  const tournaments = source
    .filter((wire) => wire.discipline.slug === disciplineSlug)
    .filter((wire) => (status === undefined ? true : wire.status === status))
    .map(toTournament)
    .sort((left, right) => {
      const byStatus = STATUS_ORDER[left.status] - STATUS_ORDER[right.status]
      if (byStatus !== 0) return byStatus
      return right.startsAt.getTime() - left.startsAt.getTime()
    })

  return ok(tournaments)
}
