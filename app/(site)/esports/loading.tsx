import { Container, Section, Stack } from "@/shared/ui/container"
import { Skeleton, SkeletonText } from "@/shared/ui/skeleton"
import { DisciplineHeaderSkeleton } from "@/widgets/discipline-header"
import { MatchCenterSkeleton } from "@/widgets/match-center"
import { TeamRankingsSkeleton } from "@/widgets/team-rankings"

export default function Loading() {
  return (
    <>
      <DisciplineHeaderSkeleton />
      <Container>
        <Section spacing="md">
          <Stack gap="lg">
            <Skeleton variant="text" className="h-3 w-64" />
            <Stack gap="sm">
              <Skeleton variant="text" className="h-9 w-64" />
              <SkeletonText lines={2} className="max-w-content" />
            </Stack>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <MatchCenterSkeleton rows={6} />
              <TeamRankingsSkeleton rows={6} />
            </div>
          </Stack>
        </Section>
      </Container>
    </>
  )
}
