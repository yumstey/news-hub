import { disciplineSectionHref } from "@/entities/discipline"
import type { DisciplineSection } from "@/entities/discipline"
import { ROUTES } from "@/shared/config"
import { buildBreadcrumbJsonLd } from "@/shared/lib/seo"
import type { JsonLdNode } from "@/shared/lib/seo"
import { absoluteUrl } from "@/shared/lib/url"
import type { BreadcrumbItem } from "@/shared/ui/breadcrumbs"

export function disciplineBreadcrumbs(
  disciplineSlug: string,
  disciplineTitle: string,
  trail: readonly { label: string; section?: DisciplineSection }[] = [],
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: "Главная", href: ROUTES.home },
    { label: "Киберспорт", href: ROUTES.esports },
    { label: disciplineTitle, href: disciplineSectionHref(disciplineSlug, "overview") },
  ]

  for (const entry of trail) {
    items.push(
      entry.section
        ? { label: entry.label, href: disciplineSectionHref(disciplineSlug, entry.section) }
        : { label: entry.label },
    )
  }

  return items
}

export function breadcrumbsJsonLd(items: readonly BreadcrumbItem[]): JsonLdNode {
  return buildBreadcrumbJsonLd(
    items.map((item) => ({
      name: item.label,
      url: absoluteUrl(item.href ?? ROUTES.esports),
    })),
  )
}
