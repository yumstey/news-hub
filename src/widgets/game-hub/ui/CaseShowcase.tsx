import Link from "next/link"

import { CrateCard, getCrateCatalog } from "@/entities/crate"
import { ROUTES } from "@/shared/config"
import { SectionHeading } from "@/shared/ui/section-heading"

export async function CaseShowcase({ title = "Новые кейсы", limit = 5 }: { title?: string; limit?: number }) {
  const result = await getCrateCatalog()

  if (!result.ok || result.data.length === 0) return null

  return (
    <section className="flex flex-col gap-4">
      <SectionHeading
        title={title}
        action={
          <Link href={ROUTES.cases} className="text-caption font-medium text-primary hover:underline">
            Все кейсы и шансы
          </Link>
        }
      />
      <ul className="-mx-gutter flex snap-x gap-3 overflow-x-auto px-gutter pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
        {result.data.slice(0, limit).map((crate) => (
          <li key={crate.id} className="w-40 shrink-0 snap-start sm:w-auto">
            <CrateCard crate={crate} />
          </li>
        ))}
      </ul>
    </section>
  )
}
