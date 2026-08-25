import { Container, Section, Stack } from "@/shared/ui/container"
import { MatchCenterSkeleton } from "@/widgets/match-center"
import { NewsFeedSkeleton } from "@/widgets/news-feed"
import { TeamRankingsSkeleton } from "@/widgets/team-rankings"

import { PlatformHeroSkeleton } from "./_ui/PlatformHero"

export default function Loading() {
  return (
    <>
      <PlatformHeroSkeleton />
      <Container>
        <Section spacing="md">
          <Stack gap="lg">
            <MatchCenterSkeleton rows={2} />
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <Stack gap="lg">
                <MatchCenterSkeleton rows={5} />
                <MatchCenterSkeleton rows={5} />
                <NewsFeedSkeleton count={4} variant="list" />
              </Stack>
              <TeamRankingsSkeleton />
            </div>
          </Stack>
        </Section>
      </Container>
    </>
  )
}
