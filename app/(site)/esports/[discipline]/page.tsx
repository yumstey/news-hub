import { Suspense } from "react"

import { disciplineSectionHref } from "@/entities/discipline"
import { Container, Section, Stack } from "@/shared/ui/container"
import { JsonLd } from "@/shared/ui/json-ld"
import { EsportsNews, EsportsNewsSkeleton } from "@/widgets/esports-news"
import { MatchCenter, MatchCenterSkeleton } from "@/widgets/match-center"
import { TeamRankings, TeamRankingsSkeleton } from "@/widgets/team-rankings"

import { breadcrumbsJsonLd, disciplineBreadcrumbs } from "./_lib/breadcrumbs"
import { DisciplineHeaderSection } from "./_lib/DisciplineHeaderSection"
import { resolveDiscipline } from "./_lib/discipline"
import type { DisciplineParams } from "./_lib/discipline"
import { sectionMetadata } from "./_lib/metadata"
import { DisciplineHeaderSkeleton } from "@/widgets/discipline-header"

type HubProps = PageProps<"/esports/[discipline]">

export function generateMetadata(props: HubProps) {
  return sectionMetadata(
    props.params,
    "overview",
    (discipline) => discipline.title,
    (discipline) => discipline.seo.description,
  )
}

export default function Page(props: HubProps) {
  return (
    <>
      <Suspense fallback={<DisciplineHeaderSkeleton />}>
        <DisciplineHeaderSection params={props.params} section="overview" headingLevel={1} />
      </Suspense>

      <Container>
        <Section spacing="md">
          <Stack gap="lg">
            <Suspense fallback={null}>
              <HubJsonLd params={props.params} />
            </Suspense>

            <Suspense fallback={<MatchCenterSkeleton rows={2} />}>
              <LiveBlock params={props.params} />
            </Suspense>

            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <Stack gap="lg">
                <Suspense fallback={<MatchCenterSkeleton />}>
                  <UpcomingBlock params={props.params} />
                </Suspense>

                <Suspense fallback={<MatchCenterSkeleton />}>
                  <ResultsBlock params={props.params} />
                </Suspense>

                <Suspense fallback={<EsportsNewsSkeleton count={3} />}>
                  <NewsBlock params={props.params} />
                </Suspense>
              </Stack>

              <Suspense fallback={<TeamRankingsSkeleton />}>
                <RankingBlock params={props.params} />
              </Suspense>
            </div>
          </Stack>
        </Section>
      </Container>
    </>
  )
}

async function HubJsonLd({ params }: { params: DisciplineParams }) {
  const discipline = await resolveDiscipline(params)
  const items = disciplineBreadcrumbs(discipline.slug, discipline.title)

  return <JsonLd data={breadcrumbsJsonLd(items)} />
}

async function LiveBlock({ params }: { params: DisciplineParams }) {
  const discipline = await resolveDiscipline(params)

  return (
    <MatchCenter
      disciplineSlug={discipline.slug}
      kind="live"
      title="Идут сейчас"
      emptyLabel="Сейчас нет матчей в прямом эфире"
    />
  )
}

async function UpcomingBlock({ params }: { params: DisciplineParams }) {
  const discipline = await resolveDiscipline(params)

  return (
    <MatchCenter
      disciplineSlug={discipline.slug}
      kind="upcoming"
      limit={5}
      title="Ближайшие матчи"
      moreHref={disciplineSectionHref(discipline.slug, "matches")}
    />
  )
}

async function ResultsBlock({ params }: { params: DisciplineParams }) {
  const discipline = await resolveDiscipline(params)

  return (
    <MatchCenter
      disciplineSlug={discipline.slug}
      kind="results"
      limit={5}
      title="Последние результаты"
      moreHref={disciplineSectionHref(discipline.slug, "results")}
      moreLabel="Все результаты"
    />
  )
}

async function NewsBlock({ params }: { params: DisciplineParams }) {
  const discipline = await resolveDiscipline(params)

  return (
    <EsportsNews
      disciplineSlug={discipline.slug}
      perPage={4}
      variant="list"
      title="Новости"
      showMore
    />
  )
}

async function RankingBlock({ params }: { params: DisciplineParams }) {
  const discipline = await resolveDiscipline(params)

  return (
    <TeamRankings
      disciplineSlug={discipline.slug}
      limit={8}
      title="Мировой рейтинг"
      showMore
      compact
    />
  )
}
