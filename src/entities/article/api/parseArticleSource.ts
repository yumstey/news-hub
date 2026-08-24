import { articleListWireSchema } from "./articleSchema"
import type { ArticleWire } from "./articleSchema"
import { ARTICLE_SOURCE } from "./articleSource"
import { ESPORTS_ARTICLE_SOURCE } from "./esportsArticleSource"

export function parseArticleSource(): ArticleWire[] | null {
  const parsed = articleListWireSchema.safeParse([...ARTICLE_SOURCE, ...ESPORTS_ARTICLE_SOURCE])
  return parsed.success ? parsed.data : null
}

export function isPublished(wire: ArticleWire): boolean {
  return wire.published_at !== null
}

export function byPublishedDesc(left: ArticleWire, right: ArticleWire): number {
  return Date.parse(right.published_at ?? "") - Date.parse(left.published_at ?? "")
}

export function byViewsDesc(left: ArticleWire, right: ArticleWire): number {
  return right.metrics.views - left.metrics.views
}
