import { z } from "zod"

import { authorRefSchema } from "@/entities/author/@x/article"
import { disciplineRefSchema } from "@/entities/discipline/@x/article"
import { categoryRefSchema } from "@/entities/category/@x/article"
import { contentModuleSchema, imageAssetSchema, slugSchema, timestampsWireSchema } from "@/shared/model"

import { articleIdSchema } from "../model/article"
import { contentBlockSchema } from "../model/contentBlock"

export const articleWireSchema = timestampsWireSchema.extend({
  id: articleIdSchema,
  slug: slugSchema,
  module: contentModuleSchema,
  discipline: disciplineRefSchema.nullable().default(null),
  title: z.string().min(1),
  excerpt: z.string().min(1),
  cover: imageAssetSchema,
  author: authorRefSchema,
  primary_category: categoryRefSchema,
  categories: z.array(categoryRefSchema),
  tags: z.array(z.string().min(1)),
  metrics: z.object({
    views: z.number().int().nonnegative(),
  }),
  is_featured: z.boolean(),
  body: z.array(contentBlockSchema).min(1),
  seo: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    og_image: imageAssetSchema.nullable(),
  }),
})

export type ArticleWire = z.infer<typeof articleWireSchema>

export const articleListWireSchema = z.array(articleWireSchema)
