import { z } from "zod"

import { disciplineRefSchema } from "@/entities/discipline/@x/tournament"
import type { DisciplineRef } from "@/entities/discipline/@x/tournament"
import { teamRefSchema } from "@/entities/team/@x/tournament"
import type { TeamRef } from "@/entities/team/@x/tournament"
import { countrySchema, slugSchema } from "@/shared/model"
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
})

export type TournamentRef = z.infer<typeof tournamentRefSchema>

export const standingRowWireSchema = z.object({
  position: z.number().int().positive(),
  placement: z.string().min(1),
  team: teamRefSchema,
  wins: z.number().int().nonnegative(),
  losses: z.number().int().nonnegative(),
  map_diff: z.number().int(),
  prize: z.number().int().nonnegative(),
})

export type StandingRow = {
  position: number
  placement: string
  team: TeamRef
  wins: number
  losses: number
  mapDiff: number
  prize: number
}

export const tournamentWireSchema = z.object({
  id: tournamentIdSchema,
  slug: slugSchema,
  discipline: disciplineRefSchema,
  name: z.string().min(1),
  short_name: z.string().min(1),
  tier: tournamentTierSchema,
  status: tournamentStatusSchema,
  prize_pool: z.number().int().nonnegative(),
  currency: z.string().min(1),
  format: z.string().min(1),
  location: z.object({
    city: z.string().min(1),
    country: countrySchema,
    online: z.boolean(),
  }),
  starts_at: z.iso.datetime(),
  ends_at: z.iso.datetime(),
  teams: z.array(teamRefSchema),
  standings: z.array(standingRowWireSchema),
  description: z.string().min(1),
  seo: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  }),
})

export type TournamentWire = z.infer<typeof tournamentWireSchema>

export type TournamentLocation = {
  city: string
  country: Country
  online: boolean
}

export type Tournament = {
  id: TournamentId
  slug: Slug
  discipline: DisciplineRef
  name: string
  shortName: string
  tier: TournamentTier
  status: TournamentStatus
  prizePool: number
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
