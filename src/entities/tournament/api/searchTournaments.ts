import { cacheLife } from "next/cache"

import { fail, ok, pandaList } from "@/shared/api"
import type { ApiResult } from "@/shared/api"

import type { Tournament } from "../model/tournament"
import { CS2_PATH } from "./pandaTournamentEndpoints"
import { groupBySerie, toTournament } from "./pandaTournamentMapper"
import { pandaStageSchema } from "./pandaTournamentSchema"

const SEARCH_SIZE = 25

export async function searchTournaments(query: string): Promise<ApiResult<Tournament[]>> {
  "use cache"
  cacheLife("feed")

  const result = await pandaList(`${CS2_PATH}/tournaments`, pandaStageSchema, {
    "search[name]": query,
    "page[size]": SEARCH_SIZE,
  })

  if (!result.ok) return fail(result.error)

  const now = new Date()

  return ok(
    groupBySerie(result.data).flatMap((group) => {
      const tournament = toTournament(group, now)

      return tournament === null ? [] : [tournament]
    }),
  )
}
