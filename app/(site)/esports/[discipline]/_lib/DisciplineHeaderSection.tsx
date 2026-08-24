import type { DisciplineSection } from "@/entities/discipline"
import { DisciplineHeader } from "@/widgets/discipline-header"

import { resolveDiscipline } from "./discipline"
import type { DisciplineParams } from "./discipline"

export async function DisciplineHeaderSection({
  params,
  section,
  headingLevel,
}: {
  params: DisciplineParams
  section: DisciplineSection
  headingLevel?: 1 | 2
}) {
  const discipline = await resolveDiscipline(params)

  return (
    <DisciplineHeader
      discipline={discipline}
      activeSection={section}
      headingLevel={headingLevel ?? 2}
    />
  )
}
