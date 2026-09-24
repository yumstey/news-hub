import { z } from "zod"

import { fail, fetchJson, fetchText, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"

const REPO = "ValveSoftware/counter-strike_regional_standings"
const CONTENTS = `https://api.github.com/repos/${REPO}/contents/live`
const RAW = `https://raw.githubusercontent.com/${REPO}/main/live`

const STANDINGS_ROW =
  /^\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|\s*(?:\[details\]\(([^)]+)\))?\s*\|/

const contentsSchema = z.array(z.object({ name: z.string(), type: z.string() }))

/** Valve публикует общий зачёт и три региональных. */
export const VALVE_REGIONS = ["global", "europe", "americas", "asia"] as const
export type ValveRegion = (typeof VALVE_REGIONS)[number]

export const VALVE_REGION_LABEL: Record<ValveRegion, string> = {
  global: "Мир",
  europe: "Европа",
  americas: "Америка",
  asia: "Азия",
}

export type ValveStanding = {
  rank: number
  points: number
  name: string
  roster: string[]
  /** Путь к разбору очков команды внутри репозитория. */
  details: string | null
}

export function parseStandings(markdown: string): ValveStanding[] {
  const rows: ValveStanding[] = []

  for (const line of markdown.split("\n")) {
    const match = STANDINGS_ROW.exec(line)

    if (match === null) continue

    const [, rank, points, name, roster, details] = match

    if (rank === undefined || points === undefined || name === undefined) continue

    rows.push({
      rank: Number(rank),
      points: Number(points),
      name: name.trim(),
      roster:
        roster === undefined
          ? []
          : roster
              .split(",")
              .map((entry) => entry.trim())
              .filter((entry) => entry.length > 0),
      details: details === undefined ? null : details.trim(),
    })
  }

  return rows
}

export async function listSnapshots(year: number, region: ValveRegion = "global"): Promise<string[]> {
  const result = await fetchJson(`${CONTENTS}/${year}`, contentsSchema)

  if (!result.ok) return []

  return result.data
    .filter((entry) => entry.type === "file" && entry.name.startsWith(`standings_${region}_`))
    .map((entry) => entry.name)
    .sort()
}

export type ValveSnapshot = {
  year: number
  file: string
}

/** Дата снимка из имени файла: standings_global_2026_09_07.md. */
export function snapshotDate(snapshot: ValveSnapshot): Date | null {
  const match = /(\d{4})_(\d{2})_(\d{2})/.exec(snapshot.file)

  if (match === null) return null

  const time = Date.parse(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`)

  return Number.isFinite(time) ? new Date(time) : null
}

export async function latestSnapshots(
  now: Date,
  region: ValveRegion = "global",
): Promise<ValveSnapshot[]> {
  const year = now.getUTCFullYear()
  const thisYear = await listSnapshots(year, region)

  if (thisYear.length >= 2) {
    return thisYear.slice(-2).reverse().map((file) => ({ year, file }))
  }

  const previous = await listSnapshots(year - 1, region)
  const combined = [
    ...previous.map((file) => ({ year: year - 1, file })),
    ...thisYear.map((file) => ({ year, file })),
  ]

  return combined.slice(-2).reverse()
}

export async function fetchSnapshot(
  snapshot: ValveSnapshot,
): Promise<ApiResult<ValveStanding[]>> {
  const result = await fetchText(`${RAW}/${snapshot.year}/${snapshot.file}`)

  if (!result.ok) return fail(result.error)

  return ok(parseStandings(result.data))
}

/** Из чего сложились очки команды — Valve публикует разбор по каждому ростеру. */
export type ValveRankDetails = {
  region: string | null
  regionalRank: number | null
  /** Итоговое значение рейтинга с десятыми. */
  rankValue: number | null
  factors: { label: string; value: number }[]
  /** Ссылка на разбор в репозитории Valve. */
  source: string
}

const FACTOR_LABELS: Record<string, string> = {
  "bounty offered": "Ценность скальпа",
  "bounty collected": "Победы над сильными",
  "opponent network": "Сеть соперников",
  "lan wins": "Победы на LAN",
}

export function parseRankDetails(markdown: string, source: string): ValveRankDetails {
  const region = /Region:\s*\[([^\]]+)\]/i.exec(markdown)?.[1]?.trim() ?? null
  const regional = /Regional Rank:\s*\[(\d+)\]/i.exec(markdown)?.[1]
  const value = /Final Rank Value:\s*([\d.]+)/i.exec(markdown)?.[1]
  const factors: { label: string; value: number }[] = []

  for (const match of markdown.matchAll(/^-\s*([A-Za-z ]+):\s*([\d.]+)/gm)) {
    const key = (match[1] ?? "").trim().toLowerCase()
    const label = FACTOR_LABELS[key]
    const parsed = Number(match[2])

    if (label === undefined || !Number.isFinite(parsed)) continue
    if (factors.some((factor) => factor.label === label)) continue

    factors.push({ label, value: parsed })
  }

  return {
    region,
    regionalRank: regional === undefined ? null : Number(regional),
    rankValue: value === undefined ? null : Number(value),
    factors,
    source,
  }
}

/** Разбор очков конкретной команды: путь берётся из строки таблицы. */
export async function fetchRankDetails(
  snapshot: ValveSnapshot,
  details: string,
): Promise<ApiResult<ValveRankDetails>> {
  const url = `${RAW}/${snapshot.year}/${details.replace(/^\.\//, "")}`
  const result = await fetchText(url)

  if (!result.ok) return fail(result.error)

  return ok(parseRankDetails(result.data, `https://github.com/${REPO}/blob/main/live/${snapshot.year}/${details}`))
}
