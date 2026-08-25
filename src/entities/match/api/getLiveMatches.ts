import { connection } from "next/server"

import { fail, ok, pandaList } from "@/shared/api"
import type { ApiResult } from "@/shared/api"

import type { Match } from "../model/match"
import { CS2_PATH, pageSize } from "./pandaEndpoints"
import { toMatchList } from "./pandaMatchMapper"
import { pandaMatchSchema } from "./pandaMatchSchema"

export async function getLiveMatches(): Promise<ApiResult<Match[]>> {
  await connection()

  const result = await pandaList(`${CS2_PATH}/matches/running`, pandaMatchSchema, {
    "page[size]": pageSize(undefined),
    sort: "begin_at",
  })

  if (!result.ok) return fail(result.error)

  return ok(toMatchList(result.data))
}
