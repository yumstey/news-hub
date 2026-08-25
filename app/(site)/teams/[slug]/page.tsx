import { notFound } from "next/navigation"
import { Suspense } from "react"

import { getTeamNews, NewsCard } from "@/entities/news-item"
import { getTeamPlayers } from "@/entities/player"
import {
  EMPTY_PROFILE,
  getTeamAchievements,
  getTeamBySlug,
  getTeamProfile,
  getTeamRankHistory,
  RankTimeline,
} from "@/entities/team"
import type { Team } from "@/entities/team"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { JsonLd } from "@/shared/ui/json-ld"
import { Skeleton } from "@/shared/ui/skeleton"
import { SectionHeading } from "@/shared/ui/section-heading"
import { Text } from "@/shared/ui/typography"
import { MatchCenter, MatchCenterSkeleton } from "@/widgets/match-center"

import { breadcrumbsJsonLd, trail } from "../../_lib/breadcrumbs"
import { resolveSlug } from "../../_lib/params"
import { TeamProfile } from "./_ui/TeamProfile"
import { TeamRosterStrip, TeamRosterStripSkeleton } from "./_ui/TeamRosterStrip"
import { TeamTrophies } from "./_ui/TeamTrophies"

export { generateMetadata } from "./_lib/metadata"

export default function Page(props: PageProps<"/teams/[slug]">) {
  return (
    <Container>
      <Section spacing="md">
        <Stack gap="lg">
          <Suspense fallback={<TeamSkeleton />}>
            <TeamView params={props.params} />
          </Suspense>
        </Stack>
      </Section>
    </Container>
  )
}

async function TeamView({ params }: Pick<PageProps<"/teams/[slug]">, "params">) {
  const slug = await resolveSlug(params)
  const result = await getTeamBySlug(slug)

  if (!result.ok) {
    if (result.error.kind === "not-found") notFound()
    throw new Error(result.error.message)
  }

  const team = result.data
  const crumbs = trail({ label: "Команды", href: "/teams" }, { label: team.name })

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SportsTeam",
          name: team.name,
          alternateName: team.shortName,
          sport: "Counter-Strike 2",
          logo: team.logo.url,
        }}
      />
      <JsonLd data={breadcrumbsJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <Suspense fallback={<OverviewSkeleton />}>
        <Overview team={team} />
      </Suspense>

      <Suspense fallback={null}>
        <Trophies teamSlug={team.slug} teamId={team.id} />
      </Suspense>

      <Suspense fallback={null}>
        <TeamNews name={team.name} shortName={team.shortName} />
      </Suspense>

      <div className="grid gap-8 lg:grid-cols-2">
        <Suspense fallback={<MatchCenterSkeleton rows={3} />}>
          <MatchCenter
            kind="upcoming"
            teamSlug={team.slug}
            limit={5}
            title="Ближайшие матчи"
            emptyLabel="Ближайших матчей нет"
          />
        </Suspense>

        <Suspense fallback={<MatchCenterSkeleton rows={3} />}>
          <MatchCenter
            kind="results"
            teamSlug={team.slug}
            limit={5}
            title="Последние результаты"
            emptyLabel="Результатов пока нет"
          />
        </Suspense>
      </div>
    </>
  )
}

async function Overview({ team }: { team: Team }) {
  const [profileResult, playersResult, historyResult] = await Promise.all([
    getTeamProfile(team.name),
    getTeamPlayers(team.slug),
    getTeamRankHistory(team.name),
  ])

  const profile = profileResult.ok ? profileResult.data : EMPTY_PROFILE
  const players = playersResult.ok ? playersResult.data : []
  const history = historyResult.ok ? historyResult.data : []

  return (
    <>
      <TeamRosterStrip players={players} />
      <TeamProfile team={team} profile={profile} players={players} />
      {history.length < 2 ? null : (
        <section className="flex flex-col gap-3 rounded-surface border border-border bg-surface p-4 sm:p-5">
          <SectionHeading title="Место в рейтинге Valve" />
          <RankTimeline points={history} teamName={team.name} />
        </section>
      )}
      {profile.page === null ? null : (
        <Text size="caption" tone="subtle">
          Данные о тренерском штабе —{" "}
          <a
            href={profile.page}
            target="_blank"
            rel="noopener noreferrer external"
            className="text-primary underline-offset-2 hover:underline"
          >
            Liquipedia
          </a>
          , лицензия CC BY-SA 3.0.
        </Text>
      )}
    </>
  )
}

async function TeamNews({ name, shortName }: { name: string; shortName: string }) {
  const result = await getTeamNews(name, shortName)

  if (!result.ok || result.data.length === 0) return null

  return (
    <section className="flex flex-col gap-4">
      <SectionHeading title="Новости команды" />
      <ul className="flex flex-col gap-2">
        {result.data.map((item) => (
          <li key={item.id}>
            <NewsCard item={item} variant="row" />
          </li>
        ))}
      </ul>
    </section>
  )
}

async function Trophies({ teamSlug, teamId }: { teamSlug: string; teamId: string }) {
  const result = await getTeamAchievements(teamSlug, teamId)

  if (!result.ok) return null

  return <TeamTrophies achievements={result.data} />
}

function OverviewSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <TeamRosterStripSkeleton />
      <Skeleton variant="block" className="h-48 w-full" />
    </div>
  )
}

function TeamSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton variant="text" className="h-3 w-full max-w-72" />
      <TeamRosterStripSkeleton />
      <Skeleton variant="block" className="h-48 w-full" />
    </div>
  )
}
