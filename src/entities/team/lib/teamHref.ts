import type { TeamPath } from "@/shared/config"

export function teamHref(disciplineSlug: string, slug: string): TeamPath {
  return `/esports/${disciplineSlug}/teams/${slug}`
}
