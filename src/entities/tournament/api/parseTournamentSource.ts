import { z } from "zod"

import { tournamentWireSchema } from "../model/tournament"
import type { TournamentWire } from "../model/tournament"
import { TOURNAMENT_SOURCE } from "./tournamentSource"

const tournamentListWireSchema = z.array(tournamentWireSchema)

export function parseTournamentSource(): TournamentWire[] | null {
  const parsed = tournamentListWireSchema.safeParse(TOURNAMENT_SOURCE)
  return parsed.success ? parsed.data : null
}
