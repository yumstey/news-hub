import type { MatchPath } from "@/shared/config"

export function matchHref(id: string): MatchPath {
  return `/matches/${id}`
}
