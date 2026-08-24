import { CalendarDays, MapPin, Trophy, Users } from "lucide-react"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { getTournamentMatches } from "@/entities/match"
import type { Match } from "@/entities/match"
import { TeamIdentity } from "@/entities/team"
import {
  buildTournamentJsonLd,
  formatPrize,
  getTournamentBySlug,
  TOURNAMENT_STATUS_LABEL,
  TournamentTierBadge,
  tournamentHref,
} from "@/entities/tournament"
import type { Tournament } from "@/entities/tournament"
import type { Discipline } from "@/entities/discipline"
import { SITE } from "@/shared/config"
import { formatDate } from "@/shared/lib/date"
import { cn } from "@/shared/lib/style"
import { Badge } from "@/shared/ui/badge"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { CountryTag } from "@/shared/ui/country-tag"
import { JsonLd } from "@/shared/ui/json-ld"
import { SectionNav } from "@/shared/ui/section-nav"
import { Skeleton } from "@/shared/ui/skeleton"
import { Heading, Text } from "@/shared/ui/typography"
import { DisciplineHeaderSkeleton } from "@/widgets/discipline-header"
import { MatchCenter, MatchCenterSkeleton } from "@/widgets/match-center"
import { PrizeDistribution } from "@/widgets/prize-distribution"
import { StandingsTable } from "@/widgets/standings-table"
import { TournamentBracket } from "@/widgets/tournament-bracket"

import { breadcrumbsJsonLd, disciplineBreadcrumbs } from "../../_lib/breadcrumbs"
import { DisciplineHeaderSection } from "../../_lib/DisciplineHeaderSection"
import { resolveDiscipline } from "../../_lib/discipline"
import { buildMetadata, loadDiscipline, NOT_FOUND_METADATA } from "../../_lib/metadata"

type EventProps = PageProps<"/esports/[discipline]/events/[slug]">

export async function generateMetadata(props: EventProps) {
  const { discipline, slug } = await props.params
  const found = await loadDiscipline(props.params)

  if (found === null) return NOT_FOUND_METADATA

  const result = await getTournamentBySlug(found.slug, slug)

  if (!result.ok) return NOT_FOUND_METADATA

  return buildMetadata(
    result.data.seo.title,
    result.data.seo.description,
    tournamentHref(discipline, slug),
  )
}

export default function Page(props: EventProps) {
  return (
    <>
      <Suspense fallback={<DisciplineHeaderSkeleton />}>
        <DisciplineHeaderSection params={props.params} section="events" />
      </Suspense>

      <Suspense fallback={<EventSkeleton />}>
        <EventView params={props.params} />
      </Suspense>
    </>
  )
}

const statusVariant = {
  ongoing: "live",
  upcoming: "soft",
  finished: "neutral",
} as const

function EventHero({
  tournament,
  discipline,
}: {
  tournament: Tournament
  discipline: Discipline
}) {
  return (
    <div className="relative overflow-hidden border-b border-border bg-foreground/95">
      <Image
        src={discipline.logo.url}
        alt=""
        width={360}
        height={360}
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-16 size-72 rotate-6 object-contain opacity-15"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-r from-foreground via-foreground/80 to-transparent"
      />

      <Container className="relative flex flex-col gap-5 py-10">
        <div className="flex flex-wrap items-center gap-2">
          <TournamentTierBadge tier={tournament.tier} />
          <Badge
            variant={statusVariant[tournament.status]}
            dot={tournament.status === "ongoing"}
            pulse={tournament.status === "ongoing"}
          >
            {TOURNAMENT_STATUS_LABEL[tournament.status]}
          </Badge>
        </div>

        <div className="flex flex-col gap-2">
          <Heading level={1} size="display" className="text-background">
            {tournament.name}
          </Heading>
          <Text size="lead" className="max-w-content text-background/70">
            {tournament.description}
          </Text>
        </div>
      </Container>
    </div>
  )
}

function MetaTile({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <span aria-hidden="true" className="mt-0.5 text-subtle-foreground">
        {icon}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-overline uppercase tracking-wider text-subtle-foreground">
          {label}
        </span>
        <span className="text-sm font-semibold text-foreground">{children}</span>
      </span>
    </div>
  )
}

function EventMeta({ tournament }: { tournament: Tournament }) {
  return (
    <div className="grid divide-y divide-border overflow-hidden rounded-surface border border-border bg-surface sm:grid-cols-2 sm:divide-x lg:grid-cols-4 lg:divide-y-0">
      <MetaTile icon={<CalendarDays className="size-4" />} label="Даты">
        <span className="tabular-nums">
          {formatDate(tournament.startsAt, SITE.locale)} —{" "}
          {formatDate(tournament.endsAt, SITE.locale)}
        </span>
      </MetaTile>
      <MetaTile icon={<Trophy className="size-4" />} label="Призовой фонд">
        <span className="tabular-nums">
          {formatPrize(tournament.prizePool, tournament.currency, SITE.locale)}
        </span>
      </MetaTile>
      <MetaTile icon={<Users className="size-4" />} label="Команды">
        <span className="tabular-nums">{tournament.teams.length}</span>
      </MetaTile>
      <MetaTile icon={<MapPin className="size-4" />} label="Площадка">
        <span className="flex items-center gap-2">
          {tournament.location.city}
          <CountryTag country={tournament.location.country} />
        </span>
      </MetaTile>
    </div>
  )
}

async function EventView({ params }: Pick<EventProps, "params">) {
  const { slug } = await params
  const discipline = await resolveDiscipline(params)
  const result = await getTournamentBySlug(discipline.slug, slug)

  if (!result.ok) {
    if (result.error.kind === "not-found") notFound()
    throw new Error(result.error.message)
  }

  const tournament = result.data
  const matchesResult = await getTournamentMatches(discipline.slug, tournament.slug)
  const matches: Match[] = matchesResult.ok ? matchesResult.data : []
  const hasBracket = matches.some((match) => match.bracket !== null)
  const hasPrizes = tournament.standings.some((row) => row.prize > 0)

  const crumbs = disciplineBreadcrumbs(discipline.slug, discipline.title, [
    { label: "Турниры", section: "events" },
    { label: tournament.name },
  ])

  const navItems = [
    { id: "overview", label: "Обзор" },
    ...(hasBracket ? [{ id: "bracket", label: "Сетка" }] : []),
    ...(tournament.standings.length > 0 ? [{ id: "standings", label: "Таблица" }] : []),
    { id: "matches", label: "Матчи" },
    { id: "teams", label: "Участники" },
  ]

  return (
    <>
      <JsonLd data={buildTournamentJsonLd(tournament)} />
      <JsonLd data={breadcrumbsJsonLd(crumbs)} />

      <EventHero tournament={tournament} discipline={discipline} />

      <Container>
        <SectionNav items={navItems} label={`Разделы турнира ${tournament.name}`} />

        <Section spacing="md">
          <Stack gap="xl">
            <Stack gap="lg" id="overview">
              <Breadcrumbs items={crumbs} />
              <EventMeta tournament={tournament} />
              {hasPrizes ? (
                <PrizeDistribution
                  disciplineSlug={discipline.slug}
                  standings={tournament.standings}
                  currency={tournament.currency}
                />
              ) : null}
            </Stack>

            {hasBracket ? (
              <div id="bracket">
                <TournamentBracket matches={matches} />
              </div>
            ) : null}

            {tournament.standings.length > 0 ? (
              <div id="standings">
                <StandingsTable
                  disciplineSlug={discipline.slug}
                  standings={tournament.standings}
                  currency={tournament.currency}
                  title={tournament.status === "finished" ? "Итоговая таблица" : "Текущая таблица"}
                />
              </div>
            ) : null}

            <div id="matches">
              <Suspense fallback={<MatchCenterSkeleton rows={4} />}>
                <MatchCenter
                  disciplineSlug={discipline.slug}
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
                        disciplineSlug={discipline.slug}
                        slug={team.slug}
                        name={team.name}
                        logo={team.logo}
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
