import { toTeamRef } from "@/entities/team/@x/match"
import { tournamentIdSchema, tournamentTierSchema } from "@/entities/tournament/@x/match"
import type { TournamentRef } from "@/entities/tournament/@x/match"
import { toSlug } from "@/shared/model"

import { matchIdSchema } from "../model/match"
import type {
  Match,
  MatchFormat,
  MatchGame,
  MatchSide,
  MatchStatus,
  StreamLink,
} from "../model/match"
import type { PandaMatchWire } from "./pandaMatchSchema"

const STATUS_MAP: Record<PandaMatchWire["status"], MatchStatus> = {
  not_started: "scheduled",
  postponed: "scheduled",
  running: "live",
  finished: "finished",
  canceled: "cancelled",
}

const FORMAT_MAP: Record<number, MatchFormat> = { 1: "bo1", 3: "bo3", 5: "bo5" }

const FALLBACK_TOURNAMENT: TournamentRef = {
  id: tournamentIdSchema.parse("unknown"),
  slug: toSlug("unknown"),
  name: "Без турнира",
  tier: "c",
  logo: null,
}

function toFormat(numberOfGames: number): MatchFormat {
  const known = FORMAT_MAP[numberOfGames]

  if (known !== undefined) return known

  return numberOfGames >= 5 ? "bo5" : numberOfGames >= 3 ? "bo3" : "bo1"
}

function toTier(tier: string | null): TournamentRef["tier"] {
  const parsed = tournamentTierSchema.safeParse(tier?.toLowerCase())

  return parsed.success ? parsed.data : "c"
}

function toTournamentRef(wire: PandaMatchWire): TournamentRef {
  const stage = wire.tournament

  if (stage === null) return FALLBACK_TOURNAMENT

  const league = wire.league?.name ?? ""
  const serie = wire.serie?.full_name ?? ""
  const event = serie.toLowerCase().startsWith(league.toLowerCase())
    ? serie
    : `${league} ${serie}`.trim()

  return {
    id: tournamentIdSchema.parse(String(stage.id)),
    slug: toSlug(stage.slug),
    name: event.length > 0 ? event : stage.name,
    tier: toTier(stage.tier),
    logo: wire.league?.image_url ?? null,
  }
}

function platformOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").split(".")[0] ?? "stream"
  } catch {
    return "stream"
  }
}

function toStreams(wire: PandaMatchWire["streams_list"]): StreamLink[] {
  return wire.flatMap((entry) => {
    const url = entry.raw_url ?? entry.embed_url

    if (url === null) return []

    return [
      {
        platform: platformOf(url),
        url,
        language: entry.language.length > 0 ? entry.language.toUpperCase() : "—",
        official: entry.official,
        viewers: 0,
      },
    ]
  })
}

export function toMatch(wire: PandaMatchWire): Match | null {
  const [firstOpponent, secondOpponent] = wire.opponents

  if (firstOpponent === undefined || secondOpponent === undefined) return null

  const startsAtRaw = wire.begin_at ?? wire.scheduled_at

  if (startsAtRaw === null) return null

  const startsAt = new Date(startsAtRaw)

  if (Number.isNaN(startsAt.getTime())) return null

  const status = STATUS_MAP[wire.status]
  const scoreOf = (teamId: number): number =>
    wire.results.find((result) => result.team_id === teamId)?.score ?? 0

  const toSide = (opponent: typeof firstOpponent): MatchSide => ({
    team: toTeamRef(opponent.opponent),
    score: scoreOf(opponent.opponent.id),
    isWinner: wire.winner_id !== null && wire.winner_id === opponent.opponent.id,
  })

  const first = toSide(firstOpponent)
  const second = toSide(secondOpponent)

  return {
    id: matchIdSchema.parse(String(wire.id)),
    tournament: toTournamentRef(wire),
    stage: wire.tournament?.name ?? "—",
    bracket: null,
    status,
    format: toFormat(wire.number_of_games),
    startsAt,
    teams: [first, second],
    score:
      status === "scheduled" || status === "cancelled"
        ? null
        : { side1: first.score, side2: second.score },
    maps: [],
    games: wire.games
      .slice()
      .sort((left, right) => left.position - right.position)
      .map(
        (game): MatchGame => ({
          position: game.position,
          winnerTeamId: game.winner?.id === null || game.winner === null ? null : String(game.winner.id),
          lengthSeconds: game.length,
          finished: game.finished,
        }),
      ),
    streams: toStreams(wire.streams_list),
    lineups: [[], []],
    statistics: null,
  }
}

/**
 * PandaScore сортирует по begin_at, а у части матчей это поле пустое — такие
 * записи он отдаёт первыми, и в «последних результатах» оказывались матчи
 * трёхмесячной давности. Поэтому порядок задаём сами, по времени начала.
 */
export function toMatchList(
  wires: readonly PandaMatchWire[],
  order: "asc" | "desc" = "asc",
): Match[] {
  const matches = wires.flatMap((wire) => {
    const match = toMatch(wire)

    return match === null ? [] : [match]
  })

  return matches.sort(
    (left, right) =>
      (left.startsAt.getTime() - right.startsAt.getTime()) * (order === "asc" ? 1 : -1),
  )
}
