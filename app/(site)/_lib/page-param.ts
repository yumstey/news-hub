import { z } from "zod"

const pageSchema = z.coerce.number().int().positive().catch(1)

export async function resolvePage(
  searchParams: Promise<{ page?: string | string[] }>,
): Promise<number> {
  const { page } = await searchParams
  const raw = Array.isArray(page) ? page[0] : page

  return pageSchema.parse(raw ?? 1)
}
