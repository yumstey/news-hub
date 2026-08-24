import { cacheLife, cacheTag } from "next/cache"

import { apiError, fail, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { playerTag } from "@/shared/config"

import type { Player } from "../model/player"
import { toPlayer } from "./playerMapper"
import { parsePlayerSource } from "./parsePlayerSource"

export async function getPlayerBySlug(
  disciplineSlug: string,
  slug: string,
): Promise<ApiResult<Player>> {
  "use cache"
  cacheLife("reference")
  cacheTag(playerTag(slug))

  const source = parsePlayerSource()

  if (source === null) {
    return fail(apiError("contract", "Профиль игрока не соответствует контракту"))
  }

  const found = source.find(
    (wire) => wire.discipline.slug === disciplineSlug && wire.slug === slug,
  )

  if (!found) {
    return fail(apiError("not-found", `Игрок «${slug}» не найден`, 404))
  }

  return ok(toPlayer(found))
}
