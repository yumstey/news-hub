import { z } from "zod"

import { fail, fetchJson, fetchText, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"

const REPO = "ValveSoftware/counter-strike_regional_standings"
const CONTENTS = `https://api.github.com/repos/${REPO}/contents/live`
const RAW = `https://raw.githubusercontent.com/${REPO}/main/live`

const STANDINGS_ROW = /^\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|/

const contentsSchema = z.array(z.object({ name: z.string(), type: z.string() }))

export type ValveStanding = {
  rank: number
  points: number
  name: string
  roster: string[]
}

export function parseStandings(markdown: string): ValveStanding[] {
  const rows: ValveStanding[] = []

  for (const line of markdown.split("\n")) {
    const match = STANDINGS_ROW.exec(line)

    if (match === null) continue

    const [, rank, points, name, roster] = match

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
    })
  }

  return rows
}

export async function listSnapshots(year: number): Promise<string[]> {
  const result = await fetchJson(`${CONTENTS}/${year}`, contentsSchema)

  if (!result.ok) return []

  return result.data
    .filter((entry) => entry.type === "file" && entry.name.startsWith("standings_global_"))
    .map((entry) => entry.name)
    .sort()
}

export type ValveSnapshot = {
  year: number
  file: string
}

export async function latestSnapshots(now: Date): Promise<ValveSnapshot[]> {
  const year = now.getUTCFullYear()
  const thisYear = await listSnapshots(year)

  if (thisYear.length >= 2) {
    return thisYear.slice(-2).reverse().map((file) => ({ year, file }))
  }

  const previous = await listSnapshots(year - 1)
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
