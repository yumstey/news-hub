import { z } from "zod"

import { fetchJson, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { cacheFor } from "@/shared/lib/cache"

const API = "https://api.bo3.gg/api/v1"

/** Карьерная статистика игрока: проценты хранятся долями от нуля до единицы. */
export type PlayerCareerStats = {
  games: number
  rounds: number
  /** Рейтинг источника по десятибалльной шкале. */
  rating: number
  kd: number
  adr: number
  killsPerRound: number
  deathsPerRound: number
  headshotShare: number
  firstKillsPerRound: number
  multikillsPerRound: number
  roundWinrate: number
  clutches: number
  source: string
}

const playerSchema = z.object({
  results: z
    .array(z.object({ id: z.number().int(), slug: z.string(), nickname: z.string() }))
    .default([]),
})

const statsSchema = z.object({
  results: z
    .array(
      z.object({
        player_id: z.number().int(),
        games_count: z.number().default(0),
        rounds_count: z.number().default(0),
        rounds_winrate: z.number().default(0),
        avg_player_rating: z.number().default(0),
        avg_kills: z.number().default(0),
        avg_death: z.number().default(0),
        avg_damage: z.number().default(0),
        avg_kd_rate: z.number().default(0),
        avg_first_kills: z.number().default(0),
        avg_multikills: z.number().default(0),
        avg_headshots_accuracy: z.number().default(0),
        clutches_vs_1: z.number().default(0),
        clutches_vs_2: z.number().default(0),
        clutches_vs_3: z.number().default(0),
        clutches_vs_4: z.number().default(0),
        clutches_vs_5: z.number().default(0),
      }),
    )
    .default([]),
})

function query(field: string, value: string): string {
  return `filter${encodeURIComponent(`[${field}][eq]`)}=${encodeURIComponent(value)}`
}

/**
 * Карьерные цифры игрока из открытого API bo3.gg: рейтинг, K/D, урон за раунд
 * и клатчи, которых нет в матчевом тарифе PandaScore. Источник неофициальный,
 * поэтому любой сбой просто убирает блок со страницы.
 */
export async function getPlayerCareerStats(
  slug: string,
  nickname: string,
): Promise<ApiResult<PlayerCareerStats | null>> {
  "use cache"

  const bySlug = await fetchJson(`${API}/players?${query("slug", slug)}`, playerSchema)
  const byNickname =
    bySlug.ok && bySlug.data.results.length > 0
      ? null
      : await fetchJson(`${API}/players?${query("nickname", nickname)}`, playerSchema)
  const found = bySlug.ok && bySlug.data.results.length > 0
    ? bySlug.data.results
    : byNickname !== null && byNickname.ok
      ? byNickname.data.results
      : []

  const player =
    found.find((entry) => entry.slug === slug) ??
    found.find((entry) => entry.nickname.toLowerCase() === nickname.toLowerCase())

  if (player === undefined) {
    cacheFor("reference", bySlug.ok)

    return ok(null)
  }

  const stats = await fetchJson(
    `${API}/players/stats_list?${query("player_id", String(player.id))}`,
    statsSchema,
  )

  cacheFor("reference", stats.ok)

  const row = stats.ok ? stats.data.results.find((entry) => entry.player_id === player.id) : undefined

  if (row === undefined || row.games_count === 0) return ok(null)

  return ok({
    games: row.games_count,
    rounds: row.rounds_count,
    rating: row.avg_player_rating,
    kd: row.avg_kd_rate,
    adr: row.avg_damage,
    killsPerRound: row.avg_kills,
    deathsPerRound: row.avg_death,
    headshotShare: row.avg_headshots_accuracy,
    firstKillsPerRound: row.avg_first_kills,
    multikillsPerRound: row.avg_multikills,
    roundWinrate: row.rounds_winrate,
    clutches:
      row.clutches_vs_1 + row.clutches_vs_2 + row.clutches_vs_3 + row.clutches_vs_4 + row.clutches_vs_5,
    source: `https://bo3.gg/players/${player.slug}`,
  })
}

export type LeaderboardRow = {
  position: number
  nickname: string
  slug: string
  team: string | null
  rating: number
  /** Форма: средний рейтинг за последние полгода. */
  recentRating: number | null
  kd: number
  adr: number
  games: number
}

const leaderboardSchema = z.object({
  results: z
    .array(
      z.object({
        games_count: z.number().default(0),
        avg_player_rating: z.number().default(0),
        avg_kd_rate: z.number().default(0),
        avg_damage: z.number().default(0),
        player: z
          .object({
            slug: z.string(),
            nickname: z.string(),
            six_month_avg_rating: z.number().nullable().default(null),
            team: z.object({ name: z.string() }).nullable().default(null),
          })
          .nullable()
          .default(null),
      }),
    )
    .default([]),
})

/**
 * Рейтинг игроков по версии bo3.gg. Порог по числу карт отсекает случайные
 * всплески на малой выборке: без него первым встаёт игрок с десятком матчей.
 */
export async function getPlayerLeaderboard(
  limit = 20,
  minGames = 250,
): Promise<ApiResult<LeaderboardRow[]>> {
  "use cache"

  const result = await fetchJson(
    `${API}/players/stats_list?sort=-avg_player_rating&min_games_count=${minGames}&page%5Blimit%5D=${limit}`,
    leaderboardSchema,
  )

  cacheFor("reference", result.ok)

  if (!result.ok) return ok([])

  return ok(
    result.data.results.flatMap((row, index) => {
      if (row.player === null) return []

      return [
        {
          position: index + 1,
          nickname: row.player.nickname,
          slug: row.player.slug,
          team: row.player.team?.name ?? null,
          rating: row.avg_player_rating,
          recentRating: row.player.six_month_avg_rating,
          kd: row.avg_kd_rate,
          adr: row.avg_damage,
          games: row.games_count,
        },
      ]
    }),
  )
}
