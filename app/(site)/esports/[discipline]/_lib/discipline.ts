import { notFound } from "next/navigation"

import { getDisciplineBySlug } from "@/entities/discipline"
import type { Discipline } from "@/entities/discipline"
import { slugSchema } from "@/shared/model"

export type DisciplineParams = Promise<{ discipline: string }>

export async function resolveDiscipline(params: DisciplineParams): Promise<Discipline> {
  const { discipline } = await params
  const parsed = slugSchema.safeParse(discipline)

  if (!parsed.success) notFound()

  const result = await getDisciplineBySlug(parsed.data)

  if (!result.ok) {
    if (result.error.kind === "not-found") notFound()
    throw new Error(result.error.message)
  }

  return result.data
}
