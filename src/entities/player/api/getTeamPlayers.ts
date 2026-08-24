import { cacheLife, cacheTag } from "next/cache"

import { apiError, fail, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { teamTag } from "@/shared/config"

import type { Player } from "../model/player"
import { toPlayer } from "./playerMapper"
import { parsePlayerSource } from "./parsePlayerSource"

const ROLE_ORDER = ["igl", "awper", "entry", "rifler", "support", "coach"]

export async function getTeamPlayers(
  disciplineSlug: string,
  teamSlug: string,
): Promise<ApiResult<Player[]>> {
  "use cache"
  cacheLife("reference")
  cacheTag(teamTag(teamSlug))

  const source = parsePlayerSource()

  if (source === null) {
    return fail(apiError("contract", "Состав команды не соответствует контракту"))
  }

  const players = source
    .filter((wire) => wire.discipline.slug === disciplineSlug && wire.team?.slug === teamSlug)
    .map(toPlayer)
    .sort((left, right) => ROLE_ORDER.indexOf(left.role) - ROLE_ORDER.indexOf(right.role))

  return ok(players)
}
