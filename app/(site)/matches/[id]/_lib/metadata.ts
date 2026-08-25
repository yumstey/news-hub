import { getMatchById, matchHref } from "@/entities/match"

import { buildMetadata, NOT_FOUND_METADATA } from "../../../_lib/metadata"

export async function generateMetadata(props: PageProps<"/matches/[id]">) {
  const { id } = await props.params
  const result = await getMatchById(id)

  if (!result.ok) return NOT_FOUND_METADATA

  const [first, second] = result.data.teams
  const title = `${first.team.name} — ${second.team.name}`

  return buildMetadata(
    title,
    `${title} на ${result.data.tournament.name}: счёт, составы и расписание серии.`,
    matchHref(result.data.id),
  )
}
