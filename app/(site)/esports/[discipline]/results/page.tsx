import { Suspense } from "react"

import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { JsonLd } from "@/shared/ui/json-ld"
import { Heading, Text } from "@/shared/ui/typography"
import { DisciplineHeaderSkeleton } from "@/widgets/discipline-header"
import { MatchCenter, MatchCenterSkeleton } from "@/widgets/match-center"

import { breadcrumbsJsonLd, disciplineBreadcrumbs } from "../_lib/breadcrumbs"
import { DisciplineHeaderSection } from "../_lib/DisciplineHeaderSection"
import { resolveDiscipline } from "../_lib/discipline"
import type { DisciplineParams } from "../_lib/discipline"
import { sectionMetadata } from "../_lib/metadata"

type ResultsProps = PageProps<"/esports/[discipline]/results">

export function generateMetadata(props: ResultsProps) {
  return sectionMetadata(
    props.params,
    "results",
    (discipline) => `Результаты ${discipline.shortTitle}`,
    (discipline) =>
      `Результаты сыгранных матчей ${discipline.title}: счёт по картам, турнир и стадия.`,
  )
}

export default function Page(props: ResultsProps) {
  return (
    <>
      <Suspense fallback={<DisciplineHeaderSkeleton />}>
        <DisciplineHeaderSection params={props.params} section="results" />
      </Suspense>

      <Container>
        <Section spacing="md">
          <Stack gap="lg">
            <Suspense fallback={<MatchCenterSkeleton rows={8} />}>
              <ResultsContent params={props.params} />
            </Suspense>
          </Stack>
        </Section>
      </Container>
    </>
  )
}

async function ResultsContent({ params }: { params: DisciplineParams }) {
  const discipline = await resolveDiscipline(params)
  const crumbs = disciplineBreadcrumbs(discipline.slug, discipline.title, [
    { label: "Результаты" },
  ])

  return (
    <>
      <JsonLd data={breadcrumbsJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <Stack gap="sm">
        <Heading level={1} size="title">
          Результаты {discipline.shortTitle}
        </Heading>
        <Text size="caption" tone="muted" className="max-w-content">
          Сыгранные серии в обратном хронологическом порядке. Победитель выделен, счёт серии указан по картам.
        </Text>
      </Stack>

      <MatchCenter
        disciplineSlug={discipline.slug}
        kind="results"
        grouped
        emptyLabel="Результатов пока нет"
      />
    </>
  )
}
