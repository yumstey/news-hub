import { SITE } from "@/shared/config"
import type { JsonLdNode } from "@/shared/lib/seo"
import { absoluteUrl } from "@/shared/lib/url"

import type { Article } from "../model/article"
import { articleHref } from "./articleHref"

export function buildArticleJsonLd(article: Article): JsonLdNode {
  const url = absoluteUrl(articleHref(article.primaryCategory.slug, article.slug))

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: [absoluteUrl(article.cover.url)],
    datePublished: (article.timestamps.publishedAt ?? article.timestamps.createdAt).toISOString(),
    dateModified: article.timestamps.updatedAt.toISOString(),
    articleSection: article.primaryCategory.title,
    keywords: article.tags.join(", "),
    wordCount: article.readingMinutes * 180,
    inLanguage: SITE.locale,
    author: {
      "@type": "Person",
      name: article.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: absoluteUrl("/"),
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  }
}
