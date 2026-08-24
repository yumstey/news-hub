import { slugSchema } from "@/shared/model"

export type ArticleRouteParams = {
  category: string
  slug: string
}

export function parseArticleParams(raw: ArticleRouteParams): ArticleRouteParams | null {
  const category = slugSchema.safeParse(raw.category)
  const slug = slugSchema.safeParse(raw.slug)

  if (!category.success || !slug.success) return null

  return { category: category.data, slug: slug.data }
}
