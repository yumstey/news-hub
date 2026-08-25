import { SITE } from "@/shared/config"
import type { JsonLdNode } from "@/shared/lib/seo"
import { absoluteUrl } from "@/shared/lib/url"

import type { Player } from "../model/player"
import { playerHref } from "./playerHref"

export function buildPlayerJsonLd(player: Player): JsonLdNode {
  const url = absoluteUrl(playerHref(player.slug))

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: player.realName,
    alternateName: player.nickname,
    nationality: (player.country?.name ?? ""),
    url,
    ...(player.team
      ? {
          memberOf: {
            "@type": "SportsTeam",
            name: player.team.name,
          },
        }
      : {}),
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: absoluteUrl("/"),
    },
  }
}
