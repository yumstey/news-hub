import { z } from "zod"

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
  country: countrySchema.nullable(),
  role: playerRoleSchema.nullable(),
})

export type PlayerRef = z.infer<typeof playerRefSchema>

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
  darkLogo: ImageAsset | null
}

export type Player = {
  id: PlayerId
  slug: Slug
  nickname: string
  realName: string | null
  photo: ImageAsset | null
  country: Country | null
  role: PlayerRole | null
  age: number | null
  team: PlayerTeamRef | null
  stats: PlayerStats | null
  achievements: PlayerAchievement[]
  seo: SeoFields
  ref: PlayerRef
}

export type PlayerSort = "rating" | "kd" | "adr" | "nickname"
