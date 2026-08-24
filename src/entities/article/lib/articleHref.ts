import type { ArticlePath, EsportsArticlePath } from "@/shared/config"

export function articleHref(categorySlug: string, slug: string): ArticlePath {
  return `/news/${categorySlug}/${slug}`
}

export function esportsArticleHref(
  disciplineSlug: string,
  slug: string,
): EsportsArticlePath {
  return `/esports/${disciplineSlug}/news/${slug}`
}
