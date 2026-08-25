import type { TeamPath } from "@/shared/config"

export function teamHref(slug: string): TeamPath {
  return `/teams/${slug}`
}
