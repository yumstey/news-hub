import { notFound } from "next/navigation"
import { Suspense } from "react"

import { EMPTY_MATCH_MAPS, getGameMaps, getMatchMaps } from "@/entities/game-map"
import { buildMatchJsonLd, getMatchById } from "@/entities/match"
import type { Match } from "@/entities/match"
import { getFreePhotos } from "@/entities/player"
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

      <Suspense fallback={<Skeleton variant="block" className="h-64 w-full" />}>
        <Maps match={match} />
      </Suspense>

      <Suspense fallback={<MatchLineups match={match} />}>
        <Lineups match={match} />
      </Suspense>

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

async function Maps({ match }: { match: Match }) {
  const [first, second] = match.teams
  const [detail, catalogue] = await Promise.all([
    getMatchMaps(
      match.id,
      // Двоеточия и решётки в названии турнира мешают поиску по вики.
      match.tournament.name.replace(/[:#]/g, " "),
      [first.team.name, first.team.shortName],
      [second.team.name, second.team.shortName],
      match.startsAt.toISOString(),
    ),
    getGameMaps(),
  ])

  return (
    <MatchMaps
      match={match}
      detail={detail.ok ? detail.data : EMPTY_MATCH_MAPS}
      catalogue={catalogue.ok ? catalogue.data : []}
    />
  )
}

/** Составы сразу рендерятся с фото PandaScore; более свежие снимки с Commons догружаются. */
async function Lineups({ match }: { match: Match }) {
  const nicknames = match.lineups.flat().map((player) => player.nickname)

  if (nicknames.length === 0) return null

  const photos = await getFreePhotos(nicknames)

  return <MatchLineups match={match} photos={photos.ok ? photos.data : {}} />
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
