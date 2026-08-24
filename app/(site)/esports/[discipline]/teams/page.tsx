import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"

import { getTeams, RankingChange, TeamForm, teamHref } from "@/entities/team"
import { cn } from "@/shared/lib/style"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { CountryTag } from "@/shared/ui/country-tag"
import { EmptyState } from "@/shared/ui/empty-state"
import { JsonLd } from "@/shared/ui/json-ld"
import { Heading, Text } from "@/shared/ui/typography"
import { DisciplineHeaderSkeleton } from "@/widgets/discipline-header"

import { breadcrumbsJsonLd, disciplineBreadcrumbs } from "../_lib/breadcrumbs"
import { DisciplineHeaderSection } from "../_lib/DisciplineHeaderSection"
import { resolveDiscipline } from "../_lib/discipline"
import type { DisciplineParams } from "../_lib/discipline"
import { sectionMetadata } from "../_lib/metadata"

type TeamsProps = PageProps<"/esports/[discipline]/teams">

export function generateMetadata(props: TeamsProps) {
  return sectionMetadata(
    props.params,
    "teams",
    (discipline) => `Команды ${discipline.shortTitle}`,
    (discipline) =>
      `Команды ${discipline.title}: место в мировом рейтинге, регион, состав и статистика выступлений.`,
  )
}

export default function Page(props: TeamsProps) {
  return (
    <>
      <Suspense fallback={<DisciplineHeaderSkeleton />}>
        <DisciplineHeaderSection params={props.params} section="teams" />
      </Suspense>

      <Container>
        <Section spacing="md">
          <Stack gap="lg">
            <Suspense fallback={<TeamsGridSkeleton />}>
              <TeamsContent params={props.params} />
            </Suspense>
          </Stack>
        </Section>
      </Container>
    </>
  )
}

async function TeamsContent({ params }: { params: DisciplineParams }) {
  const discipline = await resolveDiscipline(params)
  const crumbs = disciplineBreadcrumbs(discipline.slug, discipline.title, [{ label: "Команды" }])
  const result = await getTeams(discipline.slug)

  return (
    <>
      <JsonLd data={breadcrumbsJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <Stack gap="sm">
        <Heading level={1} size="title">
          Команды {discipline.shortTitle} 
        </Heading>
        <Text size="caption" tone="muted" className="max-w-content">
          Профили команд с местом в мировом рейтинге, регионом, формой последних матчей и
          статистикой сезона.
        </Text>
      </Stack>

      {!result.ok ? (
        <EmptyState
          tone="danger"
          title="Команды недоступны"
          description={result.error.message}
        />
      ) : result.data.length === 0 ? (
        <EmptyState title="Команд пока нет" />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {result.data.map((team) => (
            <li key={team.id}>
              <Link
                href={teamHref(discipline.slug, team.slug)}
                className="flex h-full flex-col gap-4 rounded-surface border border-border bg-surface p-5 transition-colors duration-150 hover:border-border-strong hover:bg-muted/60"
              >
                <span className="flex items-center gap-3">
                  <Image
                    src={team.logo.url}
                    alt={team.logo.alt}
                    width={48}
                    height={48}
                    className="size-12 shrink-0 rounded-control object-contain"
                  />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-subheading text-foreground">{team.name}</span>
                    <CountryTag
                      country={team.country}
                      showName
                      className="text-caption text-muted-foreground"
                    />
                  </span>
                </span>

                <span className="flex items-center justify-between gap-3 border-t border-border pt-3">
                  <span className="flex items-center gap-2">
                    <span className="text-overline uppercase text-subtle-foreground">Ранг</span>
                    <span className="text-sm font-bold tabular-nums text-foreground">
                      {team.worldRanking ?? "—"}
                    </span>
                    <RankingChange change={team.rankingChange} />
                  </span>
                  <TeamForm form={team.recentForm} />
                </span>

                <span className="grid grid-cols-3 gap-2 text-center">
                  <Stat label="Победы" value={String(team.stats.matchesWon)} />
                  <Stat label="Винрейт" value={`${team.stats.winRate}%`} />
                  <Stat label="Очки" value={String(team.rankingPoints)} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function Stat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <span className={cn("flex flex-col gap-0.5 rounded-control bg-muted px-2 py-2", className)}>
      <span className="text-sm font-bold tabular-nums text-foreground">{value}</span>
      <span className="text-overline uppercase text-subtle-foreground">{label}</span>
    </span>
  )
}

function TeamsGridSkeleton() {
  const items = Array.from({ length: 6 }, (_, index) => index)

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div key={item} className="h-52 rounded-surface border border-border bg-skeleton" />
      ))}
    </div>
  )
}
