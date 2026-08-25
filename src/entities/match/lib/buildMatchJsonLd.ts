import { SITE } from "@/shared/config"
import type { JsonLdNode } from "@/shared/lib/seo"
import { absoluteUrl } from "@/shared/lib/url"

import type { Match } from "../model/match"
import { matchHref } from "./matchHref"

export function buildMatchJsonLd(match: Match): JsonLdNode {
  const [first, second] = match.teams

  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${first.team.name} — ${second.team.name}`,
    description: `${match.tournament.name}, ${match.stage}`,
    url: absoluteUrl(matchHref(match.id)),
    startDate: match.startsAt.toISOString(),
    eventStatus:
      match.status === "cancelled"
        ? "https://schema.org/EventCancelled"
        : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    competitor: [
      { "@type": "SportsTeam", name: first.team.name },
      { "@type": "SportsTeam", name: second.team.name },
    ],
    superEvent: {
      "@type": "SportsEvent",
      name: match.tournament.name,
    },
    organizer: {
      "@type": "Organization",
      name: SITE.name,
      url: absoluteUrl("/"),
    },
  }
}
