import { teamHref } from "../lib/teamHref"
import type { Team, TeamWire } from "../model/team"

export function toTeam(wire: TeamWire): Team {
  const played = wire.stats.matches_won + wire.stats.matches_lost

  return {
    id: wire.id,
    slug: wire.slug,
    discipline: wire.discipline,
    name: wire.name,
    shortName: wire.short_name,
    logo: wire.logo,
    country: wire.country,
    region: wire.region,
    foundedYear: wire.founded_year,
    worldRanking: wire.world_ranking,
    rankingPoints: wire.ranking_points,
    rankingChange: wire.ranking_change,
    stats: {
      matchesWon: wire.stats.matches_won,
      matchesLost: wire.stats.matches_lost,
      mapsPlayed: wire.stats.maps_played,
      roundWinRate: wire.stats.round_win_rate,
      currentStreak: wire.stats.current_streak,
      winRate: played === 0 ? 0 : Math.round((wire.stats.matches_won / played) * 1000) / 10,
    },
    recentForm: wire.recent_form,
    seo: {
      title: wire.seo.title,
      description: wire.seo.description,
      canonical: teamHref(wire.discipline.slug, wire.slug),
    },
    ref: {
      id: wire.id,
      slug: wire.slug,
      name: wire.name,
      shortName: wire.short_name,
      logo: wire.logo,
      country: wire.country,
    },
  }
}
