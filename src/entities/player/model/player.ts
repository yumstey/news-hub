import { z } from "zod"

import { disciplineRefSchema } from "@/entities/discipline/@x/player"
import type { DisciplineRef } from "@/entities/discipline/@x/player"
import { countrySchema, imageAssetSchema, slugSchema } from "@/shared/model"
import type { Country, ImageAsset, SeoFields, Slug } from "@/shared/model"

export const playerIdSchema = z.string().min(1).brand<"PlayerId">()
export type PlayerId = z.infer<typeof playerIdSchema>

export const playerRoleSchema = z.enum(["igl", "awper", "entry", "rifler", "support", "coach"])
export type PlayerRole = z.infer<typeof playerRoleSchema>

export const PLAYER_ROLE_LABEL: Record<PlayerRole, string> = {
  igl: "IGL",
  awper: "AWP",
  entry: "Entry",
  rifler: "Rifler",
  support: "Support",
  coach: "Тренер",
}

export const playerRefSchema = z.object({
  id: playerIdSchema,
  slug: slugSchema,
  nickname: z.string().min(1),
  photo: imageAssetSchema.nullable(),
  country: countrySchema,
  role: playerRoleSchema,
})

export type PlayerRef = z.infer<typeof playerRefSchema>

const playerTeamSchema = z.object({
  id: z.string().min(1),
  slug: slugSchema,
  name: z.string().min(1),
  short_name: z.string().min(1),
  logo: imageAssetSchema,
})

export const playerStatsSchema = z.object({
  rating: z.number(),
  kd: z.number(),
  adr: z.number(),
  kast: z.number(),
  headshots: z.number(),
  impact: z.number(),
  maps_played: z.number().int().nonnegative(),
  rounds_played: z.number().int().nonnegative(),
})

export const playerAchievementSchema = z.object({
  title: z.string().min(1),
  event: z.string().min(1),
  year: z.number().int(),
  placement: z.string().min(1),
})

export type PlayerAchievement = z.infer<typeof playerAchievementSchema>

export const playerWireSchema = z.object({
  id: playerIdSchema,
  slug: slugSchema,
  discipline: disciplineRefSchema,
  nickname: z.string().min(1),
  real_name: z.string().min(1),
  photo: imageAssetSchema.nullable(),
  country: countrySchema,
  role: playerRoleSchema,
  age: z.number().int().positive(),
  team: playerTeamSchema.nullable(),
  stats: playerStatsSchema,
  achievements: z.array(playerAchievementSchema),
  seo: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  }),
})

export type PlayerWire = z.infer<typeof playerWireSchema>

export type PlayerStats = {
  rating: number
  kd: number
  adr: number
  kast: number
  headshots: number
  impact: number
  mapsPlayed: number
  roundsPlayed: number
}

export type PlayerTeamRef = {
  id: string
  slug: Slug
  name: string
  shortName: string
  logo: ImageAsset
}

export type Player = {
  id: PlayerId
  slug: Slug
  discipline: DisciplineRef
  nickname: string
  realName: string
  photo: ImageAsset | null
  country: Country
  role: PlayerRole
  age: number
  team: PlayerTeamRef | null
  stats: PlayerStats
  achievements: PlayerAchievement[]
  seo: SeoFields
  ref: PlayerRef
}

export type PlayerSort = "rating" | "kd" | "adr" | "nickname"
