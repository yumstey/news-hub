import { cacheLife, cacheTag } from "next/cache"

import { apiError, fail, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { feedTag } from "@/shared/config"

import type { Discipline } from "../model/discipline"
import { toDiscipline } from "./disciplineMapper"
import { parseDisciplineSource } from "./parseDisciplineSource"

export async function getDisciplines(): Promise<ApiResult<Discipline[]>> {
  "use cache"
  cacheLife("reference")
  cacheTag(feedTag("esports"))

  const source = parseDisciplineSource()

  if (source === null) {
    return fail(apiError("contract", "Список дисциплин не соответствует контракту"))
  }

  return ok(source.filter((wire) => wire.kind === "esport").map(toDiscipline))
}
