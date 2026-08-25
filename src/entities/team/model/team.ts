import { z } from "zod"

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
  darkLogo: imageAssetSchema.nullable(),
  country: countrySchema.nullable(),
})

export type TeamRef = z.infer<typeof teamRefSchema>


export type TeamStats = {
  matchesWon: number
  matchesLost: number
  mapsPlayed: number | null
  roundWinRate: number | null
  currentStreak: number
  winRate: number
}

export type Team = {
  id: TeamId
  slug: Slug
  name: string
  shortName: string
  logo: ImageAsset
  darkLogo: ImageAsset | null
  country: Country | null
  region: string | null
  foundedYear: number | null
  worldRanking: number | null
  rankingPoints: number | null
  rankingChange: number | null
  stats: TeamStats
  recentForm: MatchOutcome[]
  seo: SeoFields
  ref: TeamRef
}

export type RankingRow = {
  rank: number
  change: number | null
  points: number | null
  team: TeamRef
  region: string | null
  form: MatchOutcome[]
}
