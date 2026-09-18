import { Suspense } from "react"

import { AdSlot } from "@/shared/ui/ad-slot"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { JsonLd } from "@/shared/ui/json-ld"
import { SectionHero } from "@/widgets/game-hub"
import { MatchCenter, MatchCenterSkeleton } from "@/widgets/match-center"

import { breadcrumbsJsonLd, trail } from "../_lib/breadcrumbs"
import { MATCHES_DESCRIPTION, MATCHES_TITLE } from "./_lib/metadata"

export { generateMetadata } from "./_lib/metadata"

const CRUMBS = trail({ label: "Матчи" })

export default function Page() {
  return (
    <Container>
      <Section spacing="md">
        <Stack gap="lg">
          <JsonLd data={breadcrumbsJsonLd(CRUMBS)} />
          <Breadcrumbs items={CRUMBS} />

          <SectionHero scene="matches" title={MATCHES_TITLE} description={MATCHES_DESCRIPTION} />

          <Suspense fallback={<MatchCenterSkeleton rows={2} />}>
            <MatchCenter
              kind="live"
              title="Идут сейчас"
              emptyLabel="Сейчас нет матчей в прямом эфире"
            />
          </Suspense>

          <AdSlot slot="inline" />

          <Suspense fallback={<MatchCenterSkeleton rows={8} />}>
            <MatchCenter
              kind="upcoming"
              grouped
              title="Расписание"
              emptyLabel="Расписание пока не опубликовано"
            />
          </Suspense>
        </Stack>
      </Section>
    </Container>
  )
}
