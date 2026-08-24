import type { Metadata } from "next"

import { disciplineSectionHref, getDisciplineBySlug } from "@/entities/discipline"
import type { Discipline, DisciplineSection } from "@/entities/discipline"
import { DEFAULT_OG_IMAGE, SITE } from "@/shared/config"
import { slugSchema } from "@/shared/model"

import type { DisciplineParams } from "./discipline"

export const NOT_FOUND_METADATA: Metadata = {
  title: "Страница не найдена",
  robots: { index: false, follow: false },
}

export function buildMetadata(title: string, description: string, canonical: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: "ru_RU",
      title,
      description,
      url: canonical,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  }
}

export async function loadDiscipline(params: DisciplineParams): Promise<Discipline | null> {
  const { discipline } = await params
  const parsed = slugSchema.safeParse(discipline)

  if (!parsed.success) return null

  const result = await getDisciplineBySlug(parsed.data)

  return result.ok ? result.data : null
}

export async function sectionMetadata(
  params: DisciplineParams,
  section: DisciplineSection,
  title: (discipline: Discipline) => string,
  description: (discipline: Discipline) => string,
): Promise<Metadata> {
  const discipline = await loadDiscipline(params)

  if (discipline === null) return NOT_FOUND_METADATA

  return buildMetadata(
    title(discipline),
    description(discipline),
    disciplineSectionHref(discipline.slug, section),
  )
}
