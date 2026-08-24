import { disciplineHref } from "../lib/disciplineHref"
import type { Discipline, DisciplineWire } from "../model/discipline"

export function toDiscipline(wire: DisciplineWire): Discipline {
  return {
    id: wire.id,
    slug: wire.slug,
    kind: wire.kind,
    module: wire.module,
    title: wire.title,
    shortTitle: wire.short_title,
    description: wire.description,
    icon: wire.icon,
    logo: wire.logo,
    hasLiveScores: wire.has_live_scores,
    seo: {
      title: wire.seo.title,
      description: wire.seo.description,
      canonical: disciplineHref(wire.slug),
    },
    ref: {
      id: wire.id,
      slug: wire.slug,
      title: wire.title,
      kind: wire.kind,
    },
  }
}
