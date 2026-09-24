import { Suspense } from "react"

import { ROUTES } from "@/shared/config"
import { AdSlot } from "@/shared/ui/ad-slot"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { JsonLd } from "@/shared/ui/json-ld"
import { HeroLinks, SectionHero } from "@/widgets/game-hub"
import {
  MatchCenter,
  MatchCenterSkeleton,
  MatchFilterBar,
  parseMatchFilter,
  ScheduleSkeleton,
  SpotlightMatch,
  SpotlightMatchSkeleton,
} from "@/widgets/match-center"
import { OngoingEvents, RankingSnapshot, SidebarCardSkeleton } from "@/widgets/match-sidebar"

import { breadcrumbsJsonLd, trail } from "../_lib/breadcrumbs"
import { MATCHES_DESCRIPTION, MATCHES_TITLE } from "./_lib/metadata"
import { MatchStats } from "./_ui/MatchStats"

export { generateMetadata } from "./_lib/metadata"

const CRUMBS = trail({ label: "Матчи" })

const HERO_LINKS = [
  { label: "Результаты", href: ROUTES.results },
  { label: "Турниры", href: ROUTES.events },
  { label: "Эфиры", href: ROUTES.streams },
  { label: "Рейтинг Valve", href: ROUTES.rankings },
] as const

async function Schedule({ searchParams }: { searchParams: PageProps<"/matches">["searchParams"] }) {
  const active = parseMatchFilter((await searchParams).filter)

  return (
    <section className="flex flex-col gap-4">
      <MatchFilterBar title="Расписание" basePath={ROUTES.matches} active={active} />
      <MatchCenter
        kind="upcoming"
        grouped
        limit={100}
        filter={active}
        emptyLabel={active === "top" ? "Важных матчей в ближайшие дни нет" : "Расписание пока не опубликовано"}
      />
    </section>
  )
}

export default function Page(props: PageProps<"/matches">) {
  return (
    <>
      <JsonLd data={breadcrumbsJsonLd(CRUMBS)} />

      <SectionHero
        scene="matches"
        crumbs={<Breadcrumbs items={CRUMBS} />}
        title={MATCHES_TITLE}
        description={MATCHES_DESCRIPTION}
        stats={
          <Suspense fallback={null}>
            <MatchStats />
          </Suspense>
        }
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
              <div className="flex min-w-0 flex-col gap-10">
                <Suspense fallback={<MatchCenterSkeleton rows={2} />}>
                  <MatchCenter kind="live" variant="featured" title="Идут сейчас" />
                </Suspense>

                <Suspense
                  fallback={
                    <section className="flex flex-col gap-4">
                      <MatchFilterBar title="Расписание" basePath={ROUTES.matches} active="all" />
                      <ScheduleSkeleton />
                    </section>
                  }
                >
                  <Schedule searchParams={props.searchParams} />
                </Suspense>
              </div>

              <aside aria-label="Турниры и рейтинг" className="flex min-w-0 flex-col gap-6">
                <Suspense fallback={<SidebarCardSkeleton rows={6} />}>
                  <OngoingEvents />
                </Suspense>
                <Suspense fallback={<SidebarCardSkeleton rows={10} />}>
                  <RankingSnapshot />
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
