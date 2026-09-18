import { Suspense } from "react"

import { getTeams } from "@/entities/team"
import { ROUTES } from "@/shared/config"
import { pageCount, paginate } from "@/shared/model"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { EmptyState } from "@/shared/ui/empty-state"
import { JsonLd } from "@/shared/ui/json-ld"
import { Pagination } from "@/shared/ui/pagination"
import { SectionHero } from "@/widgets/game-hub"

import { breadcrumbsJsonLd, trail } from "../_lib/breadcrumbs"
import { resolvePage } from "../_lib/page-param"
import { TEAMS_DESCRIPTION, TEAMS_TITLE } from "./_lib/metadata"
import { TeamCard, TeamsGridSkeleton } from "./_ui/TeamCard"

export { generateMetadata } from "./_lib/metadata"

const CRUMBS = trail({ label: "Команды" })
const PER_PAGE = 24

export default function Page(props: PageProps<"/teams">) {
  return (
    <Container>
      <Section spacing="md">
        <Stack gap="lg">
          <JsonLd data={breadcrumbsJsonLd(CRUMBS)} />
          <Breadcrumbs items={CRUMBS} />

          <SectionHero scene="teams" title={TEAMS_TITLE} description={TEAMS_DESCRIPTION} />

          <Suspense fallback={<TeamsGridSkeleton />}>
            <TeamsGrid searchParams={props.searchParams} />
          </Suspense>
        </Stack>
      </Section>
    </Container>
  )
}

async function TeamsGrid({ searchParams }: Pick<PageProps<"/teams">, "searchParams">) {
  const page = await resolvePage(searchParams)
  const result = await getTeams()

  if (!result.ok) {
    return (
      <EmptyState tone="danger" title="Команды недоступны" description={result.error.message} />
    )
  }

  if (result.data.length === 0) return <EmptyState title="Команд пока нет" />

  const view = paginate(result.data, page, PER_PAGE)

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {view.items.map((team) => (
          <li key={team.id}>
            <TeamCard team={team} />
          </li>
        ))}
      </ul>

      <Pagination
        page={view.page}
        pageCount={pageCount(view.total, PER_PAGE)}
        basePath={ROUTES.teams}
      />
    </>
  )
}
