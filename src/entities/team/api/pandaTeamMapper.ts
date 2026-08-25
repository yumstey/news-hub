
import { teamHref } from "../lib/teamHref"
import type { MatchOutcome, Team, TeamStats } from "../model/team"
import { toTeamRef } from "./pandaTeamRef"
import type { PandaTeamWire } from "./pandaTeamSchema"

export type TeamRecord = {
  form: MatchOutcome[]
  won: number
  lost: number
}

export const EMPTY_RECORD: TeamRecord = { form: [], won: 0, lost: 0 }

function currentStreak(form: readonly MatchOutcome[]): number {
  const [head] = form

  if (head === undefined) return 0

  let length = 0

  for (const outcome of form) {
    if (outcome !== head) break

    length += 1
  }

  return head === "win" ? length : -length
}

function toStats(record: TeamRecord): TeamStats {
  const played = record.won + record.lost

  return {
    matchesWon: record.won,
    matchesLost: record.lost,
    mapsPlayed: null,
    roundWinRate: null,
    currentStreak: currentStreak(record.form),
    winRate: played === 0 ? 0 : Math.round((record.won / played) * 1000) / 10,
  }
}

export function toTeam(wire: PandaTeamWire, record: TeamRecord = EMPTY_RECORD): Team {
  const ref = toTeamRef(wire)

  return {
    id: ref.id,
    slug: ref.slug,
    name: ref.name,
    shortName: ref.shortName,
    logo: ref.logo,
    darkLogo: ref.darkLogo,
    country: ref.country,
    region: null,
    foundedYear: null,
    worldRanking: null,
    rankingPoints: null,
    rankingChange: null,
    stats: toStats(record),
    recentForm: record.form,
    seo: {
      title: `${ref.name} — состав, матчи и результаты`,
      description: `${ref.name}: актуальный состав, ближайшие матчи, результаты сыгранных серий и турниры Counter-Strike 2.`,
      canonical: teamHref(ref.slug),
    },
    ref,
  }
}
