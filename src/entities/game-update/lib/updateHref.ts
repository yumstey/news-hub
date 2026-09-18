import type { UpdatePath } from "@/shared/config"

export function updateHref(slug: string): UpdatePath {
  return `/updates/${slug}`
}
