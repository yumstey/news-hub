import { ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"

import { disciplineSectionHref, getDisciplines } from "@/entities/discipline"
import { ROUTES } from "@/shared/config"
import { buildBreadcrumbJsonLd } from "@/shared/lib/seo"
import { absoluteUrl } from "@/shared/lib/url"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { EmptyState } from "@/shared/ui/empty-state"
import { JsonLd } from "@/shared/ui/json-ld"
import { Heading, Text } from "@/shared/ui/typography"
import { EsportsNews, EsportsNewsSkeleton } from "@/widgets/esports-news"
import { MatchCenter, MatchCenterSkeleton } from "@/widgets/match-center"
import { TeamRankings, TeamRankingsSkeleton } from "@/widgets/team-rankings"

export { generateMetadata } from "./_lib/metadata"

const TITLE = "Киберспорт"
const DESCRIPTION =
  "Матчи, результаты, мировой рейтинг команд, составы и статистика игроков. Сейчас в разделе — Counter-Strike 2."

const BREADCRUMBS = [
  { label: "Главная", href: ROUTES.home },
  { label: TITLE, href: ROUTES.esports },
] as const

export default function Page() {
  return (
    <Container>
      <Section spacing="lg">
        <JsonLd
          data={buildBreadcrumbJsonLd(
            BREADCRUMBS.map((item) => ({ name: item.label, url: absoluteUrl(item.href) })),
          )}
        />

        <Stack gap="lg">
          <Breadcrumbs items={BREADCRUMBS} />

          <Stack gap="sm">
            <Heading level={1}>{TITLE}</Heading>
            <Text size="lead" tone="muted" className="max-w-content">
              {DESCRIPTION}
            </Text>
          </Stack>

          <Suspense fallback={<DisciplineGridSkeleton />}>
            <DisciplineGrid />
          </Suspense>

          <Suspense fallback={<MatchCenterSkeleton rows={2} />}>
            <MatchCenter
              disciplineSlug="cs2"
              kind="live"
              title="Идут сейчас"
              emptyLabel="Сейчас нет матчей в прямом эфире"
            />
          </Suspense>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <Stack gap="lg">
              <Suspense fallback={<MatchCenterSkeleton />}>
                <MatchCenter
                  disciplineSlug="cs2"
                  kind="upcoming"
                  limit={5}
                  title="Ближайшие матчи"
                  moreHref={disciplineSectionHref("cs2", "matches")}
                />
              </Suspense>

              <Suspense fallback={<EsportsNewsSkeleton count={3} />}>
                <EsportsNews
                  disciplineSlug="cs2"
                  perPage={3}
                  title="Новости киберспорта"
                  showMore
                />
              </Suspense>
            </Stack>

            <Suspense fallback={<TeamRankingsSkeleton rows={5} />}>
              <TeamRankings
                disciplineSlug="cs2"
                limit={5}
                title="Мировой рейтинг"
                showMore
                compact
              />
            </Suspense>
          </div>
        </Stack>
      </Section>
    </Container>
  )
}

async function DisciplineGrid() {
  const result = await getDisciplines()

  if (!result.ok) {
    return (
      <EmptyState
        tone="danger"
        title="Дисциплины недоступны"
        description={result.error.message}
      />
    )
  }

  if (result.data.length === 0) {
    return <EmptyState title="Дисциплины пока не подключены" />
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {result.data.map((discipline) => (
        <li key={discipline.id}>
          <Link
            href={disciplineSectionHref(discipline.slug, "overview")}
            className="flex h-full items-center gap-4 rounded-surface border border-border bg-surface p-5 transition-colors duration-150 hover:border-border-strong hover:bg-muted/60"
          >
            <Image
              src={discipline.logo.url}
              alt={discipline.logo.alt}
              width={64}
              height={64}
              className="size-14 shrink-0 rounded-control object-cover"
            />
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate text-subheading text-foreground">{discipline.title}</span>
              <Text as="span" size="caption" tone="muted" clamp={2}>
                {discipline.description}
              </Text>
            </span>
            <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-subtle-foreground" />
          </Link>
        </li>
      ))}
    </ul>
  )
}

function DisciplineGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="h-24 rounded-surface border border-border bg-skeleton" />
    </div>
  )
}
