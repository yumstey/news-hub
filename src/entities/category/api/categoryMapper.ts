import { categoryHref } from "../lib/categoryHref"
import type { Category, CategoryWire } from "../model/category"

export function toCategory(wire: CategoryWire): Category {
  return {
    id: wire.id,
    slug: wire.slug,
    module: wire.module,
    title: wire.title,
    description: wire.description,
    parent: wire.parent,
    seo: {
      title: wire.seo.title,
      description: wire.seo.description,
      canonical: categoryHref(wire.slug),
    },
    ref: {
      id: wire.id,
      slug: wire.slug,
      title: wire.title,
    },
  }
}
