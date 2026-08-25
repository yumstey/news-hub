import { Suspense } from "react"

import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { JsonLd } from "@/shared/ui/json-ld"
import { Heading, Text } from "@/shared/ui/typography"
import { MatchCenter, MatchCenterSkeleton } from "@/widgets/match-center"

import { breadcrumbsJsonLd, trail } from "../_lib/breadcrumbs"
import { RESULTS_DESCRIPTION, RESULTS_TITLE } from "./_lib/metadata"

export { generateMetadata } from "./_lib/metadata"

const CRUMBS = trail({ label: "Результаты" })

export default function Page() {
  return (
    <Container>
      <Section spacing="md">
        <Stack gap="lg">
          <JsonLd data={breadcrumbsJsonLd(CRUMBS)} />
          <Breadcrumbs items={CRUMBS} />

          <Stack gap="sm">
            <Heading level={1} size="title">
              {RESULTS_TITLE}
            </Heading>
            <Text size="caption" tone="muted" className="max-w-content">
              {RESULTS_DESCRIPTION}
            </Text>
          </Stack>

          <Suspense fallback={<MatchCenterSkeleton rows={8} />}>
            <MatchCenter kind="results" grouped emptyLabel="Результатов пока нет" />
          </Suspense>
        </Stack>
      </Section>
    </Container>
  )
}
