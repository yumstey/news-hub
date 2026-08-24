import { z } from "zod"

import { playerWireSchema } from "../model/player"
import type { PlayerWire } from "../model/player"
import { PLAYER_SOURCE } from "./playerSource"

const playerListWireSchema = z.array(playerWireSchema)

export function parsePlayerSource(): PlayerWire[] | null {
  const parsed = playerListWireSchema.safeParse(PLAYER_SOURCE)
  return parsed.success ? parsed.data : null
}
