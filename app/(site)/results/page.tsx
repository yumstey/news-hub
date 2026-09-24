import { Suspense } from "react"

import { ROUTES } from "@/shared/config"
import { AdSlot } from "@/shared/ui/ad-slot"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { JsonLd } from "@/shared/ui/json-ld"
import { HeroLinks, SectionHero } from "@/widgets/game-hub"
import {
  MatchCenter,
  MatchFilterBar,
  parseMatchFilter,
  ScheduleSkeleton,
  SpotlightMatch,
  SpotlightMatchSkeleton,
} from "@/widgets/match-center"
import { OngoingEvents, RankingSnapshot, SidebarCardSkeleton } from "@/widgets/match-sidebar"

import { breadcrumbsJsonLd, trail } from "../_lib/breadcrumbs"
import { RESULTS_DESCRIPTION, RESULTS_TITLE } from "./_lib/metadata"

export { generateMetadata } from "./_lib/metadata"

const CRUMBS = trail({ label: "Результаты" })

async function Results({ searchParams }: { searchParams: PageProps<"/results">["searchParams"] }) {
  const active = parseMatchFilter((await searchParams).filter)

  return (
    <section className="flex flex-col gap-4">
      <MatchFilterBar title="Последние матчи" basePath={ROUTES.results} active={active} />
      <MatchCenter
        kind="results"
        grouped
        limit={100}
        filter={active}
        emptyLabel={active === "top" ? "Важных матчей за последние дни нет" : "Результатов пока нет"}
      />
    </section>
  )
}

const HERO_LINKS = [
  { label: "Матчи", href: ROUTES.matches },
  { label: "Турниры", href: ROUTES.events },
  { label: "Рейтинг Valve", href: ROUTES.rankings },
] as const

export default function Page(props: PageProps<"/results">) {
  return (
    <>
      <JsonLd data={breadcrumbsJsonLd(CRUMBS)} />

      <SectionHero
        scene="results"
        crumbs={<Breadcrumbs items={CRUMBS} />}
        title={RESULTS_TITLE}
        description={RESULTS_DESCRIPTION}
        actions={<HeroLinks links={HERO_LINKS} />}
        aside={
          <Suspense fallback={<SpotlightMatchSkeleton />}>
            <SpotlightMatch />
          </Suspense>
        }
      />

      <Container>
        <Section spacing="md">
          <Stack gap="lg">
            <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <Suspense
                fallback={
                  <section className="flex flex-col gap-4">
                    <MatchFilterBar title="Последние матчи" basePath={ROUTES.results} active="all" />
                    <ScheduleSkeleton />
                  </section>
                }
              >
                <Results searchParams={props.searchParams} />
              </Suspense>

              <aside aria-label="Турниры и рейтинг" className="flex min-w-0 flex-col gap-6">
                <Suspense fallback={<SidebarCardSkeleton rows={10} />}>
                  <RankingSnapshot />
                </Suspense>
                <Suspense fallback={<SidebarCardSkeleton rows={6} />}>
                  <OngoingEvents />
                </Suspense>
                <AdSlot slot="sidebar" />
              </aside>
            </div>
          </Stack>
        </Section>
      </Container>
    </>
  )
}
