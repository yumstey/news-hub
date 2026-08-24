import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { EsportsArticleCard, getArticleFeed } from "@/entities/article"
import { getTeamBySlug, RankingChange, TeamForm, teamHref } from "@/entities/team"
import { getTournaments, TournamentTierBadge, tournamentHref } from "@/entities/tournament"
import { SITE } from "@/shared/config"
import { formatDate } from "@/shared/lib/date"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { CountryTag } from "@/shared/ui/country-tag"
import { JsonLd } from "@/shared/ui/json-ld"
import { Separator } from "@/shared/ui/separator"
import { Skeleton } from "@/shared/ui/skeleton"
import { Heading, Text } from "@/shared/ui/typography"
import { DisciplineHeaderSkeleton } from "@/widgets/discipline-header"
import { MatchCenter, MatchCenterSkeleton } from "@/widgets/match-center"
import { TeamRoster, TeamRosterSkeleton } from "@/widgets/team-roster"

import { breadcrumbsJsonLd, disciplineBreadcrumbs } from "../../_lib/breadcrumbs"
import { DisciplineHeaderSection } from "../../_lib/DisciplineHeaderSection"
import { resolveDiscipline } from "../../_lib/discipline"
import { buildMetadata, loadDiscipline, NOT_FOUND_METADATA } from "../../_lib/metadata"

type TeamProps = PageProps<"/esports/[discipline]/teams/[slug]">

export async function generateMetadata(props: TeamProps) {
  const { discipline, slug } = await props.params
  const found = await loadDiscipline(props.params)

  if (found === null) return NOT_FOUND_METADATA

  const result = await getTeamBySlug(found.slug, slug)

  if (!result.ok) return NOT_FOUND_METADATA

  return buildMetadata(
    result.data.seo.title,
    result.data.seo.description,
    teamHref(discipline, slug),
  )
}

export default function Page(props: TeamProps) {
  return (
    <>
      <Suspense fallback={<DisciplineHeaderSkeleton />}>
        <DisciplineHeaderSection params={props.params} section="teams" />
      </Suspense>

      <Container>
        <Section spacing="md">
          <Stack gap="lg">
            <Suspense fallback={<TeamSkeleton />}>
              <TeamView params={props.params} />
            </Suspense>
          </Stack>
        </Section>
      </Container>
    </>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-control bg-muted px-4 py-3">
      <span className="text-subheading font-bold tabular-nums text-foreground">{value}</span>
      <span className="text-overline uppercase text-subtle-foreground">{label}</span>
    </div>
  )
}

async function TeamEvents({
  disciplineSlug,
  teamSlug,
}: {
  disciplineSlug: string
  teamSlug: string
}) {
  const result = await getTournaments(disciplineSlug)

  if (!result.ok) return null

  const events = result.data.filter((tournament) =>
    tournament.teams.some((team) => team.slug === teamSlug),
  )

  if (events.length === 0) return null

  return (
    <section className="flex flex-col gap-4">
      <Heading level={2} size="subheading">
        Турниры
      </Heading>
      <ul className="flex flex-col gap-2">
        {events.map((tournament) => (
          <li key={tournament.id}>
            <Link
              href={tournamentHref(disciplineSlug, tournament.slug)}
              className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-border bg-surface px-4 py-3 transition-colors duration-150 hover:border-border-strong hover:bg-muted/60"
            >
              <span className="flex min-w-0 items-center gap-3">
                <TournamentTierBadge tier={tournament.tier} />
                <span className="truncate text-sm font-medium text-foreground">
                  {tournament.name}
                </span>
              </span>
              <span className="text-caption tabular-nums text-muted-foreground">
                {formatDate(tournament.startsAt, SITE.locale)} —{" "}
                {formatDate(tournament.endsAt, SITE.locale)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

async function TeamNews({
  disciplineSlug,
  teamName,
}: {
  disciplineSlug: string
  teamName: string
}) {
  const result = await getArticleFeed({ module: "esports", tag: teamName, perPage: 3 })

  if (!result.ok || result.data.items.length === 0) return null

  return (
    <section className="flex flex-col gap-4">
      <Heading level={2} size="subheading">
        Новости команды
      </Heading>
      <ul className="flex flex-col gap-2">
        {result.data.items.map((article) => (
          <li key={article.id}>
            <EsportsArticleCard
              article={article}
              disciplineSlug={disciplineSlug}
              variant="row"
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

async function TeamView({ params }: Pick<TeamProps, "params">) {
  const { slug } = await params
  const discipline = await resolveDiscipline(params)
  const result = await getTeamBySlug(discipline.slug, slug)

  if (!result.ok) {
    if (result.error.kind === "not-found") notFound()
    throw new Error(result.error.message)
  }

  const team = result.data
  const crumbs = disciplineBreadcrumbs(discipline.slug, discipline.title, [
    { label: "Команды", section: "teams" },
    { label: team.name },
  ])

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SportsTeam",
          name: team.name,
          alternateName: team.shortName,
          foundingDate: String(team.foundedYear),
          sport: discipline.title,
          logo: team.logo.url,
        }}
      />
      <JsonLd data={breadcrumbsJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <header className="flex flex-col gap-6 rounded-surface border border-border bg-surface p-6">
        <div className="flex flex-wrap items-center gap-4">
          <Image
            src={team.logo.url}
            alt={team.logo.alt}
            width={72}
            height={72}
            className="size-18 rounded-control object-contain"
          />
          <div className="flex min-w-0 flex-col gap-1">
            <Heading level={1} size="title">
              {team.name}
            </Heading>
            <div className="flex flex-wrap items-center gap-3">
              <CountryTag
                country={team.country}
                showName
                className="text-caption text-muted-foreground"
              />
              <Text as="span" size="caption" tone="subtle">
                {team.region} · с {team.foundedYear} года
              </Text>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="flex items-center gap-2">
              <span className="text-overline uppercase text-subtle-foreground">Ранг</span>
              <span className="text-title font-bold tabular-nums text-foreground">
                {team.worldRanking ?? "—"}
              </span>
              <RankingChange change={team.rankingChange} />
            </span>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatTile label="Очки рейтинга" value={String(team.rankingPoints)} />
          <StatTile label="Победы" value={String(team.stats.matchesWon)} />
          <StatTile label="Поражения" value={String(team.stats.matchesLost)} />
          <StatTile label="Винрейт" value={`${team.stats.winRate}%`} />
          <StatTile label="Раунды" value={`${team.stats.roundWinRate}%`} />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-overline uppercase text-subtle-foreground">Форма</span>
          <TeamForm form={team.recentForm} />
        </div>
      </header>

      <Suspense fallback={<TeamRosterSkeleton />}>
        <TeamRoster disciplineSlug={discipline.slug} teamSlug={team.slug} />
      </Suspense>

      <div className="grid gap-8 lg:grid-cols-2">
        <Suspense fallback={<MatchCenterSkeleton rows={3} />}>
          <MatchCenter
            disciplineSlug={discipline.slug}
            kind="upcoming"
            teamSlug={team.slug}
            limit={5}
            title="Ближайшие матчи"
            emptyLabel="Ближайших матчей нет"
          />
        </Suspense>

        <Suspense fallback={<MatchCenterSkeleton rows={3} />}>
          <MatchCenter
            disciplineSlug={discipline.slug}
            kind="results"
            teamSlug={team.slug}
            limit={5}
            title="Последние результаты"
            emptyLabel="Результатов пока нет"
          />
        </Suspense>
      </div>

      <Suspense fallback={null}>
        <TeamEvents disciplineSlug={discipline.slug} teamSlug={team.slug} />
      </Suspense>

      <Suspense fallback={null}>
        <TeamNews disciplineSlug={discipline.slug} teamName={team.name} />
      </Suspense>
    </>
  )
}

function TeamSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton variant="text" className="h-3 w-72" />
      <Skeleton variant="block" className="h-56 w-full" />
      <Skeleton variant="block" className="h-40 w-full" />
    </div>
  )
}
