import { Suspense } from "react"

import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { JsonLd } from "@/shared/ui/json-ld"
import { Heading, Text } from "@/shared/ui/typography"
import { DisciplineHeaderSkeleton } from "@/widgets/discipline-header"
import { EsportsNews, EsportsNewsSkeleton } from "@/widgets/esports-news"

import { breadcrumbsJsonLd, disciplineBreadcrumbs } from "../_lib/breadcrumbs"
import { DisciplineHeaderSection } from "../_lib/DisciplineHeaderSection"
import { resolveDiscipline } from "../_lib/discipline"
import type { DisciplineParams } from "../_lib/discipline"
import { sectionMetadata } from "../_lib/metadata"

type NewsProps = PageProps<"/esports/[discipline]/news">

export function generateMetadata(props: NewsProps) {
  return sectionMetadata(
    props.params,
    "news",
    (discipline) => `Новости ${discipline.shortTitle}`,
    (discipline) =>
      `Новости ${discipline.title}: результаты матчей, трансферы, обновления рейтинга и аналитика.`,
  )
}

export default function Page(props: NewsProps) {
  return (
    <>
      <Suspense fallback={<DisciplineHeaderSkeleton />}>
        <DisciplineHeaderSection params={props.params} section="news" />
      </Suspense>

      <Container>
        <Section spacing="md">
          <Stack gap="lg">
            <Suspense fallback={<EsportsNewsSkeleton />}>
              <NewsContent params={props.params} />
            </Suspense>
          </Stack>
        </Section>
      </Container>
    </>
  )
}

async function NewsContent({ params }: { params: DisciplineParams }) {
  const discipline = await resolveDiscipline(params)
  const crumbs = disciplineBreadcrumbs(discipline.slug, discipline.title, [{ label: "Новости" }])

  return (
    <>
      <JsonLd data={breadcrumbsJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <Stack gap="sm">
        <Heading level={1} size="title">
          Новости {discipline.shortTitle}
        </Heading>
        <Text size="caption" tone="muted" className="max-w-content">
          Результаты матчей, трансферы, обновления мирового рейтинга и разборы меты.
        </Text>
      </Stack>

      <EsportsNews disciplineSlug={discipline.slug} perPage={12} />
    </>
  )
}
