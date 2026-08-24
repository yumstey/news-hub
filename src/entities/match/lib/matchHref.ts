import type { MatchPath } from "@/shared/config"

export function matchHref(disciplineSlug: string, id: string): MatchPath {
  return `/esports/${disciplineSlug}/matches/${id}`
}
