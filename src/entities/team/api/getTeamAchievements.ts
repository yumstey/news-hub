import { cacheLife, cacheTag } from "next/cache"

import { ok, pandaList } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { teamTag } from "@/shared/config"

import { pandaStageSchema } from "./pandaTeamTournamentSchema"

const HISTORY_SIZE = 100

export type TeamAchievement = {
  id: string
  name: string
  slug: string
  logo: string | null
  tier: "s" | "a" | "b" | "c"
  won: boolean
  startsAt: Date
  endsAt: Date
}

export type TeamAchievements = {
  titles: number
  tierOneTitles: number
  tournamentsPlayed: number
  items: TeamAchievement[]
}

export const EMPTY_ACHIEVEMENTS: TeamAchievements = {
  titles: 0,
  tierOneTitles: 0,
  tournamentsPlayed: 0,
  items: [],
}

function toTier(raw: string | null): TeamAchievement["tier"] {
  const value = raw?.toLowerCase()

  return value === "s" || value === "a" || value === "b" ? value : "c"
}

export async function getTeamAchievements(
  teamSlug: string,
  teamId: string,
): Promise<ApiResult<TeamAchievements>> {
  "use cache"
  cacheLife("reference")
  cacheTag(teamTag(teamSlug))

  const result = await pandaList(
    `/teams/${encodeURIComponent(teamSlug)}/tournaments`,
    pandaStageSchema,
    { "page[size]": HISTORY_SIZE, sort: "-begin_at" },
  )

  if (!result.ok) return ok(EMPTY_ACHIEVEMENTS)

  const bySerie = new Map<
    number,
    {
      name: string
      slug: string
      tier: string | null
      logo: string | null
      won: boolean
      from: number
      to: number
    }
  >()

  for (const stage of result.data) {
    if (stage.serie === null) continue

    const from = Date.parse(stage.begin_at ?? "")
    const to = Date.parse(stage.end_at ?? stage.begin_at ?? "")

    if (!Number.isFinite(from)) continue

    const league = stage.league?.name ?? ""
    const serie = stage.serie.full_name ?? stage.serie.name ?? ""
    const name = serie.toLowerCase().startsWith(league.toLowerCase())
      ? serie
      : `${league} ${serie}`.trim()

    const existing = bySerie.get(stage.serie.id)
    const won = String(stage.winner_id ?? "") === teamId

    if (existing === undefined) {
      bySerie.set(stage.serie.id, {
        name: name.length > 0 ? name : stage.name,
        slug: stage.serie.slug,
        tier: stage.tier,
        logo: stage.league?.image_url ?? null,
        won,
        from,
        to: Number.isFinite(to) ? to : from,
      })
      continue
    }

    existing.won = existing.won || won
    existing.from = Math.min(existing.from, from)
    existing.to = Math.max(existing.to, Number.isFinite(to) ? to : from)

    if (existing.tier === null) existing.tier = stage.tier
    if (existing.logo === null) existing.logo = stage.league?.image_url ?? null
  }

  const items = [...bySerie.entries()]
    .map(([id, entry]): TeamAchievement => ({
      id: String(id),
      name: entry.name,
      slug: entry.slug,
      logo: entry.logo,
      tier: toTier(entry.tier),
      won: entry.won,
      startsAt: new Date(entry.from),
      endsAt: new Date(entry.to),
    }))
    .sort((left, right) => right.startsAt.getTime() - left.startsAt.getTime())

  const titles = items.filter((item) => item.won)

  return ok({
    titles: titles.length,
    tierOneTitles: titles.filter((item) => item.tier === "s" || item.tier === "a").length,
    tournamentsPlayed: items.length,
    items,
  })
}
