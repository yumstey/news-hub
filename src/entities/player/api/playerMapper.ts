import { playerHref } from "../lib/playerHref"
import type { Player, PlayerWire } from "../model/player"

export function toPlayer(wire: PlayerWire): Player {
  return {
    id: wire.id,
    slug: wire.slug,
    discipline: wire.discipline,
    nickname: wire.nickname,
    realName: wire.real_name,
    photo: wire.photo,
    country: wire.country,
    role: wire.role,
    age: wire.age,
    team:
      wire.team === null
        ? null
        : {
            id: wire.team.id,
            slug: wire.team.slug,
            name: wire.team.name,
            shortName: wire.team.short_name,
            logo: wire.team.logo,
          },
    stats: {
      rating: wire.stats.rating,
      kd: wire.stats.kd,
      adr: wire.stats.adr,
      kast: wire.stats.kast,
      headshots: wire.stats.headshots,
      impact: wire.stats.impact,
      mapsPlayed: wire.stats.maps_played,
      roundsPlayed: wire.stats.rounds_played,
    },
    achievements: wire.achievements,
    seo: {
      title: wire.seo.title,
      description: wire.seo.description,
      canonical: playerHref(wire.discipline.slug, wire.slug),
    },
    ref: {
      id: wire.id,
      slug: wire.slug,
      nickname: wire.nickname,
      photo: wire.photo,
      country: wire.country,
      role: wire.role,
    },
  }
}
