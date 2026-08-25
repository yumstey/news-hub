import { z } from "zod"

import { pandaTeamRefSchema } from "@/entities/team/@x/tournament"

export const pandaLeagueSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  slug: z.string().min(1),
  image_url: z.string().nullable().default(null),
})

export const pandaSerieSchema = z.object({
  id: z.number().int(),
  name: z.string().nullable().default(null),
  full_name: z.string().nullable().default(null),
  slug: z.string().min(1),
  year: z.number().int().nullable().default(null),
  begin_at: z.string().nullable().default(null),
  end_at: z.string().nullable().default(null),
})

export const pandaStageSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  slug: z.string().min(1),
  type: z.string().nullable().default(null),
  tier: z.string().nullable().default(null),
  region: z.string().nullable().default(null),
  country: z.string().nullable().default(null),
  prizepool: z.string().nullable().default(null),
  has_bracket: z.boolean().default(false),
  begin_at: z.string().nullable().default(null),
  end_at: z.string().nullable().default(null),
  winner_id: z.number().int().nullable().default(null),
  serie_id: z.number().int(),
  serie: pandaSerieSchema.nullable().default(null),
  league: pandaLeagueSchema.nullable().default(null),
  teams: z.array(pandaTeamRefSchema).default([]),
})

export const pandaStandingSchema = z.object({
  rank: z.number().int().nullable().default(null),
  total: z.number().int().nullable().default(null),
  wins: z.number().int().default(0),
  losses: z.number().int().default(0),
  game_wins: z.number().int().default(0),
  game_losses: z.number().int().default(0),
  team: pandaTeamRefSchema.nullable().default(null),
})

export const pandaSerieDetailSchema = pandaSerieSchema.extend({
  league: pandaLeagueSchema.nullable().default(null),
  tournaments: z.array(pandaStageSchema.partial({ serie_id: true })).default([]),
})

export type PandaStageWire = z.infer<typeof pandaStageSchema>
export type PandaStandingWire = z.infer<typeof pandaStandingSchema>
export type PandaSerieDetailWire = z.infer<typeof pandaSerieDetailSchema>
