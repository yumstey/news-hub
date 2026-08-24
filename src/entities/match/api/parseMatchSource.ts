import { z } from "zod"

import { matchWireSchema } from "../model/match"
import type { MatchWire } from "../model/match"
import { MATCH_SOURCE } from "./matchSource"

const matchListWireSchema = z.array(matchWireSchema)

export function parseMatchSource(): MatchWire[] | null {
  const parsed = matchListWireSchema.safeParse(MATCH_SOURCE)
  return parsed.success ? parsed.data : null
}

export function byStartAsc(left: MatchWire, right: MatchWire): number {
  return Date.parse(left.starts_at) - Date.parse(right.starts_at)
}

export function byStartDesc(left: MatchWire, right: MatchWire): number {
  return Date.parse(right.starts_at) - Date.parse(left.starts_at)
}

export function hasTeam(wire: MatchWire, teamSlug: string): boolean {
  return wire.teams.some((side) => side.team.slug === teamSlug)
}
