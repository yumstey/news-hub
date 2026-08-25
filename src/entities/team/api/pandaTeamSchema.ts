import { z } from "zod"

import { pandaTeamRefSchema } from "./pandaTeamRef"

export const pandaRosterPlayerSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  slug: z.string().min(1),
  role: z.string().nullable().default(null),
  age: z.number().int().nullable().default(null),
  first_name: z.string().nullable().default(null),
  last_name: z.string().nullable().default(null),
  nationality: z.string().nullable().default(null),
  image_url: z.string().nullable().default(null),
  dark_mode_image_url: z.string().nullable().default(null),
  active: z.boolean().default(true),
})

export const pandaTeamSchema = pandaTeamRefSchema.extend({
  players: z.array(pandaRosterPlayerSchema).default([]),
})

export type PandaTeamWire = z.infer<typeof pandaTeamSchema>
export type PandaRosterPlayerWire = z.infer<typeof pandaRosterPlayerSchema>
