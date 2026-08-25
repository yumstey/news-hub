import type { EventPath } from "@/shared/config"

export function tournamentHref(slug: string): EventPath {
  return `/events/${slug}`
}
