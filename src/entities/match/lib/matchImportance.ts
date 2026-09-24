import type { TournamentTier } from "@/entities/tournament/@x/match"

import type { Match } from "../model/match"

/** 0–3 звезды, как на HLTV: насколько матч стоит внимания. */
export type MatchImportance = 0 | 1 | 2 | 3

const TIER_POINTS: Record<TournamentTier, number> = { s: 2, a: 1, b: 0, c: 0 }

function rankPoints(rank: number | undefined): number {
  if (rank === undefined) return 0
  if (rank <= 5) return 3
  if (rank <= 10) return 2
  if (rank <= 20) return 1

  return 0
}

/**
 * Важность считается по месту обеих команд в рейтинге Valve и уровню турнира:
 * топ-5 против топ-5 на S-турнире — три звезды, безымянный кубок — ноль.
 */
export function matchImportance(
  match: Match,
  ranks: ReadonlyMap<string, number>,
): MatchImportance {
  const [first, second] = match.teams
  const points =
    rankPoints(ranks.get(first.team.id)) +
    rankPoints(ranks.get(second.team.id)) +
    TIER_POINTS[match.tournament.tier]

  if (points >= 6) return 3
  if (points >= 4) return 2
  if (points >= 2) return 1

  return 0
}

const TIER_ORDER: Record<TournamentTier, number> = { s: 0, a: 1, b: 2, c: 3 }

/** Сначала важные, при равенстве — старший турнир, затем раньше начало. */
export function compareByImportance(
  left: { importance: number; tier: TournamentTier; startsAt: Date },
  right: { importance: number; tier: TournamentTier; startsAt: Date },
): number {
  return (
    right.importance - left.importance ||
    TIER_ORDER[left.tier] - TIER_ORDER[right.tier] ||
    left.startsAt.getTime() - right.startsAt.getTime()
  )
}
