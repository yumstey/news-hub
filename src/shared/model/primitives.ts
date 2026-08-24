import { z } from "zod"

export const slugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9-]+$/)
  .brand<"Slug">()

export type Slug = z.infer<typeof slugSchema>

export const contentModuleSchema = z.enum(["news", "sport", "esports"])
export type ContentModule = z.infer<typeof contentModuleSchema>

export const localeCodeSchema = z.enum(["uz", "ru", "en"])
export type LocaleCode = z.infer<typeof localeCodeSchema>

export const countrySchema = z.object({
  code: z.string().length(2),
  name: z.string().min(1),
})

export type Country = z.infer<typeof countrySchema>

export const imageAssetSchema = z.object({
  url: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string(),
  blurDataUrl: z.string().optional(),
})

export type ImageAsset = z.infer<typeof imageAssetSchema>

export const seoFieldsSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  canonical: z.string().min(1),
  ogImage: imageAssetSchema.optional(),
})

export type SeoFields = z.infer<typeof seoFieldsSchema>

export const timestampsWireSchema = z.object({
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  published_at: z.iso.datetime().nullable(),
})

export type TimestampsWire = z.infer<typeof timestampsWireSchema>

export type Timestamps = {
  createdAt: Date
  updatedAt: Date
  publishedAt: Date | null
}

export function toTimestamps(wire: TimestampsWire): Timestamps {
  return {
    createdAt: new Date(wire.created_at),
    updatedAt: new Date(wire.updated_at),
    publishedAt: wire.published_at === null ? null : new Date(wire.published_at),
  }
}
