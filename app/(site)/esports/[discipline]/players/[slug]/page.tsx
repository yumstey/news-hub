import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import {
  buildPlayerJsonLd,
  getPlayerBySlug,
  PLAYER_ROLE_LABEL,
  playerHref,
} from "@/entities/player"
import { teamHref } from "@/entities/team"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { CountryTag } from "@/shared/ui/country-tag"
import { JsonLd } from "@/shared/ui/json-ld"
import { Separator } from "@/shared/ui/separator"
import { Skeleton } from "@/shared/ui/skeleton"
import { Avatar } from "@/shared/ui/avatar"
import { Heading, Text } from "@/shared/ui/typography"
import { DisciplineHeaderSkeleton } from "@/widgets/discipline-header"
import { MatchCenter, MatchCenterSkeleton } from "@/widgets/match-center"

import { breadcrumbsJsonLd, disciplineBreadcrumbs } from "../../_lib/breadcrumbs"
import { DisciplineHeaderSection } from "../../_lib/DisciplineHeaderSection"
import { resolveDiscipline } from "../../_lib/discipline"
import { buildMetadata, loadDiscipline, NOT_FOUND_METADATA } from "../../_lib/metadata"

type PlayerProps = PageProps<"/esports/[discipline]/players/[slug]">

export async function generateMetadata(props: PlayerProps) {
  const { discipline, slug } = await props.params
  const found = await loadDiscipline(props.params)

  if (found === null) return NOT_FOUND_METADATA

  const result = await getPlayerBySlug(found.slug, slug)

  if (!result.ok) return NOT_FOUND_METADATA

  return buildMetadata(
    result.data.seo.title,
    result.data.seo.description,
    playerHref(discipline, slug),
  )
}

export default function Page(props: PlayerProps) {
  return (
    <>
      <Suspense fallback={<DisciplineHeaderSkeleton />}>
        <DisciplineHeaderSection params={props.params} section="players" />
      </Suspense>

      <Container>
        <Section spacing="md">
          <Stack gap="lg">
            <Suspense fallback={<PlayerSkeleton />}>
              <PlayerView params={props.params} />
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

async function PlayerView({ params }: Pick<PlayerProps, "params">) {
  const { slug } = await params
  const discipline = await resolveDiscipline(params)
  const result = await getPlayerBySlug(discipline.slug, slug)

  if (!result.ok) {
    if (result.error.kind === "not-found") notFound()
    throw new Error(result.error.message)
  }

  const player = result.data
  const crumbs = disciplineBreadcrumbs(discipline.slug, discipline.title, [
    { label: "Игроки", section: "players" },
    { label: player.nickname },
  ])

  return (
    <>
      <JsonLd data={buildPlayerJsonLd(player)} />
      <JsonLd data={breadcrumbsJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <header className="flex flex-col gap-6 rounded-surface border border-border bg-surface p-6">
        <div className="flex flex-wrap items-center gap-5">
          <Avatar name={player.nickname} src={player.photo?.url} size="xl" shape="rounded" />

          <div className="flex min-w-0 flex-col gap-1.5">
            <Heading level={1} size="title">
              {player.nickname}
            </Heading>
            <Text size="lead" tone="muted">
              {player.realName}
            </Text>
            <div className="flex flex-wrap items-center gap-3">
              <CountryTag
                country={player.country}
                showName
                className="text-caption text-muted-foreground"
              />
              <Text as="span" size="caption" tone="subtle">
                {player.age} лет · {PLAYER_ROLE_LABEL[player.role]}
              </Text>
            </div>
          </div>

          {player.team ? (
            <Link
              href={teamHref(discipline.slug, player.team.slug)}
              className="ml-auto flex items-center gap-3 rounded-control border border-border px-4 py-3 transition-colors duration-150 hover:border-border-strong hover:bg-muted"
            >
              <Image
                src={player.team.logo.url}
                alt={player.team.logo.alt}
                width={40}
                height={40}
                className="size-10 rounded-sm object-contain"
              />
              <span className="flex flex-col">
                <span className="text-overline uppercase text-subtle-foreground">Команда</span>
                <span className="text-sm font-semibold text-foreground">{player.team.name}</span>
              </span>
            </Link>
          ) : null}
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          <StatTile label="Рейтинг" value={player.stats.rating.toFixed(2)} />
          <StatTile label="K/D" value={player.stats.kd.toFixed(2)} />
          <StatTile label="ADR" value={player.stats.adr.toFixed(1)} />
          <StatTile label="KAST" value={`${player.stats.kast.toFixed(1)}%`} />
          <StatTile label="HS" value={`${player.stats.headshots.toFixed(1)}%`} />
          <StatTile label="Impact" value={player.stats.impact.toFixed(2)} />
          <StatTile label="Карты" value={String(player.stats.mapsPlayed)} />
        </div>
      </header>

      {player.achievements.length > 0 ? (
        <section className="flex flex-col gap-4">
          <Heading level={2} size="subheading">
            Достижения
          </Heading>
          <ul className="flex flex-col gap-2">
            {player.achievements.map((achievement) => (
              <li
                key={`${achievement.event}-${achievement.year}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-border bg-surface px-4 py-3"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {achievement.event}
                  </span>
                  <span className="text-caption text-muted-foreground">{achievement.title}</span>
                </span>
                <span className="flex items-center gap-3 text-caption tabular-nums text-muted-foreground">
                  <span className="font-semibold text-foreground">{achievement.placement}</span>
                  <span>{achievement.year}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {player.team ? (
        <Suspense fallback={<MatchCenterSkeleton rows={3} />}>
          <MatchCenter
            disciplineSlug={discipline.slug}
            kind="upcoming"
            teamSlug={player.team.slug}
            limit={4}
            title="Ближайшие матчи команды"
            emptyLabel="Ближайших матчей нет"
          />
        </Suspense>
      ) : null}
    </>
  )
}

function PlayerSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton variant="text" className="h-3 w-72" />
      <Skeleton variant="block" className="h-56 w-full" />
      <Skeleton variant="block" className="h-40 w-full" />
    </div>
  )
}
