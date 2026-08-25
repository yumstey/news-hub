import { z } from "zod"

import { pandaPlayerSchema, toPlayerRef } from "@/entities/player/@x/match"
import type { PlayerRef } from "@/entities/player/@x/match"
import { pandaOne } from "@/shared/api"

const opponentsSchema = z.object({
  opponents: z
    .array(
      z.object({
        id: z.number().int(),
        players: z.array(pandaPlayerSchema).default([]),
      }),
    )
    .default([]),
})

export type MatchLineups = [PlayerRef[], PlayerRef[]]

export const EMPTY_LINEUPS: MatchLineups = [[], []]

export async function getMatchLineups(
  id: string,
  firstTeamId: string,
  secondTeamId: string,
): Promise<MatchLineups> {
  const result = await pandaOne(
    `/matches/${encodeURIComponent(id)}/opponents`,
    opponentsSchema,
  )

  if (!result.ok) return EMPTY_LINEUPS

  const rosterOf = (teamId: string): PlayerRef[] => {
    const found = result.data.opponents.find((entry) => String(entry.id) === teamId)

    return found === undefined ? [] : found.players.map(toPlayerRef)
  }

  return [rosterOf(firstTeamId), rosterOf(secondTeamId)]
}
