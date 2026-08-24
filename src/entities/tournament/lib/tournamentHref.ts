import type { EventPath } from "@/shared/config"

export function tournamentHref(disciplineSlug: string, slug: string): EventPath {
  return `/esports/${disciplineSlug}/events/${slug}`
}
