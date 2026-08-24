import type { PlayerPath } from "@/shared/config"

export function playerHref(disciplineSlug: string, slug: string): PlayerPath {
  return `/esports/${disciplineSlug}/players/${slug}`
}
