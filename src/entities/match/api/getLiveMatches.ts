import { connection } from "next/server"

import { apiError, fail, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"

import type { Match } from "../model/match"
import { toMatch } from "./matchMapper"
import { byStartAsc, parseMatchSource } from "./parseMatchSource"

export async function getLiveMatches(disciplineSlug: string): Promise<ApiResult<Match[]>> {
  await connection()

  const source = parseMatchSource()

  if (source === null) {
    return fail(apiError("contract", "Живые матчи не соответствуют контракту"))
  }

  return ok(
    source
      .filter((wire) => wire.discipline.slug === disciplineSlug && wire.status === "live")
      .sort(byStartAsc)
      .map(toMatch),
  )
}
