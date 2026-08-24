import { z } from "zod"

import { teamWireSchema } from "../model/team"
import type { TeamWire } from "../model/team"
import { TEAM_SOURCE } from "./teamSource"

const teamListWireSchema = z.array(teamWireSchema)

export function parseTeamSource(): TeamWire[] | null {
  const parsed = teamListWireSchema.safeParse(TEAM_SOURCE)
  return parsed.success ? parsed.data : null
}
