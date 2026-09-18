import type { CasePath } from "@/shared/config"

export function crateHref(slug: string): CasePath {
  return `/cases/${slug}`
}
