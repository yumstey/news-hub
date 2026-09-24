import { cacheTag } from "next/cache"

import { apiError, fail, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { rankingTag } from "@/shared/config"
import { cacheFor } from "@/shared/lib/cache"

import type { TeamRef } from "../model/team"
import { normaliseName, resolveTeamRefs } from "./resolveTeamRefs"
import {
  fetchRankDetails,
  fetchSnapshot,
  latestSnapshots,
  snapshotDate,
} from "./valveStandings"
import type { ValveRankDetails, ValveRegion } from "./valveStandings"

export const RANKING_PAGE_SIZE = 10

export type RankingEntry = {
  rank: number
  points: number
  /** Насколько команда поднялась с прошлого снимка; null — её там не было. */
  change: number | null
  name: string
  roster: string[]
  /** Путь к разбору очков — им догружается раскрытая строка. */
  details: string | null
  /** Команда в нашей базе: без неё строка показывается без логотипа и ссылки. */
  team: TeamRef | null
}

export type RankingBoard = {
  region: ValveRegion
  updatedAt: Date | null
  total: number
  offset: number
  rows: RankingEntry[]
}

/**
 * Страница рейтинга Valve. Команды подтягиваются из PandaScore пачкой, но
 * строка остаётся в списке и без совпадения — места в рейтинге не пропускаются.
 */
export async function getRankingBoard(
  region: ValveRegion = "global",
  offset = 0,
  limit: number = RANKING_PAGE_SIZE,
): Promise<ApiResult<RankingBoard>> {
  "use cache"
  cacheTag(rankingTag(region))

  const [current, previous] = await latestSnapshots(new Date(), region)

  if (current === undefined) {
    cacheFor("reference", false)

    return fail(apiError("not-found", "Рейтинг Valve сейчас недоступен", 404))
  }

  const snapshot = await fetchSnapshot(current)

  if (!snapshot.ok) {
    cacheFor("reference", false)

    return fail(snapshot.error)
  }

  const previousRanks = new Map<string, number>()

  if (previous !== undefined) {
    const earlier = await fetchSnapshot(previous)

    if (earlier.ok) {
      for (const row of earlier.data) previousRanks.set(normaliseName(row.name), row.rank)
    }
  }

  const start = Math.max(0, Math.trunc(offset))
  const page = snapshot.data.slice(start, start + Math.max(1, Math.trunc(limit)))
  const refs = await resolveTeamRefs(page.map((row) => row.name))

  cacheFor("reference", true)

  return ok({
    region,
    updatedAt: snapshotDate(current),
    total: snapshot.data.length,
    offset: start,
    rows: page.map((row): RankingEntry => {
      const key = normaliseName(row.name)
      const before = previousRanks.get(key)

      return {
        rank: row.rank,
        points: row.points,
        change: before === undefined ? null : before - row.rank,
        name: row.name,
        roster: row.roster,
        details: row.details,
        team: refs.get(key) ?? null,
      }
    }),
  })
}

/** Разбор очков команды: подгружается, когда строку рейтинга раскрывают. */
export async function getRankDetails(
  region: ValveRegion,
  details: string,
): Promise<ApiResult<ValveRankDetails>> {
  "use cache"
  cacheTag(rankingTag(region))

  const [current] = await latestSnapshots(new Date(), region)

  if (current === undefined) {
    cacheFor("reference", false)

    return fail(apiError("not-found", "Разбор очков недоступен", 404))
  }

  const result = await fetchRankDetails(current, details)

  cacheFor("reference", result.ok)

  return result
}
