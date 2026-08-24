import { z } from "zod"

import { contentModuleSchema, slugSchema } from "@/shared/model"
import type { ContentModule, SeoFields, Slug } from "@/shared/model"

export const categoryIdSchema = z.string().min(1).brand<"CategoryId">()
export type CategoryId = z.infer<typeof categoryIdSchema>

export const categoryRefSchema = z.object({
  id: categoryIdSchema,
  slug: slugSchema,
  title: z.string().min(1),
})

export type CategoryRef = z.infer<typeof categoryRefSchema>

export const categoryWireSchema = z.object({
  id: categoryIdSchema,
  slug: slugSchema,
  module: contentModuleSchema,
  title: z.string().min(1),
  description: z.string(),
  parent: categoryRefSchema.nullable(),
  seo: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  }),
})

export type CategoryWire = z.infer<typeof categoryWireSchema>

export type Category = {
  id: CategoryId
  slug: Slug
  module: ContentModule
  title: string
  description: string
  parent: CategoryRef | null
  seo: SeoFields
  ref: CategoryRef
}
