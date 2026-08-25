import { z } from "zod"

const serieSchema = z.object({
  id: z.number().int(),
  name: z.string().nullable().default(null),
  full_name: z.string().nullable().default(null),
  slug: z.string().min(1),
})

const leagueSchema = z.object({
  id: z.number(),
  image_url: z.string().nullable(),
  modified_at: z.iso.datetime(),
  name: z.string(),
  slug: z.string(),
  url: z.string().nullable(),
})

export const pandaStageSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  tier: z.string().nullable().default(null),
  begin_at: z.string().nullable().default(null),
  end_at: z.string().nullable().default(null),
  winner_id: z.number().int().nullable().default(null),
  serie: serieSchema.nullable().default(null),
  league: leagueSchema.nullable().default(null),
})

export type PandaTeamStageWire = z.infer<typeof pandaStageSchema>
