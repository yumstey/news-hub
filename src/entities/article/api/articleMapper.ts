import { toTimestamps } from "@/shared/model"

import { articleHref } from "../lib/articleHref"
import type { Article, ArticlePreview } from "../model/article"
import type { ContentBlock } from "../model/contentBlock"
import type { ArticleWire } from "./articleSchema"

const WORDS_PER_MINUTE = 180

function blockWords(block: ContentBlock): number {
  switch (block.kind) {
    case "paragraph":
    case "heading":
      return block.text.trim().split(/\s+/).length
    case "quote":
      return block.text.trim().split(/\s+/).length
    case "list":
      return block.items.reduce((total, item) => total + item.trim().split(/\s+/).length, 0)
    case "image":
      return block.caption ? block.caption.trim().split(/\s+/).length : 0
    case "embed":
      return 0
    default: {
      const exhaustive: never = block
      return exhaustive
    }
  }
}

export function readingMinutesOf(body: readonly ContentBlock[]): number {
  const words = body.reduce((total, block) => total + blockWords(block), 0)
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}

export function toArticlePreview(wire: ArticleWire): ArticlePreview {
  return {
    id: wire.id,
    slug: wire.slug,
    module: wire.module,
    discipline: wire.discipline,
    title: wire.title,
    excerpt: wire.excerpt,
    cover: wire.cover,
    author: wire.author,
    primaryCategory: wire.primary_category,
    categories: wire.categories,
    tags: wire.tags,
    views: wire.metrics.views,
    isFeatured: wire.is_featured,
    readingMinutes: readingMinutesOf(wire.body),
    timestamps: toTimestamps(wire),
  }
}

export function toArticle(wire: ArticleWire): Article {
  return {
    ...toArticlePreview(wire),
    body: wire.body,
    seo: {
      title: wire.seo.title,
      description: wire.seo.description,
      canonical: articleHref(wire.primary_category.slug, wire.slug),
      ...(wire.seo.og_image ? { ogImage: wire.seo.og_image } : {}),
    },
  }
}
