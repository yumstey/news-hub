import { notFound } from "next/navigation"
import { Suspense } from "react"

import { buildMatchJsonLd, getMatchById } from "@/entities/match"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { JsonLd } from "@/shared/ui/json-ld"
import { Skeleton } from "@/shared/ui/skeleton"
import { Heading, Text } from "@/shared/ui/typography"
import { MatchLineups, MatchMaps, MatchScoreboard, MatchStatistics } from "@/widgets/match-scoreboard"

import { breadcrumbsJsonLd, trail } from "../../_lib/breadcrumbs"
import { resolveId } from "../../_lib/params"

export { generateMetadata } from "./_lib/metadata"

export default function Page(props: PageProps<"/matches/[id]">) {
  return (
    <Container>
      <Section spacing="md">
        <Stack gap="lg">
          <Suspense fallback={<MatchSkeleton />}>
            <MatchView params={props.params} />
          </Suspense>
        </Stack>
      </Section>
    </Container>
  )
}

async function MatchView({ params }: Pick<PageProps<"/matches/[id]">, "params">) {
  const id = await resolveId(params)
  const result = await getMatchById(id)

  if (!result.ok) {
    if (result.error.kind === "not-found") notFound()
    throw new Error(result.error.message)
  }

  const match = result.data
  const [first, second] = match.teams
  const crumbs = trail(
    { label: "Матчи", href: "/matches" },
    { label: `${first.team.shortName} — ${second.team.shortName}` },
  )

  return (
    <>
      <JsonLd data={buildMatchJsonLd(match)} />
      <JsonLd data={breadcrumbsJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <Heading level={1} size="title" className="sr-only">
        {first.team.name} — {second.team.name}, {match.tournament.name}
      </Heading>

      <MatchScoreboard match={match} />
      <MatchMaps match={match} />
      <MatchLineups match={match} />

      {match.statistics === null ? (
        <Text size="caption" tone="subtle">
          Подробная статистика игроков для этого матча не публикуется на текущем тарифе данных.
        </Text>
      ) : (
        <MatchStatistics match={match} />
      )}
    </>
  )
}

function MatchSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton variant="text" className="h-3 w-full max-w-72" />
      <Skeleton variant="block" className="h-64 w-full" />
      <Skeleton variant="block" className="h-48 w-full" />
    </div>
  )
}
