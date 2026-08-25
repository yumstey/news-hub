import { cacheLife, cacheTag } from "next/cache"

import { ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { CS2_MODULE, rankingTag } from "@/shared/config"

import { normaliseName } from "./resolveTeamRefs"
import { fetchSnapshot, listSnapshots } from "./valveStandings"
import type { ValveSnapshot } from "./valveStandings"

const WINDOW = 12

export type RankPoint = {
  date: Date
  rank: number
  points: number
}

export type RankingHistory = {
  dates: Date[]
  byTeam: Map<string, RankPoint[]>
}

export const EMPTY_HISTORY: RankingHistory = { dates: [], byTeam: new Map() }

function snapshotDate(file: string): Date | null {
  const match = /(\d{4})_(\d{2})_(\d{2})/.exec(file)

  if (match === null) return null

  const [, year, month, day] = match
  const time = Date.UTC(Number(year), Number(month) - 1, Number(day))

  return Number.isFinite(time) ? new Date(time) : null
}

export async function getRankingHistory(): Promise<ApiResult<RankingHistory>> {
  "use cache"
  cacheLife("reference")
  cacheTag(rankingTag(CS2_MODULE))

  const year = new Date().getUTCFullYear()
  const [current, previous] = await Promise.all([
    listSnapshots(year),
    listSnapshots(year - 1),
  ])

  const all: ValveSnapshot[] = [
    ...previous.map((file) => ({ year: year - 1, file })),
    ...current.map((file) => ({ year, file })),
  ]

  const window = all.slice(-WINDOW)

  if (window.length === 0) return ok(EMPTY_HISTORY)

  const loaded = await Promise.all(window.map(fetchSnapshot))
  const dates: Date[] = []
  const byTeam = new Map<string, RankPoint[]>()

  for (const [index, snapshot] of window.entries()) {
    const date = snapshotDate(snapshot.file)
    const result = loaded[index]

    if (date === null || result === undefined || !result.ok) continue

    dates.push(date)

    for (const row of result.data) {
      const key = normaliseName(row.name)
      const points = byTeam.get(key) ?? []

      points.push({ date, rank: row.rank, points: row.points })
      byTeam.set(key, points)
    }
  }

  return ok({ dates, byTeam })
}

export async function getTeamRankHistory(teamName: string): Promise<ApiResult<RankPoint[]>> {
  const history = await getRankingHistory()

  if (!history.ok) return ok([])

  return ok(history.data.byTeam.get(normaliseName(teamName)) ?? [])
}

export type RankMover = {
  name: string
  key: string
  from: number
  to: number
  delta: number
}

export async function getRankMovers(limit = 5): Promise<ApiResult<RankMover[]>> {
  const history = await getRankingHistory()

  if (!history.ok || history.data.dates.length < 2) return ok([])

  const [previousDate, latestDate] = [
    history.data.dates.at(-2),
    history.data.dates.at(-1),
  ]

  if (previousDate === undefined || latestDate === undefined) return ok([])

  const movers: RankMover[] = []

  for (const [key, points] of history.data.byTeam) {
    const from = points.find((point) => point.date.getTime() === previousDate.getTime())
    const to = points.find((point) => point.date.getTime() === latestDate.getTime())

    if (from === undefined || to === undefined) continue
    if (to.rank > 40) continue

    const delta = from.rank - to.rank

    if (delta === 0) continue

    movers.push({ name: key, key, from: from.rank, to: to.rank, delta })
  }

  return ok(
    movers.sort((left, right) => Math.abs(right.delta) - Math.abs(left.delta)).slice(0, limit),
  )
}
