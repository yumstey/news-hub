import { cacheLife, cacheTag } from "next/cache"
import { z } from "zod"

import { ok, pandaList } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { playerTag } from "@/shared/config"

const HISTORY_SIZE = 60

const stageSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  tier: z.string().nullable().default(null),
  begin_at: z.string().nullable().default(null),
  end_at: z.string().nullable().default(null),
  winner_id: z.number().int().nullable().default(null),
  serie: z
    .object({
      id: z.number().int(),
      name: z.string().nullable().default(null),
      full_name: z.string().nullable().default(null),
      slug: z.string().min(1),
      year: z.number().int().nullable().default(null),
    })
    .nullable()
    .default(null),
  league: z
    .object({
      name: z.string().min(1),
      image_url: z.string().nullable().default(null),
    })
    .nullable()
    .default(null),
})

export type CareerEvent = {
  id: string
  name: string
  slug: string
  logo: string | null
  tier: "s" | "a" | "b" | "c"
  year: number
  startsAt: Date
}

export type PlayerCareer = {
  events: CareerEvent[]
  eventCount: number
  tierOneCount: number
  firstSeen: Date | null
}

export const EMPTY_CAREER: PlayerCareer = {
  events: [],
  eventCount: 0,
  tierOneCount: 0,
  firstSeen: null,
}

function toTier(raw: string | null): CareerEvent["tier"] {
  const value = raw?.toLowerCase()

  return value === "s" || value === "a" || value === "b" ? value : "c"
}

export async function getPlayerCareer(playerSlug: string): Promise<ApiResult<PlayerCareer>> {
  "use cache"
  cacheLife("reference")
  cacheTag(playerTag(playerSlug))

  const result = await pandaList(
    `/players/${encodeURIComponent(playerSlug)}/tournaments`,
    stageSchema,
    { "page[size]": HISTORY_SIZE, sort: "-begin_at" },
  )

  if (!result.ok) return ok(EMPTY_CAREER)

  const bySerie = new Map<number, CareerEvent>()

  for (const stage of result.data) {
    if (stage.serie === null) continue

    const from = Date.parse(stage.begin_at ?? "")

    if (!Number.isFinite(from)) continue
    if (bySerie.has(stage.serie.id)) continue

    const league = stage.league?.name ?? ""
    const serie = stage.serie.full_name ?? stage.serie.name ?? ""
    const name = serie.toLowerCase().startsWith(league.toLowerCase())
      ? serie
      : `${league} ${serie}`.trim()
    const startsAt = new Date(from)

    bySerie.set(stage.serie.id, {
      id: String(stage.serie.id),
      name: name.length > 0 ? name : stage.name,
      slug: stage.serie.slug,
      logo: stage.league?.image_url ?? null,
      tier: toTier(stage.tier),
      year: stage.serie.year ?? startsAt.getUTCFullYear(),
      startsAt,
    })
  }

  const events = [...bySerie.values()].sort(
    (left, right) => right.startsAt.getTime() - left.startsAt.getTime(),
  )

  const earliest = events.at(-1)

  return ok({
    events,
    eventCount: events.length,
    tierOneCount: events.filter((event) => event.tier === "s" || event.tier === "a").length,
    firstSeen: earliest === undefined ? null : earliest.startsAt,
  })
}
