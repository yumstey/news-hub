import { cacheLife, cacheTag } from "next/cache"

import { fail, ok, pandaList } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { teamTag } from "@/shared/config"

import type { Match } from "../model/match"
import { pageSize } from "./pandaEndpoints"
import { toMatchList } from "./pandaMatchMapper"
import { pandaMatchSchema } from "./pandaMatchSchema"

export async function getTeamMatches(
  teamSlug: string,
  kind: "upcoming" | "results",
  limit?: number,
): Promise<ApiResult<Match[]>> {
  "use cache"
  cacheLife("schedule")
  cacheTag(teamTag(teamSlug))

  const result = await pandaList(
    `/teams/${encodeURIComponent(teamSlug)}/matches`,
    pandaMatchSchema,
    {
      "page[size]": pageSize(limit),
      "filter[status]": kind === "results" ? "finished" : "not_started,running",
      sort: kind === "results" ? "-begin_at" : "begin_at",
    },
  )

  if (!result.ok) return fail(result.error)

  const matches = toMatchList(result.data)

  return ok(limit === undefined ? matches : matches.slice(0, limit))
}
