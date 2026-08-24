import { z } from "zod"

import { disciplineWireSchema } from "../model/discipline"
import type { DisciplineWire } from "../model/discipline"
import { DISCIPLINE_SOURCE } from "./disciplineSource"

const disciplineListWireSchema = z.array(disciplineWireSchema)

export function parseDisciplineSource(): DisciplineWire[] | null {
  const parsed = disciplineListWireSchema.safeParse(DISCIPLINE_SOURCE)
  return parsed.success ? parsed.data : null
}
