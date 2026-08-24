import { z } from "zod"

import { articleSortSchema } from "../model/article"
import type { ArticleSort } from "../model/article"

const feedSearchParamsSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  tag: z.string().min(1).optional().catch(undefined),
  sort: articleSortSchema.catch("latest"),
})

export type FeedSearchParams = {
  page: number
  tag?: string
  sort: ArticleSort
}

export function parseFeedSearchParams(
  raw: Record<string, string | string[] | undefined>,
): FeedSearchParams {
  const parsed = feedSearchParamsSchema.parse({
    page: raw.page,
    tag: raw.tag,
    sort: raw.sort,
  })

  return {
    page: parsed.page,
    ...(parsed.tag ? { tag: parsed.tag } : {}),
    sort: parsed.sort,
  }
}
