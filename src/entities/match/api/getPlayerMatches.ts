import { cacheLife, cacheTag } from "next/cache"

import { fail, ok, pandaList } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { playerTag } from "@/shared/config"

import type { Match } from "../model/match"
import { pageSize } from "./pandaEndpoints"
import { toMatchList } from "./pandaMatchMapper"
import { pandaMatchSchema } from "./pandaMatchSchema"

export async function getPlayerMatches(
  playerSlug: string,
  limit?: number,
): Promise<ApiResult<Match[]>> {
  "use cache"
  cacheLife("schedule")
  cacheTag(playerTag(playerSlug))

  const result = await pandaList(
    `/players/${encodeURIComponent(playerSlug)}/matches`,
    pandaMatchSchema,
    {
      "page[size]": pageSize(limit),
      "filter[status]": "finished",
      sort: "-begin_at",
    },
  )

  if (!result.ok) return fail(result.error)

  const matches = toMatchList(result.data)

  return ok(limit === undefined ? matches : matches.slice(0, limit))
}
