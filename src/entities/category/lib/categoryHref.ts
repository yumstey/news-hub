import type { CategoryPath } from "@/shared/config"

export function categoryHref(slug: string): CategoryPath {
  return `/news/${slug}`
}
