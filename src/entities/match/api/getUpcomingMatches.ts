import { cacheLife, cacheTag } from "next/cache"

import { fail, ok, pandaList } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { CS2_MODULE, scheduleTag } from "@/shared/config"

import type { Match } from "../model/match"
import { CS2_PATH, pageSize } from "./pandaEndpoints"
import { toMatchList } from "./pandaMatchMapper"
import { pandaMatchSchema } from "./pandaMatchSchema"

export async function getUpcomingMatches(limit?: number): Promise<ApiResult<Match[]>> {
  "use cache"
  cacheLife("schedule")
  cacheTag(scheduleTag(CS2_MODULE))

  const result = await pandaList(`${CS2_PATH}/matches/upcoming`, pandaMatchSchema, {
    "page[size]": pageSize(limit),
    sort: "begin_at",
  })

  if (!result.ok) return fail(result.error)

  const matches = toMatchList(result.data)

  return ok(limit === undefined ? matches : matches.slice(0, limit))
}
