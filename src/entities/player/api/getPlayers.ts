import { cacheLife, cacheTag } from "next/cache"

import { apiError, fail, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { disciplineTag } from "@/shared/config"

import type { Player, PlayerSort } from "../model/player"
import { toPlayer } from "./playerMapper"
import { parsePlayerSource } from "./parsePlayerSource"

export async function getPlayers(
  disciplineSlug: string,
  sort: PlayerSort = "rating",
): Promise<ApiResult<Player[]>> {
  "use cache"
  cacheLife("reference")
  cacheTag(disciplineTag(disciplineSlug))

  const source = parsePlayerSource()

  if (source === null) {
    return fail(apiError("contract", "Список игроков не соответствует контракту"))
  }

  const players = source
    .filter((wire) => wire.discipline.slug === disciplineSlug)
    .map(toPlayer)

  const sorted = [...players].sort((left, right) => {
    if (sort === "nickname") return left.nickname.localeCompare(right.nickname)
    if (sort === "kd") return right.stats.kd - left.stats.kd
    if (sort === "adr") return right.stats.adr - left.stats.adr
    return right.stats.rating - left.stats.rating
  })

  return ok(sorted)
}
