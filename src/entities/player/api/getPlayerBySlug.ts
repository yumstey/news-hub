import { cacheLife, cacheTag } from "next/cache"

import { fail, ok, pandaOne } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { playerTag } from "@/shared/config"

import type { Player } from "../model/player"
import { toPlayer } from "./pandaPlayerMapper"
import { pandaPlayerSchema } from "./pandaPlayerSchema"

export async function getPlayerBySlug(slug: string): Promise<ApiResult<Player>> {
  "use cache"
  cacheLife("reference")
  cacheTag(playerTag(slug))

  const result = await pandaOne(
    `/players/${encodeURIComponent(slug)}`,
    pandaPlayerSchema,
  )

  if (!result.ok) return fail(result.error)

  return ok(toPlayer(result.data))
}
