import { z } from "zod"

import { toCountry, toSlug } from "@/shared/model"

import { teamIdSchema } from "../model/team"
import type { TeamRef } from "../model/team"

export const TEAM_LOGO_PLACEHOLDER = "/team-placeholder.svg"

export const pandaTeamRefSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  slug: z.string().min(1),
  acronym: z.string().nullable().default(null),
  location: z.string().nullable().default(null),
  image_url: z.string().nullable().default(null),
  dark_mode_image_url: z.string().nullable().default(null),
})

export type PandaTeamRefWire = z.infer<typeof pandaTeamRefSchema>

function shortNameOf(wire: PandaTeamRefWire): string {
  const acronym = wire.acronym?.trim()

  if (acronym !== undefined && acronym.length > 0) return acronym

  const initials = wire.name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase()

  return initials.length > 0 ? initials.slice(0, 4) : wire.name.slice(0, 4).toUpperCase()
}

export function toTeamRef(wire: PandaTeamRefWire): TeamRef {
  const light = wire.image_url ?? TEAM_LOGO_PLACEHOLDER
  const dark = wire.dark_mode_image_url

  return {
    id: teamIdSchema.parse(String(wire.id)),
    slug: toSlug(wire.slug),
    name: wire.name,
    shortName: shortNameOf(wire),
    logo: {
      url: light,
      width: 64,
      height: 64,
      alt: `Логотип ${wire.name}`,
    },
    darkLogo:
      dark === null
        ? null
        : {
            url: dark,
            width: 64,
            height: 64,
            alt: `Логотип ${wire.name}`,
          },
    country: toCountry(wire.location),
  }
}
