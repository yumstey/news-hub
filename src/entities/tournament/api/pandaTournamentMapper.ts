import { toTeamRef } from "@/entities/team/@x/tournament"
import type { TeamRef } from "@/entities/team/@x/tournament"
import { toCountry, toSlug } from "@/shared/model"

import { tournamentHref } from "../lib/tournamentHref"
import { tournamentIdSchema } from "../model/tournament"
import type {
  StandingRow,
  Tournament,
  TournamentStatus,
  TournamentTier,
} from "../model/tournament"
import type { PandaStageWire, PandaStandingWire } from "./pandaTournamentSchema"

const TIER_ORDER: Record<TournamentTier, number> = { s: 0, a: 1, b: 2, c: 3 }

const CURRENCY_CODE: Record<string, string> = {
  "united states dollar": "USD",
  euro: "EUR",
  "british pound": "GBP",
  "brazilian real": "BRL",
  "chinese yuan": "CNY",
  "russian ruble": "RUB",
  "ukrainian hryvnia": "UAH",
  "polish zloty": "PLN",
  "swedish krona": "SEK",
  "danish krone": "DKK",
  "norwegian krone": "NOK",
  "australian dollar": "AUD",
  "canadian dollar": "CAD",
}

export type PrizePool = {
  amount: number | null
  currency: string
}

export function parsePrizePool(raw: string | null): PrizePool {
  if (raw === null) return { amount: null, currency: "USD" }

  const match = /^([\d,\s.]+)\s*(.*)$/.exec(raw.trim())

  if (match === null) return { amount: null, currency: "USD" }

  const [, digits, label] = match
  const amount = Number((digits ?? "").replace(/[,\s]/g, ""))
  const currency = CURRENCY_CODE[(label ?? "").trim().toLowerCase()] ?? "USD"

  return { amount: Number.isFinite(amount) && amount > 0 ? amount : null, currency }
}

export function toTier(tier: string | null): TournamentTier {
  const lower = tier?.toLowerCase()

  return lower === "s" || lower === "a" || lower === "b" ? lower : "c"
}

function bestTier(stages: readonly PandaStageWire[]): TournamentTier {
  return stages
    .map((stage) => toTier(stage.tier))
    .reduce<TournamentTier>(
      (best, tier) => (TIER_ORDER[tier] < TIER_ORDER[best] ? tier : best),
      "c",
    )
}

function boundary(values: readonly (string | null)[], pick: "min" | "max"): Date | null {
  const times = values
    .filter((value): value is string => value !== null)
    .map((value) => Date.parse(value))
    .filter((value) => Number.isFinite(value))

  if (times.length === 0) return null

  return new Date(pick === "min" ? Math.min(...times) : Math.max(...times))
}

export function statusOf(startsAt: Date, endsAt: Date, now: Date): TournamentStatus {
  if (now.getTime() < startsAt.getTime()) return "upcoming"
  if (now.getTime() > endsAt.getTime()) return "finished"

  return "ongoing"
}

function seriesName(stages: readonly PandaStageWire[]): string {
  const [head] = stages
  const league = head?.league?.name ?? ""
  const serie = head?.serie?.full_name ?? head?.serie?.name ?? ""
  const combined = serie.toLowerCase().startsWith(league.toLowerCase())
    ? serie
    : `${league} ${serie}`.trim()

  return combined.length > 0 ? combined : (head?.name ?? "Турнир")
}

export function toStanding(wire: PandaStandingWire, index: number): StandingRow | null {
  if (wire.team === null) return null

  const position = wire.rank ?? index + 1

  return {
    position,
    placement: `#${position}`,
    team: toTeamRef(wire.team),
    wins: wire.wins,
    losses: wire.losses,
    mapDiff: wire.game_wins - wire.game_losses,
    prize: null,
  }
}

export function toTournament(
  stages: readonly PandaStageWire[],
  now: Date,
  standings: readonly StandingRow[] = [],
): Tournament | null {
  const [head] = stages

  if (head === undefined || head.serie === null) return null

  const startsAt = boundary(
    stages.map((stage) => stage.begin_at),
    "min",
  )
  const endsAt = boundary(
    stages.map((stage) => stage.end_at),
    "max",
  )

  if (startsAt === null || endsAt === null) return null

  const prizes = stages.map((stage) => parsePrizePool(stage.prizepool))
  const best = prizes.reduce<PrizePool>(
    (top, entry) => ((entry.amount ?? 0) > (top.amount ?? 0) ? entry : top),
    { amount: null, currency: "USD" },
  )

  const teams = new Map<string, TeamRef>()

  for (const stage of stages) {
    for (const wire of stage.teams) {
      const ref = toTeamRef(wire)

      if (!teams.has(ref.id)) teams.set(ref.id, ref)
    }
  }

  const name = seriesName(stages)
  const slug = toSlug(head.serie.slug)
  const offline = stages.some((stage) => stage.type === "offline")
  const tier = bestTier(stages)
  const status = statusOf(startsAt, endsAt, now)
  const stageNames = stages.map((stage) => stage.name).join(" · ")

  return {
    id: tournamentIdSchema.parse(String(head.serie.id)),
    slug,
    name,
    shortName: head.league?.name ?? name,
    tier,
    status,
    prizePool: best.amount,
    currency: best.currency,
    format: stageNames.length > 0 ? stageNames : "—",
    location: {
      city: null,
      country: toCountry(stages.find((stage) => stage.country !== null)?.country ?? null),
      online: !offline,
    },
    startsAt,
    endsAt,
    teams: [...teams.values()],
    standings: [...standings],
    description: `${name}: ${stageNames.length > 0 ? stageNames : "расписание"}. ${teams.size} команд, ${offline ? "LAN" : "онлайн"}.`,
    seo: {
      title: `${name} — расписание, результаты и таблица`,
      description: `${name} по Counter-Strike 2: участники, расписание матчей, результаты и итоговая таблица.`,
      canonical: tournamentHref(slug),
    },
    ref: {
      id: tournamentIdSchema.parse(String(head.serie.id)),
      slug,
      name,
      tier,
      logo: head.league?.image_url ?? null,
    },
  }
}

export function groupBySerie(stages: readonly PandaStageWire[]): PandaStageWire[][] {
  const groups = new Map<number, PandaStageWire[]>()

  for (const stage of stages) {
    if (stage.serie === null) continue

    const existing = groups.get(stage.serie_id)

    if (existing === undefined) groups.set(stage.serie_id, [stage])
    else existing.push(stage)
  }

  return [...groups.values()]
}
