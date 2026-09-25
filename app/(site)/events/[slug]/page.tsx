import { notFound } from "next/navigation"
import { Suspense } from "react"

import { EMPTY_EVENT_MAP_STATS, getEventMapStats, getGameMaps } from "@/entities/game-map"
import { TeamIdentity } from "@/entities/team"
import { buildTournamentJsonLd, getTournamentBracket, getTournamentBySlug } from "@/entities/tournament"
import type { Tournament, TournamentStage } from "@/entities/tournament"
import { cn } from "@/shared/lib/style"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { JsonLd } from "@/shared/ui/json-ld"
import { SectionNav } from "@/shared/ui/section-nav"
import { Skeleton } from "@/shared/ui/skeleton"
import { Heading } from "@/shared/ui/typography"
import { MapStats } from "@/widgets/map-stats"
import { MatchCenter, MatchCenterSkeleton } from "@/widgets/match-center"
import { PrizeDistribution } from "@/widgets/prize-distribution"
import { StandingsTable } from "@/widgets/standings-table"
import { TournamentBracket, TournamentBracketSkeleton } from "@/widgets/tournament-bracket"

import { breadcrumbsJsonLd, trail } from "../../_lib/breadcrumbs"
import { resolveSlug } from "../../_lib/params"
import { EventHero, EventMeta } from "./_ui/EventHero"
import { EventPlacements } from "./_ui/EventPlacements"
import { EventProfileBlock } from "./_ui/EventProfileBlock"

export { generateMetadata } from "./_lib/metadata"

export default function Page(props: PageProps<"/events/[slug]">) {
  return (
    <Suspense fallback={<EventSkeleton />}>
      <EventView params={props.params} />
    </Suspense>
  )
}

async function EventView({ params }: Pick<PageProps<"/events/[slug]">, "params">) {
  const slug = await resolveSlug(params)
  const result = await getTournamentBySlug(slug)

  if (!result.ok) {
    if (result.error.kind === "not-found") notFound()
    throw new Error(result.error.message)
  }

  const tournament = result.data
  const hasPrizes = tournament.standings.some((row) => row.prize !== null && row.prize > 0)
  const crumbs = trail({ label: "Турниры", href: "/events" }, { label: tournament.name })

  const brackets = tournament.stages.filter(
    (stage) => stage.hasBracket && stage.status !== "upcoming",
  )

  const navItems = [
    { id: "overview", label: "Обзор" },
    ...(brackets.length > 0 ? [{ id: "bracket", label: "Сетка" }] : []),
    ...(tournament.standings.length > 0 ? [{ id: "standings", label: "Таблица" }] : []),
    { id: "matches", label: "Матчи" },
    { id: "teams", label: "Участники" },
  ]

  return (
    <>
      <JsonLd data={buildTournamentJsonLd(tournament)} />
      <JsonLd data={breadcrumbsJsonLd(crumbs)} />

      <EventHero tournament={tournament} />

      <Container>
        <SectionNav items={navItems} label={`Разделы турнира ${tournament.name}`} />

        <Section spacing="md">
          <Stack gap="xl">
            <Stack gap="lg" id="overview">
              <Breadcrumbs items={crumbs} />
              <EventMeta tournament={tournament} />
              {hasPrizes ? (
                <PrizeDistribution
                  standings={tournament.standings}
                  currency={tournament.currency}
                />
              ) : null}
            </Stack>

            {tournament.standings.length > 0 ? (
              <div id="standings">
                <StandingsTable
                  standings={tournament.standings}
                  currency={tournament.currency}
                  title={tournament.status === "finished" ? "Итоговая таблица" : "Текущая таблица"}
                />
              </div>
            ) : null}

            {brackets.length > 0 ? (
              <div id="bracket" className="flex flex-col gap-8">
                {brackets.map((stage) => (
                  <Suspense key={stage.id} fallback={<TournamentBracketSkeleton />}>
                    <StageBracket stage={stage} />
                  </Suspense>
                ))}
              </div>
            ) : null}

            <Suspense fallback={<Skeleton variant="block" className="h-64 w-full" />}>
              <EventProfileBlock tournamentId={tournament.id} name={tournament.name} />
            </Suspense>

            <Suspense fallback={null}>
              <EventPlacements
                tournamentId={tournament.id}
                name={tournament.name}
                startsAt={tournament.startsAt}
              />
            </Suspense>

            <Suspense fallback={<Skeleton variant="block" className="h-56 w-full" />}>
              <EventMaps tournament={tournament} />
            </Suspense>

            <div id="matches">
              <Suspense fallback={<MatchCenterSkeleton rows={4} />}>
                <MatchCenter
                  kind="results"
                  tournamentSlug={tournament.slug}
                  title="Матчи турнира"
                  emptyLabel="Матчи ещё не сыграны"
                />
              </Suspense>
            </div>

            {tournament.teams.length > 0 ? (
              <section id="teams" className="flex flex-col gap-4">
                <Heading level={2} size="subheading">
                  Участники
                </Heading>
                <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {tournament.teams.map((team) => (
                    <li
                      key={team.id}
                      className={cn(
                        "rounded-control border border-border bg-surface px-4 py-3",
                        "transition-colors duration-150 hover:border-border-strong",
                      )}
                    >
                      <TeamIdentity
                        slug={team.slug}
                        name={team.name}
                        logo={team.logo}
                        darkLogo={team.darkLogo}
                        country={team.country}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </Stack>
        </Section>
      </Container>
    </>
  )
}

async function EventMaps({ tournament }: { tournament: Tournament }) {
  const [stats, catalogue] = await Promise.all([
    getEventMapStats(
      tournament.id,
      // Двоеточия и решётки в названии мешают поиску по вики.
      tournament.name.replace(/[:#]/g, " "),
      tournament.teams.flatMap((team) => [team.name, team.shortName]),
    ),
    getGameMaps(),
  ])

  return (
    <MapStats
      stats={stats.ok ? stats.data : EMPTY_EVENT_MAP_STATS}
      catalogue={catalogue.ok ? catalogue.data : []}
    />
  )
}

async function StageBracket({ stage }: { stage: TournamentStage }) {
  const result = await getTournamentBracket(stage.id, stage.name, stage.status)

  if (!result.ok || result.data === null) return null

  return <TournamentBracket bracket={result.data} />
}

function EventSkeleton() {
  return (
    <Container>
      <Section spacing="md">
        <div className="flex flex-col gap-6">
          <Skeleton variant="block" className="h-44 w-full" />
          <Skeleton variant="block" className="h-24 w-full" />
          <Skeleton variant="block" className="h-64 w-full" />
        </div>
      </Section>
    </Container>
  )
}
