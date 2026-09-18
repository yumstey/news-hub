import { cacheTag } from "next/cache"
import { z } from "zod"

import { ok, pandaList } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { playerTag } from "@/shared/config"
import { cacheFor } from "@/shared/lib/cache"

import { pandaTeamRefSchema, toTeamRef } from "@/entities/team/@x/player"
import type { PandaTeamRefWire, TeamRef } from "@/entities/team/@x/player"

const PAGE_SIZE = 100
/** Четыре страницы — это примерно шесть лет карьеры активного игрока. */
const PAGES = 4
const FORM_SIZE = 6
const RIVAL_LIMIT = 6

const recordMatchSchema = z.object({
  id: z.number().int(),
  begin_at: z.string().nullable().default(null),
  scheduled_at: z.string().nullable().default(null),
  winner_id: z.number().int().nullable().default(null),
  opponents: z.array(z.object({ opponent: pandaTeamRefSchema })).default([]),
  results: z
    .array(
      z.object({
        team_id: z.number().int().nullable().default(null),
        score: z.number().int().default(0),
      }),
    )
    .default([]),
})

type RecordMatchWire = z.infer<typeof recordMatchSchema>

export type PlayerOutcome = "win" | "loss"

export type PlayerSeason = {
  year: number
  wins: number
  losses: number
}

export type PlayerRival = {
  team: TeamRef
  wins: number
  losses: number
}

export type PlayerStreak = {
  kind: PlayerOutcome
  length: number
}

export type PlayerRecord = {
  matches: number
  wins: number
  losses: number
  winrate: number
  mapsWon: number
  mapsLost: number
  /** Последние матчи, свежие первыми. */
  form: PlayerOutcome[]
  streak: PlayerStreak | null
  seasons: PlayerSeason[]
  rivals: PlayerRival[]
  /** Команды, за которые игрок выходил в выборке, от самой частой к редкой. */
  teams: TeamRef[]
  teamIds: string[]
  since: Date | null
}

export const EMPTY_RECORD: PlayerRecord = {
  matches: 0,
  wins: 0,
  losses: 0,
  winrate: 0,
  mapsWon: 0,
  mapsLost: 0,
  form: [],
  streak: null,
  seasons: [],
  rivals: [],
  teams: [],
  teamIds: [],
  since: null,
}

function playedAt(wire: RecordMatchWire): number {
  const raw = wire.begin_at ?? wire.scheduled_at
  const time = raw === null ? Number.NaN : Date.parse(raw)

  return Number.isFinite(time) ? time : Number.NaN
}

/**
 * PandaScore не говорит, за какую из двух команд играл игрок. Но его команда
 * есть в каждом его матче, а соперники — лишь в части, поэтому команды
 * восстанавливаются жадным покрытием выборки: на каждом шаге берётся клуб,
 * встречающийся чаще всего среди ещё не разобранных матчей.
 */
function resolveTeams(matches: RecordMatchWire[], seedId: number | null): number[] {
  const uncovered = new Set(matches.keys())
  const resolved: number[] = []

  const cover = (teamId: number): void => {
    resolved.push(teamId)

    for (const index of [...uncovered]) {
      const match = matches[index]

      if (match === undefined) continue
      if (match.opponents.some((entry) => entry.opponent.id === teamId)) uncovered.delete(index)
    }
  }

  if (seedId !== null) cover(seedId)

  while (uncovered.size > 0) {
    const counts = new Map<number, number>()

    for (const index of uncovered) {
      for (const entry of matches[index]?.opponents ?? []) {
        counts.set(entry.opponent.id, (counts.get(entry.opponent.id) ?? 0) + 1)
      }
    }

    const best = [...counts.entries()].sort(([, left], [, right]) => right - left)[0]

    if (best === undefined) break

    cover(best[0])
  }

  return resolved
}

function scoreOf(wire: RecordMatchWire, teamId: number): number {
  return wire.results.find((entry) => entry.team_id === teamId)?.score ?? 0
}

export async function getPlayerRecord(
  playerSlug: string,
  currentTeamId: string | null,
): Promise<ApiResult<PlayerRecord>> {
  "use cache"
  cacheTag(playerTag(playerSlug))

  const pages = await Promise.all(
    Array.from({ length: PAGES }, (_, index) =>
      pandaList(`/players/${encodeURIComponent(playerSlug)}/matches`, recordMatchSchema, {
        "page[size]": PAGE_SIZE,
        "page[number]": index + 1,
        "filter[status]": "finished",
        sort: "-begin_at",
      }),
    ),
  )

  cacheFor("reference", pages.every((page) => page.ok))

  if (pages[0] === undefined || !pages[0].ok) return ok(EMPTY_RECORD)

  const seen = new Set<number>()
  const played = pages
    .flatMap((page) => (page.ok ? page.data : []))
    .filter((wire) => {
      if (wire.opponents.length !== 2 || wire.winner_id === null) return false
      if (seen.has(wire.id)) return false

      seen.add(wire.id)

      return true
    })
    .sort((left, right) => playedAt(right) - playedAt(left))

  if (played.length === 0) return ok(EMPTY_RECORD)

  const seed = Number(currentTeamId)
  const ownIds = new Set(resolveTeams(played, Number.isInteger(seed) ? seed : null))

  const seasons = new Map<number, PlayerSeason>()
  const rivals = new Map<number, { team: PandaTeamRefWire; wins: number; losses: number }>()
  const own = new Map<number, { team: PandaTeamRefWire; count: number }>()
  const form: PlayerOutcome[] = []

  let wins = 0
  let losses = 0
  let mapsWon = 0
  let mapsLost = 0
  let since: number | null = null
  // Серия считается от самого свежего матча и обрывается на первом другом исходе.
  let streak: PlayerStreak | null = null
  let streakOpen = true

  for (const wire of played) {
    const mine = wire.opponents.find((entry) => ownIds.has(entry.opponent.id))?.opponent
    const rival = wire.opponents.find((entry) => entry.opponent.id !== mine?.id)?.opponent

    if (mine === undefined || rival === undefined) continue

    const outcome: PlayerOutcome = wire.winner_id === mine.id ? "win" : "loss"
    const time = playedAt(wire)

    if (outcome === "win") wins += 1
    else losses += 1

    mapsWon += scoreOf(wire, mine.id)
    mapsLost += scoreOf(wire, rival.id)

    if (form.length < FORM_SIZE) form.push(outcome)

    if (streakOpen) {
      if (streak === null) streak = { kind: outcome, length: 1 }
      else if (streak.kind === outcome) streak.length += 1
      else streakOpen = false
    }

    const ownEntry = own.get(mine.id) ?? { team: mine, count: 0 }

    ownEntry.count += 1
    own.set(mine.id, ownEntry)

    const rivalEntry = rivals.get(rival.id) ?? { team: rival, wins: 0, losses: 0 }

    if (outcome === "win") rivalEntry.wins += 1
    else rivalEntry.losses += 1

    rivals.set(rival.id, rivalEntry)

    if (Number.isNaN(time)) continue

    since = since === null ? time : Math.min(since, time)

    const year = new Date(time).getUTCFullYear()
    const season = seasons.get(year) ?? { year, wins: 0, losses: 0 }

    if (outcome === "win") season.wins += 1
    else season.losses += 1

    seasons.set(year, season)
  }

  const matches = wins + losses

  return ok({
    matches,
    wins,
    losses,
    winrate: matches === 0 ? 0 : Math.round((wins / matches) * 100),
    mapsWon,
    mapsLost,
    form,
    streak,
    seasons: [...seasons.values()].sort((left, right) => right.year - left.year),
    rivals: [...rivals.values()]
      .sort(
        (left, right) =>
          right.wins + right.losses - (left.wins + left.losses) ||
          right.wins - left.wins,
      )
      .slice(0, RIVAL_LIMIT)
      .map((entry) => ({ team: toTeamRef(entry.team), wins: entry.wins, losses: entry.losses })),
    teams: [...own.values()]
      .sort((left, right) => right.count - left.count)
      .map((entry) => toTeamRef(entry.team)),
    teamIds: [...own.keys()].map(String),
    since: since === null ? null : new Date(since),
  })
}
