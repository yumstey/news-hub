import { z } from "zod"

import { pandaTeamRefSchema } from "@/entities/team/@x/match"

export const pandaMatchStatusSchema = z
  .enum(["not_started", "running", "finished", "canceled", "postponed"])
  .catch("not_started")

export const pandaLeagueSchema = z.object({
  name: z.string().min(1),
  image_url: z.string().nullable().default(null),
})

export const pandaTournamentRefSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  slug: z.string().min(1),
  tier: z.string().nullable().default(null),
})

export const pandaStreamSchema = z.object({
  main: z.boolean().default(false),
  official: z.boolean().default(false),
  language: z.string().default(""),
  raw_url: z.string().nullable().default(null),
  embed_url: z.string().nullable().default(null),
})

export const pandaGameSchema = z.object({
  id: z.number().int(),
  position: z.number().int(),
  status: z.string(),
  length: z.number().int().nullable().default(null),
  finished: z.boolean().default(false),
  winner: z
    .object({ id: z.number().int().nullable().default(null) })
    .nullable()
    .default(null),
})

export const pandaResultSchema = z.object({
  team_id: z.number().int().nullable().default(null),
  score: z.number().int().default(0),
})

export const pandaMatchSchema = z.object({
  id: z.number().int(),
  name: z.string().default(""),
  slug: z.string().default(""),
  status: pandaMatchStatusSchema,
  number_of_games: z.number().int().default(1),
  scheduled_at: z.string().nullable().default(null),
  begin_at: z.string().nullable().default(null),
  end_at: z.string().nullable().default(null),
  winner_id: z.number().int().nullable().default(null),
  results: z.array(pandaResultSchema).default([]),
  opponents: z
    .array(z.object({ opponent: pandaTeamRefSchema }))
    .default([]),
  games: z.array(pandaGameSchema).default([]),
  streams_list: z.array(pandaStreamSchema).default([]),
  tournament: pandaTournamentRefSchema.nullable().default(null),
  league: pandaLeagueSchema.nullable().default(null),
  serie: z
    .object({ full_name: z.string().nullable().default(null) })
    .nullable()
    .default(null),
  detailed_stats: z.boolean().default(false),
  live: z
    .object({
      supported: z.boolean().default(false),
      url: z.string().nullable().default(null),
      opens_at: z.string().nullable().default(null),
    })
    .nullable()
    .default(null),
})

export type PandaMatchWire = z.infer<typeof pandaMatchSchema>
