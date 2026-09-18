import type { Route } from "next"
import Link from "next/link"

import { DEFAULT_SKIN_QUERY, getSkinCatalog, querySkins, SkinCard } from "@/entities/skin"
import type { SkinQuery } from "@/entities/skin"
import { ROUTES } from "@/shared/config"
import { SectionHeading } from "@/shared/ui/section-heading"

export type SkinShowcaseProps = {
  title: string
  query?: Partial<SkinQuery>
  limit?: number
}

/** Полка скинов для главной и разделов: берёт срез каталога по заданному порядку. */
export async function SkinShowcase({ title, query = {}, limit = 10 }: SkinShowcaseProps) {
  const result = await getSkinCatalog()

  if (!result.ok) return null

  const full: SkinQuery = { ...DEFAULT_SKIN_QUERY, ...query }
  const skins = querySkins(result.data, full)
    .filter((skin) => skin.fromPrice !== null)
    .slice(0, limit)

  if (skins.length === 0) return null

  const params = new URLSearchParams()

  if (full.sort !== "popular") params.set("sort", full.sort)
  if (full.category !== null) params.set("category", full.category)

  const more = (params.size === 0 ? ROUTES.skins : `${ROUTES.skins}?${params}`) as Route

  return (
    <section className="flex flex-col gap-4">
      <SectionHeading
        title={title}
        action={
          <Link href={more} className="text-caption font-medium text-primary hover:underline">
            Все скины
          </Link>
        }
      />
      <ul className="-mx-gutter flex snap-x gap-3 overflow-x-auto px-gutter pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
        {skins.map((skin) => (
          <li key={skin.id} className="w-40 shrink-0 snap-start sm:w-auto">
            <SkinCard skin={skin} />
          </li>
        ))}
      </ul>
    </section>
  )
}
