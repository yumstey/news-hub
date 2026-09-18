import { cacheLife, cacheTag } from "next/cache"
import { z } from "zod"

import { ok, pandaList } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { tournamentTag } from "@/shared/config"

import type { TournamentStatus } from "../model/tournament"

import { pandaTeamRefSchema, toTeamRef } from "@/entities/team/@x/tournament"
import type { TeamRef } from "@/entities/team/@x/tournament"

const bracketMatchSchema = z.object({
  id: z.number().int(),
  name: z.string().default(""),
  status: z.string().default("not_started"),
  scheduled_at: z.string().nullable().default(null),
  begin_at: z.string().nullable().default(null),
  number_of_games: z.number().int().default(1),
  winner_id: z.number().int().nullable().default(null),
  results: z
    .array(
      z.object({
        team_id: z.number().int().nullable().default(null),
        score: z.number().int().default(0),
      }),
    )
    .default([]),
  opponents: z.array(z.object({ opponent: pandaTeamRefSchema })).default([]),
  previous_matches: z
    .array(z.object({ match_id: z.number().int(), type: z.string().default("winner") }))
    .default([]),
})

type BracketMatchWire = z.infer<typeof bracketMatchSchema>

export type BracketSide = "upper" | "lower" | "final"

export type BracketFeedKind = "winner" | "loser"

export type BracketSeat = {
  team: TeamRef | null
  score: number
  isWinner: boolean
}

/** Откуда команда пришла в матч: победителем или проигравшим предыдущего. */
export type BracketFeed = {
  fromId: string
  kind: BracketFeedKind
}

export type BracketMatch = {
  id: string
  round: string
  format: string
  startsAt: Date | null
  status: "scheduled" | "live" | "finished"
  side: BracketSide
  /** Колонка сетки: матчи одного раунда стоят на одной вертикали. */
  column: number
  seats: [BracketSeat, BracketSeat]
  feeds: BracketFeed[]
}

export type TournamentBracket = {
  stageId: string
  stageName: string
  stageStatus: TournamentStatus
  sides: BracketSide[]
  matches: BracketMatch[]
}

function sideOf(name: string): BracketSide {
  const lower = name.toLowerCase()

  if (lower.includes("grand final")) return "final"
  if (lower.includes("lower") || lower.includes("losers")) return "lower"

  return "upper"
}

function headOf(name: string): string {
  return (name.split(":")[0] ?? name).trim()
}

function roundLabel(name: string): string {
  const head = headOf(name)
  const lower = head.toLowerCase()

  if (lower.includes("grand final")) return "Гранд-финал"
  if (lower.includes("third place") || lower.includes("3rd place")) return "Матч за 3-е место"

  const body = lower
    .replace(/\b(upper|lower|winners?|losers?)\b/g, "")
    .replace(/\bbracket\b/g, "")
    .trim()

  if (/semi\s*-?\s*final/.test(body)) return "Полуфинал"
  if (/quarter\s*-?\s*final/.test(body)) return "Четвертьфинал"

  const roundOf = /round of (\d+)/.exec(body)

  if (roundOf?.[1] !== undefined) return `1/${Number(roundOf[1]) / 2} финала`

  const numbered = /round\s*(\d+)/.exec(body)

  if (numbered?.[1] !== undefined) return `Раунд ${numbered[1]}`

  if (body.includes("final")) return "Финал"

  return head.replace(/\s+\d+$/, "").trim()
}

function startedAt(wire: BracketMatchWire): number {
  const raw = wire.begin_at ?? wire.scheduled_at
  const time = raw === null ? Number.NaN : Date.parse(raw)

  return Number.isFinite(time) ? time : Number.NaN
}

function depthOf(
  match: BracketMatchWire,
  byId: Map<number, BracketMatchWire>,
  cache: Map<number, number>,
): number {
  const cached = cache.get(match.id)

  if (cached !== undefined) return cached

  cache.set(match.id, 0)

  const parents = match.previous_matches
    .map((entry) => byId.get(entry.match_id))
    .filter((entry): entry is BracketMatchWire => entry !== undefined)

  const depth =
    parents.length === 0 ? 0 : Math.max(...parents.map((p) => depthOf(p, byId, cache))) + 1

  cache.set(match.id, depth)

  return depth
}

/**
 * Запасной расчёт колонок, когда PandaScore не отдаёт связи между матчами:
 * раунды каждой сетки выстраиваются по времени первого матча.
 */
function columnsByRound(matches: BracketMatchWire[]): Map<number, number> {
  const columns = new Map<number, number>()

  for (const side of ["upper", "lower", "final"] as const) {
    const members = matches.filter((match) => sideOf(match.name) === side)
    const rounds = new Map<string, { time: number; id: number }>()

    for (const match of members) {
      const key = headOf(match.name).toLowerCase()
      const time = startedAt(match)
      const current = rounds.get(key)

      rounds.set(key, {
        time: Math.min(
          current?.time ?? Number.POSITIVE_INFINITY,
          Number.isNaN(time) ? Number.POSITIVE_INFINITY : time,
        ),
        id: Math.min(current?.id ?? Number.POSITIVE_INFINITY, match.id),
      })
    }

    const order = [...rounds.entries()]
      .sort(([, left], [, right]) => left.time - right.time || left.id - right.id)
      .map(([key]) => key)

    for (const match of members) {
      columns.set(match.id, order.indexOf(headOf(match.name).toLowerCase()))
    }
  }

  return columns
}

function toSeat(wire: BracketMatchWire, index: number): BracketSeat {
  const opponent = wire.opponents[index]

  if (opponent === undefined) return { team: null, score: 0, isWinner: false }

  const team = toTeamRef(opponent.opponent)
  const score = wire.results.find((r) => String(r.team_id ?? "") === team.id)?.score ?? 0

  return { team, score, isWinner: String(wire.winner_id ?? "") === team.id }
}

function toStatus(raw: string): BracketMatch["status"] {
  if (raw === "running") return "live"
  if (raw === "finished") return "finished"

  return "scheduled"
}

export async function getTournamentBracket(
  stageId: string,
  stageName: string,
  stageStatus: TournamentStatus,
): Promise<ApiResult<TournamentBracket | null>> {
  "use cache"
  cacheLife("schedule")
  cacheTag(tournamentTag(stageId))

  const result = await pandaList(
    `/tournaments/${encodeURIComponent(stageId)}/brackets`,
    bracketMatchSchema,
  )

  if (!result.ok || result.data.length === 0) return ok(null)

  const known = result.data.some((match) => match.opponents.length > 0)

  if (!known) return ok(null)

  const byId = new Map(result.data.map((match) => [match.id, match]))
  const depths = new Map<number, number>()

  for (const wire of result.data) depthOf(wire, byId, depths)

  const linked = result.data.some((match) => match.previous_matches.length > 0)
  const columns = linked ? depths : columnsByRound(result.data)
  const hasLower = result.data.some((match) => sideOf(match.name) === "lower")

  const matches = result.data
    .map((wire): BracketMatch => {
      const rawSide = sideOf(wire.name)
      const time = startedAt(wire)

      return {
        id: String(wire.id),
        round: roundLabel(wire.name),
        format: `BO${wire.number_of_games}`,
        startsAt: Number.isNaN(time) ? null : new Date(time),
        status: toStatus(wire.status),
        // Без нижней сетки гранд-финал — просто продолжение единственного дерева.
        side: rawSide === "final" && !hasLower ? "upper" : rawSide,
        column: columns.get(wire.id) ?? 0,
        seats: [toSeat(wire, 0), toSeat(wire, 1)],
        feeds: wire.previous_matches
          .filter((entry) => byId.has(entry.match_id))
          .map((entry) => ({
            fromId: String(entry.match_id),
            kind: entry.type === "loser" ? "loser" : "winner",
          })),
      }
    })
    .sort((left, right) => left.column - right.column || Number(left.id) - Number(right.id))

  const sides = (["upper", "lower", "final"] as const).filter((side) =>
    matches.some((match) => match.side === side),
  )

  return ok({ stageId, stageName, stageStatus, sides, matches })
}
