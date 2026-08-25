import { z } from "zod"

import type { TeamRef } from "@/entities/team/@x/tournament"
import { slugSchema } from "@/shared/model"
import type { Country, SeoFields, Slug } from "@/shared/model"

export const tournamentIdSchema = z.string().min(1).brand<"TournamentId">()
export type TournamentId = z.infer<typeof tournamentIdSchema>

export const tournamentTierSchema = z.enum(["s", "a", "b", "c"])
export type TournamentTier = z.infer<typeof tournamentTierSchema>

export const TOURNAMENT_TIER_LABEL: Record<TournamentTier, string> = {
  s: "S-tier",
  a: "A-tier",
  b: "B-tier",
  c: "C-tier",
}

export const tournamentStatusSchema = z.enum(["upcoming", "ongoing", "finished"])
export type TournamentStatus = z.infer<typeof tournamentStatusSchema>

export const TOURNAMENT_STATUS_LABEL: Record<TournamentStatus, string> = {
  upcoming: "Скоро",
  ongoing: "Идёт",
  finished: "Завершён",
}

export const tournamentRefSchema = z.object({
  id: tournamentIdSchema,
  slug: slugSchema,
  name: z.string().min(1),
  tier: tournamentTierSchema,
  logo: z.string().nullable().default(null),
})

export type TournamentRef = z.infer<typeof tournamentRefSchema>

export type StandingRow = {
  position: number
  placement: string
  team: TeamRef
  wins: number
  losses: number
  mapDiff: number
  prize: number | null
}

export type TournamentLocation = {
  city: string | null
  country: Country | null
  online: boolean
}

export type Tournament = {
  id: TournamentId
  slug: Slug
  name: string
  shortName: string
  tier: TournamentTier
  status: TournamentStatus
  prizePool: number | null
  currency: string
  format: string
  location: TournamentLocation
  startsAt: Date
  endsAt: Date
  teams: TeamRef[]
  standings: StandingRow[]
  description: string
  seo: SeoFields
  ref: TournamentRef
}
