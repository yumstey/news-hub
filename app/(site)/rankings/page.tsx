import { Suspense } from "react"

import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { JsonLd } from "@/shared/ui/json-ld"
import {
  RankingMovers,
  RankingMoversSkeleton,
  TeamRankings,
  TeamRankingsSkeleton,
} from "@/widgets/team-rankings"
import { SectionHero } from "@/widgets/game-hub"

import { breadcrumbsJsonLd, trail } from "../_lib/breadcrumbs"
import { RANKINGS_DESCRIPTION, RANKINGS_TITLE } from "./_lib/metadata"

export { generateMetadata } from "./_lib/metadata"

const CRUMBS = trail({ label: "Рейтинг" })

export default function Page() {
  return (
    <Container>
      <Section spacing="md">
        <Stack gap="lg">
          <JsonLd data={breadcrumbsJsonLd(CRUMBS)} />
          <Breadcrumbs items={CRUMBS} />

          <SectionHero scene="rankings" title={RANKINGS_TITLE} description={<>{RANKINGS_DESCRIPTION} Рейтинг публикуется Valve и обновляется раз в месяц.</>} />

          <Suspense fallback={<RankingMoversSkeleton />}>
            <RankingMovers />
          </Suspense>

          <Suspense fallback={<TeamRankingsSkeleton />}>
            <TeamRankings
              emptyLabel="Рейтинг сейчас недоступен"
              emptyDescription="Источник рейтинга временно не отвечает. Попробуйте обновить страницу позже."
            />
          </Suspense>
        </Stack>
      </Section>
    </Container>
  )
}
