import { ROUTES } from "@/shared/config"
import { buildBreadcrumbJsonLd } from "@/shared/lib/seo"
import type { JsonLdNode } from "@/shared/lib/seo"
import { absoluteUrl } from "@/shared/lib/url"
import type { BreadcrumbItem } from "@/shared/ui/breadcrumbs"

export function trail(...items: readonly BreadcrumbItem[]): BreadcrumbItem[] {
  return [{ label: "Обзор", href: ROUTES.home }, ...items]
}

export function breadcrumbsJsonLd(items: readonly BreadcrumbItem[]): JsonLdNode {
  return buildBreadcrumbJsonLd(
    items.map((item) => ({
      name: item.label,
      url: absoluteUrl(item.href ?? ROUTES.home),
    })),
  )
}
