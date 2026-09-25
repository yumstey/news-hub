import { z } from "zod"

import { pandaList } from "@/shared/api"

import type { MatchOutcome } from "../model/team"
import { EMPTY_RECORD } from "./pandaTeamMapper"
import type { TeamRecord } from "./pandaTeamMapper"

const RECORD_SAMPLE_SIZE = 20

const outcomeMatchSchema = z.object({
  winner_id: z.number().int().nullable().default(null),
  opponents: z.array(z.object({ opponent: z.object({ id: z.number().int() }) })).default([]),
})

export async function getTeamRecord(teamSlug: string, teamId: number): Promise<TeamRecord> {
  const result = await pandaList(
    `/teams/${encodeURIComponent(teamSlug)}/matches`,
    outcomeMatchSchema,
    {
      "page[size]": RECORD_SAMPLE_SIZE,
      "filter[status]": "finished",
      sort: "-scheduled_at",
    },
  )

  if (!result.ok) return EMPTY_RECORD

  const form: MatchOutcome[] = []
  let won = 0
  let lost = 0

  for (const match of result.data) {
    if (match.winner_id === null) continue
    if (!match.opponents.some((entry) => entry.opponent.id === teamId)) continue

    const outcome: MatchOutcome = match.winner_id === teamId ? "win" : "loss"

    if (outcome === "win") won += 1
    else lost += 1

    if (form.length < 5) form.push(outcome)
  }

  return { form, won, lost }
}
