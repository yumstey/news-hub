import { tournamentHref } from "../lib/tournamentHref"
import type { Tournament, TournamentWire } from "../model/tournament"

export function toTournament(wire: TournamentWire): Tournament {
  return {
    id: wire.id,
    slug: wire.slug,
    discipline: wire.discipline,
    name: wire.name,
    shortName: wire.short_name,
    tier: wire.tier,
    status: wire.status,
    prizePool: wire.prize_pool,
    currency: wire.currency,
    format: wire.format,
    location: wire.location,
    startsAt: new Date(wire.starts_at),
    endsAt: new Date(wire.ends_at),
    teams: wire.teams,
    standings: wire.standings.map((row) => ({
      position: row.position,
      placement: row.placement,
      team: row.team,
      wins: row.wins,
      losses: row.losses,
      mapDiff: row.map_diff,
      prize: row.prize,
    })),
    description: wire.description,
    seo: {
      title: wire.seo.title,
      description: wire.seo.description,
      canonical: tournamentHref(wire.discipline.slug, wire.slug),
    },
    ref: {
      id: wire.id,
      slug: wire.slug,
      name: wire.name,
      tier: wire.tier,
    },
  }
}
