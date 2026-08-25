import { Suspense } from "react"

import { ROUTES } from "@/shared/config"
import { Container, Section, Stack } from "@/shared/ui/container"
import { MatchCenter, MatchCenterSkeleton } from "@/widgets/match-center"
import { NewsFeed, NewsFeedSkeleton } from "@/widgets/news-feed"
import { TeamRankings, TeamRankingsSkeleton } from "@/widgets/team-rankings"

import { PlatformHero } from "./_ui/PlatformHero"

export default function Page() {
  return (
    <>
      <PlatformHero />

      <Container>
        <Section spacing="md">
          <Stack gap="lg">
            <Suspense fallback={<MatchCenterSkeleton rows={2} />}>
              <MatchCenter
                kind="live"
                title="Идут сейчас"
                emptyLabel="Сейчас нет матчей в прямом эфире"
              />
            </Suspense>

            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <Stack gap="lg">
                <Suspense fallback={<MatchCenterSkeleton rows={5} />}>
                  <MatchCenter
                    kind="upcoming"
                    limit={5}
                    title="Ближайшие матчи"
                    moreHref={ROUTES.matches}
                  />
                </Suspense>

                <Suspense fallback={<MatchCenterSkeleton rows={5} />}>
                  <MatchCenter
                    kind="results"
                    limit={5}
                    title="Последние результаты"
                    moreHref={ROUTES.results}
                    moreLabel="Все результаты"
                  />
                </Suspense>

                <Suspense fallback={<NewsFeedSkeleton count={4} variant="list" />}>
                  <NewsFeed perPage={4} variant="list" title="Новости" showMore />
                </Suspense>
              </Stack>

              <Suspense fallback={<TeamRankingsSkeleton />}>
                <TeamRankings limit={10} title="Мировой рейтинг" showMore />
              </Suspense>
            </div>
          </Stack>
        </Section>
      </Container>
    </>
  )
}
