import { z } from "zod"

import { imageAssetSchema } from "@/shared/model"

export const embedProviderSchema = z.enum(["youtube", "x", "telegram", "vk"])
export type EmbedProvider = z.infer<typeof embedProviderSchema>

export const contentBlockSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("paragraph"),
    text: z.string().min(1),
  }),
  z.object({
    kind: z.literal("heading"),
    level: z.union([z.literal(2), z.literal(3)]),
    text: z.string().min(1),
  }),
  z.object({
    kind: z.literal("image"),
    asset: imageAssetSchema,
    caption: z.string().optional(),
  }),
  z.object({
    kind: z.literal("embed"),
    provider: embedProviderSchema,
    url: z.url(),
    title: z.string().optional(),
  }),
  z.object({
    kind: z.literal("quote"),
    text: z.string().min(1),
    attribution: z.string().optional(),
  }),
  z.object({
    kind: z.literal("list"),
    ordered: z.boolean(),
    items: z.array(z.string().min(1)).min(1),
  }),
])

export type ContentBlock = z.infer<typeof contentBlockSchema>
export type RichContent = ContentBlock[]
