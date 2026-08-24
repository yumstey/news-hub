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

type MatchesProps = PageProps<"/esports/[discipline]/matches">

export function generateMetadata(props: MatchesProps) {
  return sectionMetadata(
    props.params,
    "matches",
    (discipline) => `Матчи ${discipline.shortTitle}`,
    (discipline) =>
      `Расписание ближайших матчей ${discipline.title}: время начала, формат серии, турнир и составы команд.`,
  )
}

export default function Page(props: MatchesProps) {
  return (
    <>
      <Suspense fallback={<DisciplineHeaderSkeleton />}>
        <DisciplineHeaderSection params={props.params} section="matches" />
      </Suspense>

      <Container>
        <Section spacing="md">
          <Stack gap="lg">
            <Suspense fallback={<MatchCenterSkeleton rows={6} />}>
              <MatchesContent params={props.params} />
            </Suspense>
          </Stack>
        </Section>
      </Container>
    </>
  )
}

async function MatchesContent({ params }: { params: DisciplineParams }) {
  const discipline = await resolveDiscipline(params)
  const crumbs = disciplineBreadcrumbs(discipline.slug, discipline.title, [{ label: "Матчи" }])

  return (
    <>
      <JsonLd data={breadcrumbsJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <Stack gap="sm">
        <Heading level={1} size="title">
          Матчи {discipline.shortTitle}
        </Heading>
        <Text size="caption" tone="muted" className="max-w-content">
          Расписание ближайших серий с указанием турнира, стадии и формата. Матчи в прямом эфире
          отмечены отдельно.
        </Text>
      </Stack>

      <Suspense fallback={<MatchCenterSkeleton rows={2} />}>
        <MatchCenter
          disciplineSlug={discipline.slug}
          kind="live"
          title="Идут сейчас"
          emptyLabel="Сейчас нет матчей в прямом эфире"
        />
      </Suspense>

      <MatchCenter
        disciplineSlug={discipline.slug}
        kind="upcoming"
        grouped
        title="Расписание"
        emptyLabel="Расписание пока не опубликовано"
      />
    </>
  )
}
