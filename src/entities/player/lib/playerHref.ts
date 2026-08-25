import type { PlayerPath } from "@/shared/config"

export function playerHref(slug: string): PlayerPath {
  return `/players/${slug}`
}
