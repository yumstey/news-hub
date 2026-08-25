import { cacheLife, cacheTag } from "next/cache"

import { apiError, fail, ok, pandaList, pandaOne } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { tournamentTag } from "@/shared/config"

import type { StandingRow, Tournament } from "../model/tournament"
import {
  CS2_PATH,
  SCOPE_PAGE_SIZE,
} from "./pandaTournamentEndpoints"
import { toStanding, toTournament } from "./pandaTournamentMapper"
import {
  pandaSerieDetailSchema,
  pandaStageSchema,
  pandaStandingSchema,
} from "./pandaTournamentSchema"
import type { PandaStageWire } from "./pandaTournamentSchema"

function mainStage(stages: readonly PandaStageWire[]): PandaStageWire | undefined {
  const finals = stages.find((stage) => /playoff|final/i.test(stage.name))

  return finals ?? stages[0]
}

async function loadStandings(stageId: number): Promise<StandingRow[]> {
  const result = await pandaList(`/tournaments/${stageId}/standings`, pandaStandingSchema)

  if (!result.ok) return []

  return result.data.flatMap((wire, index) => {
    const row = toStanding(wire, index)

    return row === null ? [] : [row]
  })
}

export async function getTournamentBySlug(
  slug: string,
): Promise<ApiResult<Tournament>> {
  "use cache"
  cacheLife("reference")
  cacheTag(tournamentTag(slug))

  const serie = await pandaOne(
    `/series/${encodeURIComponent(slug)}`,
    pandaSerieDetailSchema,
  )

  if (!serie.ok) return fail(serie.error)

  const stages = await pandaList(`${CS2_PATH}/tournaments`, pandaStageSchema, {
    "filter[serie_id]": serie.data.id,
    "page[size]": SCOPE_PAGE_SIZE,
  })

  if (!stages.ok) return fail(stages.error)

  const main = mainStage(stages.data)
  const standings = main === undefined ? [] : await loadStandings(main.id)
  const tournament = toTournament(stages.data, new Date(), standings)

  if (tournament === null) {
    return fail(apiError("not-found", `Турнир «${slug}» не найден`, 404))
  }

  return ok(tournament)
}
