import { notFound } from "next/navigation"

import { slugSchema } from "@/shared/model"

export async function resolveSlug(params: Promise<{ slug: string }>): Promise<string> {
  const { slug } = await params
  const parsed = slugSchema.safeParse(slug)

  if (!parsed.success) notFound()

  return parsed.data
}

export async function resolveId(params: Promise<{ id: string }>): Promise<string> {
  const { id } = await params

  if (!/^[A-Za-z0-9-]+$/.test(id)) notFound()

  return id
}
