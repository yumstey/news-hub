import { cacheLife } from "next/cache"

import { fail, ok, pandaList } from "@/shared/api"
import type { ApiResult } from "@/shared/api"

import type { TeamRef } from "../model/team"
import { CS2_PATH } from "./pandaTeamEndpoints"
import { pandaTeamRefSchema, toTeamRef } from "./pandaTeamRef"

const SEARCH_SIZE = 8

export async function searchTeams(query: string): Promise<ApiResult<TeamRef[]>> {
  "use cache"
  cacheLife("feed")

  const result = await pandaList(`${CS2_PATH}/teams`, pandaTeamRefSchema, {
    "search[name]": query,
    "page[size]": SEARCH_SIZE,
  })

  if (!result.ok) return fail(result.error)

  return ok(result.data.map(toTeamRef))
}
