import { cacheTag } from "next/cache"
import { z } from "zod"

import { pandaList } from "@/shared/api"
import { CS2_MODULE, scheduleTag } from "@/shared/config"
import { cacheFor } from "@/shared/lib/cache"

import { CS2_PATH } from "./pandaEndpoints"

/**
 * Сколько матчей идёт прямо сейчас — для индикатора в шапке. Шапка есть на
 * каждой странице, поэтому, в отличие от getLiveMatches, число кэшируется
 * на пару минут: один запрос к PandaScore вместо запроса на каждый просмотр.
 */
export async function getLiveCount(): Promise<number> {
  "use cache"
  cacheTag(scheduleTag(CS2_MODULE))

  const result = await pandaList(`${CS2_PATH}/matches/running`, z.object({ id: z.number() }), {
    "page[size]": 50,
  })

  cacheFor("feed", result.ok)

  return result.ok ? result.data.length : 0
}
