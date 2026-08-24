import { z } from "zod"

import { contentModuleSchema, imageAssetSchema, slugSchema } from "@/shared/model"
import type { ContentModule, ImageAsset, SeoFields, Slug } from "@/shared/model"

export const disciplineIdSchema = z.string().min(1).brand<"DisciplineId">()
export type DisciplineId = z.infer<typeof disciplineIdSchema>

export const disciplineKindSchema = z.enum(["sport", "esport"])
export type DisciplineKind = z.infer<typeof disciplineKindSchema>

export const disciplineRefSchema = z.object({
  id: disciplineIdSchema,
  slug: slugSchema,
  title: z.string().min(1),
  kind: disciplineKindSchema,
})

export type DisciplineRef = z.infer<typeof disciplineRefSchema>

export const disciplineWireSchema = z.object({
  id: disciplineIdSchema,
  slug: slugSchema,
  kind: disciplineKindSchema,
  module: contentModuleSchema,
  title: z.string().min(1),
  short_title: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().min(1),
  logo: imageAssetSchema,
  has_live_scores: z.boolean(),
  seo: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  }),
})

export type DisciplineWire = z.infer<typeof disciplineWireSchema>

export type Discipline = {
  id: DisciplineId
  slug: Slug
  kind: DisciplineKind
  module: ContentModule
  title: string
  shortTitle: string
  description: string
  icon: string
  logo: ImageAsset
  hasLiveScores: boolean
  seo: SeoFields
  ref: DisciplineRef
}

export type DisciplineSection =
  | "overview"
  | "news"
  | "matches"
  | "results"
  | "rankings"
  | "teams"
  | "players"
  | "events"

export const DISCIPLINE_SECTIONS: readonly { section: DisciplineSection; label: string }[] = [
  { section: "overview", label: "Обзор" },
  { section: "news", label: "Новости" },
  { section: "matches", label: "Матчи" },
  { section: "results", label: "Результаты" },
  { section: "rankings", label: "Рейтинг" },
  { section: "teams", label: "Команды" },
  { section: "players", label: "Игроки" },
  { section: "events", label: "Ивенты" },
]
