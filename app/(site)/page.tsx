import { Suspense } from "react"

import { ROUTES, SITE, SITE_URL } from "@/shared/config"
import { AdSlot } from "@/shared/ui/ad-slot"
import { Container, Section, Stack } from "@/shared/ui/container"
import { JsonLd } from "@/shared/ui/json-ld"
import { Skeleton } from "@/shared/ui/skeleton"
import { CaseShowcase, LatestUpdates, LiveNow, OnlineNow, SkinShowcase } from "@/widgets/game-hub"
import { MatchCenter, MatchCenterSkeleton } from "@/widgets/match-center"
import { NewsFeed, NewsFeedSkeleton } from "@/widgets/news-feed"
import { TeamRankings, TeamRankingsSkeleton } from "@/widgets/team-rankings"

import { PlatformHero } from "./_ui/PlatformHero"

/** WebSite + SearchAction: поле поиска по сайту прямо в сниппете Google. */
const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  url: SITE_URL,
  inLanguage: "ru",
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
}

export default function Page() {
  return (
    <>
      <JsonLd data={WEBSITE_JSON_LD} />

      <PlatformHero
        stats={
          <>
            <Suspense fallback={null}>
              <OnlineNow />
            </Suspense>
            <Suspense fallback={null}>
              <LiveNow />
            </Suspense>
          </>
        }
      />

      <Container>
        <Section spacing="md">
          <Stack gap="lg">
            <Suspense fallback={<MatchCenterSkeleton rows={2} />}>
              <MatchCenter
                kind="live"
                variant="cards"
                limit={6}
                title="Идут сейчас"
                moreHref={ROUTES.streams}
                moreLabel="Все эфиры"
              />
            </Suspense>

            <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
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

              <Stack gap="lg">
                <Suspense fallback={<TeamRankingsSkeleton />}>
                  <TeamRankings limit={10} title="Мировой рейтинг" showMore />
                </Suspense>

                <Suspense fallback={<Skeleton variant="block" className="h-48 w-full" />}>
                  <LatestUpdates limit={4} />
                </Suspense>

                <AdSlot slot="sidebar" />
              </Stack>
            </div>

            <Suspense fallback={<Skeleton variant="block" className="h-72 w-full" />}>
              <SkinShowcase title="Популярные скины" limit={10} />
            </Suspense>

            <Suspense fallback={<Skeleton variant="block" className="h-72 w-full" />}>
              <SkinShowcase
                title="Самые дорогие ножи"
                query={{ category: "knives", sort: "price-desc" }}
                limit={5}
              />
            </Suspense>

            <Suspense fallback={<Skeleton variant="block" className="h-72 w-full" />}>
              <CaseShowcase />
            </Suspense>
          </Stack>
        </Section>
      </Container>
    </>
  )
}
