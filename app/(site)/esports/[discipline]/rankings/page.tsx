import { Suspense } from "react"

import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { JsonLd } from "@/shared/ui/json-ld"
import { Heading, Text } from "@/shared/ui/typography"
import { DisciplineHeaderSkeleton } from "@/widgets/discipline-header"
import { TeamRankings, TeamRankingsSkeleton } from "@/widgets/team-rankings"

import { breadcrumbsJsonLd, disciplineBreadcrumbs } from "../_lib/breadcrumbs"
import { DisciplineHeaderSection } from "../_lib/DisciplineHeaderSection"
import { resolveDiscipline } from "../_lib/discipline"
import type { DisciplineParams } from "../_lib/discipline"
import { sectionMetadata } from "../_lib/metadata"

type RankingsProps = PageProps<"/esports/[discipline]/rankings">

export function generateMetadata(props: RankingsProps) {
  return sectionMetadata(
    props.params,
    "rankings",
    (discipline) => `Рейтинг команд ${discipline.shortTitle}`,
    (discipline) =>
      `Мировой рейтинг команд ${discipline.title}: место, очки, изменение позиции и форма последних матчей.`,
  )
}

export default function Page(props: RankingsProps) {
  return (
    <>
      <Suspense fallback={<DisciplineHeaderSkeleton />}>
        <DisciplineHeaderSection params={props.params} section="rankings" />
      </Suspense>

      <Container>
        <Section spacing="md">
          <Stack gap="lg">
            <Suspense fallback={<TeamRankingsSkeleton />}>
              <RankingsContent params={props.params} />
            </Suspense>
          </Stack>
        </Section>
      </Container>
    </>
  )
}

async function RankingsContent({ params }: { params: DisciplineParams }) {
  const discipline = await resolveDiscipline(params)
  const crumbs = disciplineBreadcrumbs(discipline.slug, discipline.title, [{ label: "Рейтинг" }])

  return (
    <>
      <JsonLd data={breadcrumbsJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <Stack gap="sm">
        <Heading level={1} size="title">
          Мировой рейтинг {discipline.shortTitle}
        </Heading>
        <Text size="caption" tone="muted" className="max-w-content">
          Рейтинг пересчитывается после каждого крупного турнира. Столбец с изменением показывает
          движение относительно прошлого обновления, форма — результаты пяти последних серий.
        </Text>
      </Stack>

      <TeamRankings disciplineSlug={discipline.slug} />
    </>
  )
}
