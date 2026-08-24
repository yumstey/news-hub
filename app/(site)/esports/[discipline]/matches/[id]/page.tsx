import { notFound } from "next/navigation"
import { Suspense } from "react"

import { buildMatchJsonLd, getMatchById, matchHref } from "@/entities/match"
import { getTeamBySlug, TeamForm } from "@/entities/team"
import type { Team } from "@/entities/team"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { JsonLd } from "@/shared/ui/json-ld"
import { Skeleton } from "@/shared/ui/skeleton"
import { Heading, Text } from "@/shared/ui/typography"
import { DisciplineHeaderSkeleton } from "@/widgets/discipline-header"
import { MatchLineups, MatchScoreboard, MatchStatistics } from "@/widgets/match-scoreboard"

import { breadcrumbsJsonLd, disciplineBreadcrumbs } from "../../_lib/breadcrumbs"
import { DisciplineHeaderSection } from "../../_lib/DisciplineHeaderSection"
import { resolveDiscipline } from "../../_lib/discipline"
import { buildMetadata, loadDiscipline, NOT_FOUND_METADATA } from "../../_lib/metadata"

type MatchProps = PageProps<"/esports/[discipline]/matches/[id]">

export async function generateMetadata(props: MatchProps) {
  const { discipline, id } = await props.params
  const found = await loadDiscipline(props.params)

  if (found === null) return NOT_FOUND_METADATA

  const result = await getMatchById(found.slug, id)

  if (!result.ok) return NOT_FOUND_METADATA

  const [first, second] = result.data.teams
  const title = `${first.team.name} — ${second.team.name}`

  return buildMetadata(
    title,
    `${title} на ${result.data.tournament.name}: счёт, карты, составы и статистика игроков.`,
    matchHref(discipline, id),
  )
}

export default function Page(props: MatchProps) {
  return (
    <>
      <Suspense fallback={<DisciplineHeaderSkeleton />}>
        <DisciplineHeaderSection params={props.params} section="matches" />
      </Suspense>

      <Container>
        <Section spacing="md">
          <Stack gap="lg">
            <Suspense fallback={<MatchSkeleton />}>
              <MatchView params={props.params} />
            </Suspense>
          </Stack>
        </Section>
      </Container>
    </>
  )
}

function FormCard({ team }: { team: Team }) {
  return (
    <div className="flex flex-col gap-3 rounded-surface border border-border bg-surface p-5">
      <Heading level={3} size="subheading" className="text-sm">
        {team.name}
      </Heading>
      <TeamForm form={team.recentForm} />
      <dl className="grid grid-cols-3 gap-2 text-center">
        <div className="flex flex-col gap-0.5 rounded-control bg-muted px-2 py-2">
          <dd className="text-sm font-bold tabular-nums text-foreground">
            {team.worldRanking ?? "—"}
          </dd>
          <dt className="text-overline uppercase text-subtle-foreground">Ранг</dt>
        </div>
        <div className="flex flex-col gap-0.5 rounded-control bg-muted px-2 py-2">
          <dd className="text-sm font-bold tabular-nums text-foreground">
            {team.stats.winRate}%
          </dd>
          <dt className="text-overline uppercase text-subtle-foreground">Винрейт</dt>
        </div>
        <div className="flex flex-col gap-0.5 rounded-control bg-muted px-2 py-2">
          <dd className="text-sm font-bold tabular-nums text-foreground">
            {team.stats.roundWinRate}%
          </dd>
          <dt className="text-overline uppercase text-subtle-foreground">Раунды</dt>
        </div>
      </dl>
    </div>
  )
}

async function RecentForm({
  disciplineSlug,
  firstSlug,
  secondSlug,
}: {
  disciplineSlug: string
  firstSlug: string
  secondSlug: string
}) {
  const [first, second] = await Promise.all([
    getTeamBySlug(disciplineSlug, firstSlug),
    getTeamBySlug(disciplineSlug, secondSlug),
  ])

  if (!first.ok || !second.ok) return null

  return (
    <section className="flex flex-col gap-4">
      <Heading level={2} size="subheading">
        Форма команд
      </Heading>
      <div className="grid gap-4 md:grid-cols-2">
        <FormCard team={first.data} />
        <FormCard team={second.data} />
      </div>
    </section>
  )
}

async function MatchView({ params }: Pick<MatchProps, "params">) {
  const { id } = await params
  const discipline = await resolveDiscipline(params)
  const result = await getMatchById(discipline.slug, id)

  if (!result.ok) {
    if (result.error.kind === "not-found") notFound()
    throw new Error(result.error.message)
  }

  const match = result.data
  const [first, second] = match.teams
  const crumbs = disciplineBreadcrumbs(discipline.slug, discipline.title, [
    { label: "Матчи", section: "matches" },
    { label: `${first.team.shortName} — ${second.team.shortName}` },
  ])

  return (
    <>
      <JsonLd data={buildMatchJsonLd(match)} />
      <JsonLd data={breadcrumbsJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <Heading level={1} size="title" className="sr-only">
        {first.team.name} — {second.team.name}, {match.tournament.name}
      </Heading>

      <MatchScoreboard match={match} />

      <Suspense fallback={null}>
        <RecentForm
          disciplineSlug={discipline.slug}
          firstSlug={first.team.slug}
          secondSlug={second.team.slug}
        />
      </Suspense>

      <MatchLineups match={match} />

      {match.statistics === null ? (
        <Text size="caption" tone="subtle">
          Подробная статистика игроков для этого матча не публиковалась.
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
      <Skeleton variant="text" className="h-3 w-72" />
      <Skeleton variant="block" className="h-64 w-full" />
      <Skeleton variant="block" className="h-48 w-full" />
    </div>
  )
}
