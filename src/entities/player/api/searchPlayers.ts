import { cacheLife } from "next/cache"

import { fail, ok, pandaList } from "@/shared/api"
import type { ApiResult } from "@/shared/api"

import type { Player } from "../model/player"
import { toPlayer } from "./pandaPlayerMapper"
import { pandaPlayerSchema } from "./pandaPlayerSchema"

const SEARCH_SIZE = 8

export async function searchPlayers(query: string): Promise<ApiResult<Player[]>> {
  "use cache"
  cacheLife("feed")

  const result = await pandaList("/csgo/players", pandaPlayerSchema, {
    "search[name]": query,
    "page[size]": SEARCH_SIZE,
  })

  if (!result.ok) return fail(result.error)

  return ok(result.data.map(toPlayer))
}
