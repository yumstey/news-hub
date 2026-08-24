import type { FeedBasePath, FeedHref } from "@/shared/config"

export type FeedQuery = {
  page?: number
  tag?: string
  sort?: string
}

export function buildFeedHref(base: FeedBasePath, query: FeedQuery = {}): FeedHref {
  const search = new URLSearchParams()

  if (query.tag) search.set("tag", query.tag)
  if (query.sort && query.sort !== "latest") search.set("sort", query.sort)
  if (query.page !== undefined && query.page > 1) search.set("page", String(query.page))

  const qs = search.toString()

  return qs ? `${base}?${qs}` : base
}
