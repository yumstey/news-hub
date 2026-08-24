import type { DisciplinePath, DisciplineSectionPath } from "@/shared/config"

import type { DisciplineSection } from "../model/discipline"

export function disciplineHref(slug: string): DisciplinePath {
  return `/esports/${slug}`
}

export function disciplineSectionHref(
  slug: string,
  section: DisciplineSection,
): DisciplineSectionPath {
  if (section === "overview") return `/esports/${slug}`

  return `/esports/${slug}/${section}`
}
