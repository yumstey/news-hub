import { slugSchema } from "@/shared/model"

export function parseCategoryParam(value: string): string | null {
  const parsed = slugSchema.safeParse(value)
  return parsed.success ? parsed.data : null
}
