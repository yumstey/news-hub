import { z } from "zod"

import { disciplineRefSchema } from "@/entities/discipline/@x/team"
import type { DisciplineRef } from "@/entities/discipline/@x/team"
import { countrySchema, imageAssetSchema, slugSchema } from "@/shared/model"
import type { Country, ImageAsset, SeoFields, Slug } from "@/shared/model"

export const teamIdSchema = z.string().min(1).brand<"TeamId">()
export type TeamId = z.infer<typeof teamIdSchema>

export const matchOutcomeSchema = z.enum(["win", "loss"])
export type MatchOutcome = z.infer<typeof matchOutcomeSchema>

export const teamRefSchema = z.object({
  id: teamIdSchema,
  slug: slugSchema,
  name: z.string().min(1),
  shortName: z.string().min(1),
  logo: imageAssetSchema,
  country: countrySchema,
})

export type TeamRef = z.infer<typeof teamRefSchema>

export const teamStatsSchema = z.object({
  matches_won: z.number().int().nonnegative(),
  matches_lost: z.number().int().nonnegative(),
  maps_played: z.number().int().nonnegative(),
  round_win_rate: z.number(),
  current_streak: z.number().int(),
})

export const teamWireSchema = z.object({
  id: teamIdSchema,
  slug: slugSchema,
  discipline: disciplineRefSchema,
  name: z.string().min(1),
  short_name: z.string().min(1),
  logo: imageAssetSchema,
  country: countrySchema,
  region: z.string().min(1),
  founded_year: z.number().int(),
  world_ranking: z.number().int().positive().nullable(),
  ranking_points: z.number().int().nonnegative(),
  ranking_change: z.number().int(),
  stats: teamStatsSchema,
  recent_form: z.array(matchOutcomeSchema),
  seo: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  }),
})

export type TeamWire = z.infer<typeof teamWireSchema>

export type TeamStats = {
  matchesWon: number
  matchesLost: number
  mapsPlayed: number
  roundWinRate: number
  currentStreak: number
  winRate: number
}

export type Team = {
  id: TeamId
  slug: Slug
  discipline: DisciplineRef
  name: string
  shortName: string
  logo: ImageAsset
  country: Country
  region: string
  foundedYear: number
  worldRanking: number | null
  rankingPoints: number
  rankingChange: number
  stats: TeamStats
  recentForm: MatchOutcome[]
  seo: SeoFields
  ref: TeamRef
}

export type RankingRow = {
  rank: number
  change: number
  points: number
  team: TeamRef
  region: string
  form: MatchOutcome[]
}
