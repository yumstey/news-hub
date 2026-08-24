import { z } from "zod"

import { categoryWireSchema } from "../model/category"
import type { CategoryWire } from "../model/category"
import { CATEGORY_SOURCE } from "./categorySource"

const categoryListWireSchema = z.array(categoryWireSchema)

export function parseCategorySource(): CategoryWire[] | null {
  const parsed = categoryListWireSchema.safeParse(CATEGORY_SOURCE)
  return parsed.success ? parsed.data : null
}
