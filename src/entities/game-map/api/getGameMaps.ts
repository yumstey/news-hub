import { cacheTag } from "next/cache"
import { z } from "zod"

import { ok, pandaList } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { CS2_MODULE, rankingTag } from "@/shared/config"
import { cacheFor } from "@/shared/lib/cache"

import { toMapSlug } from "../lib/mapSlug"
import type { GameMap } from "../model/gameMap"

const gameMapSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  slug: z.string().min(1),
  image_url: z.string().nullable().default(null),
})

/** Справочник карт CS2 вместе с официальными скриншотами PandaScore. */
export async function getGameMaps(): Promise<ApiResult<GameMap[]>> {
  "use cache"
  cacheTag(rankingTag(`maps:${CS2_MODULE}`))

  const result = await pandaList("/csgo/maps", gameMapSchema, { "page[size]": 50 })

  cacheFor("reference", result.ok)

  if (!result.ok) return ok([])

  return ok(
    result.data.map((wire) => ({
      id: String(wire.id),
      slug: toMapSlug(wire.slug),
      name: wire.name,
      image: wire.image_url,
    })),
  )
}
