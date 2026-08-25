import { getTournamentBySlug, tournamentHref } from "@/entities/tournament"
import { slugSchema } from "@/shared/model"

import { buildMetadata, NOT_FOUND_METADATA } from "../../../_lib/metadata"

export async function generateMetadata(props: PageProps<"/events/[slug]">) {
  const { slug } = await props.params
  const parsed = slugSchema.safeParse(slug)

  if (!parsed.success) return NOT_FOUND_METADATA

  const result = await getTournamentBySlug(parsed.data)

  if (!result.ok) return NOT_FOUND_METADATA

  return buildMetadata(
    result.data.seo.title,
    result.data.seo.description,
    tournamentHref(result.data.slug),
  )
}
