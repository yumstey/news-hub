import { SITE } from "@/shared/config"
import type { JsonLdNode } from "@/shared/lib/seo"
import { absoluteUrl } from "@/shared/lib/url"

import type { Tournament } from "../model/tournament"
import { tournamentHref } from "./tournamentHref"

export function buildTournamentJsonLd(tournament: Tournament): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: tournament.name,
    description: tournament.description,
    url: absoluteUrl(tournamentHref(tournament.discipline.slug, tournament.slug)),
    startDate: tournament.startsAt.toISOString(),
    endDate: tournament.endsAt.toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: tournament.location.online
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: tournament.location.city,
      address: {
        "@type": "PostalAddress",
        addressCountry: tournament.location.country.code,
        addressLocality: tournament.location.city,
      },
    },
    competitor: tournament.teams.map((team) => ({
      "@type": "SportsTeam",
      name: team.name,
    })),
    organizer: {
      "@type": "Organization",
      name: SITE.name,
      url: absoluteUrl("/"),
    },
  }
}
