import { cacheTag } from "next/cache"
import { z } from "zod"

import { fetchJson, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { tournamentTag } from "@/shared/config"
import { cacheFor } from "@/shared/lib/cache"

const API = "https://api.bo3.gg/api/v1"
/** Фильтры bo3 работают только с префиксом таблицы, иначе молча возвращают всё. */
const NAME_FILTER = "filter%5Btournaments.name%5D"
const TEAM_FILTER = "filter%5Bteams.id%5D%5Bin%5D"

export type EventPlacement = {
  /** «1st», «3-4th» — как их печатает источник. */
  place: string
  prizeUsd: number | null
  team: string
}

const tournamentSchema = z.object({
  results: z
    .array(
      z.object({
        id: z.number().int(),
        slug: z.string(),
        name: z.string(),
        start_date: z.string().nullable().default(null),
      }),
    )
    .default([]),
})

const detailSchema = z.object({
  slug: z.string(),
  teams_has_tournaments: z
    .array(
      z.object({
        team_id: z.number().int().nullable().default(null),
        place: z.string().nullable().default(null),
        money: z.number().nullable().default(null),
      }),
    )
    .default([]),
})

const teamsSchema = z.object({
  results: z
    .array(
      z.object({
        id: z.number().int(),
        name: z.string(),
      }),
    )
    .default([]),
})

/** «3-4th» → 3: по первому числу строим порядок мест. */
function placeOrder(place: string | null): number {
  const parsed = Number.parseInt(place ?? "", 10)

  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER
}

function sameEvent(candidate: string | null, startsAtIso: string): boolean {
  const left = Date.parse(candidate ?? "")
  const right = Date.parse(startsAtIso)

  if (!Number.isFinite(left) || !Number.isFinite(right)) return true

  // Один турнир, но разные источники: расхождение в пару недель допустимо.
  return Math.abs(left - right) < 21 * 24 * 60 * 60 * 1000
}

/**
 * Итоговые места и призовые по командам. Liquipedia публикует суммы без
 * привязки к командам, PandaScore — таблицу без денег; открытый API bo3.gg
 * отдаёт и то, и другое. Источник неофициальный: при сбое блок просто исчезнет.
 */
export async function getEventPlacements(
  tournamentId: string,
  name: string,
  startsAtIso: string,
): Promise<ApiResult<EventPlacement[]>> {
  "use cache"
  cacheTag(tournamentTag(tournamentId))

  const cleaned = name.trim()

  if (cleaned.length === 0) {
    cacheFor("reference", true)

    return ok([])
  }

  const search = await fetchJson(
    `${API}/tournaments?${NAME_FILTER}%5Beq%5D=${encodeURIComponent(cleaned)}&page%5Blimit%5D=5`,
    tournamentSchema,
  )

  if (!search.ok) {
    cacheFor("reference", false)

    return ok([])
  }

  const found = search.data.results.find((entry) => sameEvent(entry.start_date, startsAtIso))

  if (found === undefined) {
    cacheFor("reference", true)

    return ok([])
  }

  const detail = await fetchJson(`${API}/tournaments/${encodeURIComponent(found.slug)}`, detailSchema)

  if (!detail.ok) {
    cacheFor("reference", false)

    return ok([])
  }

  const entries = detail.data.teams_has_tournaments.filter(
    (entry) => entry.team_id !== null && entry.place !== null,
  )

  if (entries.length === 0) {
    cacheFor("reference", true)

    return ok([])
  }

  const ids = [...new Set(entries.map((entry) => entry.team_id))].join(",")
  const teams = await fetchJson(
    `${API}/teams?${TEAM_FILTER}=${encodeURIComponent(ids)}&page%5Blimit%5D=100`,
    teamsSchema,
  )

  cacheFor("reference", teams.ok)

  const names = new Map(
    (teams.ok ? teams.data.results : []).map((team) => [team.id, team.name]),
  )

  return ok(
    entries
      .flatMap((entry): EventPlacement[] => {
        const team = entry.team_id === null ? undefined : names.get(entry.team_id)

        if (team === undefined || entry.place === null) return []

        return [
          {
            place: entry.place,
            prizeUsd: entry.money === null || entry.money === 0 ? null : entry.money,
            team,
          },
        ]
      })
      .sort((left, right) => placeOrder(left.place) - placeOrder(right.place)),
  )
}
