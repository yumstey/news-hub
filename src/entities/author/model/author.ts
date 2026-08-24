import { z } from "zod"

import { imageAssetSchema, slugSchema } from "@/shared/model"

export const authorIdSchema = z.string().min(1).brand<"AuthorId">()
export type AuthorId = z.infer<typeof authorIdSchema>

export const authorRefSchema = z.object({
  id: authorIdSchema,
  slug: slugSchema,
  name: z.string().min(1),
  avatar: imageAssetSchema.nullable(),
})

export type AuthorRef = z.infer<typeof authorRefSchema>

export const socialLinkSchema = z.object({
  platform: z.enum(["telegram", "x", "youtube", "site"]),
  url: z.url(),
})

export const authorSchema = authorRefSchema.extend({
  bio: z.string(),
  socials: z.array(socialLinkSchema),
})

export type Author = z.infer<typeof authorSchema>
export type SocialLink = z.infer<typeof socialLinkSchema>
