import { Suspense } from "react"

import { getPlayers, PlayerCard, PlayersGridSkeleton } from "@/entities/player"
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
import { PLAYERS_DESCRIPTION, PLAYERS_TITLE } from "./_lib/metadata"

export { generateMetadata } from "./_lib/metadata"

const CRUMBS = trail({ label: "Игроки" })
const PER_PAGE = 24

export default function Page(props: PageProps<"/players">) {
  return (
    <Container>
      <Section spacing="md">
        <Stack gap="lg">
          <JsonLd data={breadcrumbsJsonLd(CRUMBS)} />
          <Breadcrumbs items={CRUMBS} />

          <SectionHero scene="players" title={PLAYERS_TITLE} description={PLAYERS_DESCRIPTION} />

          <Suspense fallback={<PlayersGridSkeleton />}>
            <PlayersGrid searchParams={props.searchParams} />
          </Suspense>
        </Stack>
      </Section>
    </Container>
  )
}

async function PlayersGrid({ searchParams }: Pick<PageProps<"/players">, "searchParams">) {
  const page = await resolvePage(searchParams)
  const result = await getPlayers()

  if (!result.ok) {
    return (
      <EmptyState tone="danger" title="Игроки недоступны" description={result.error.message} />
    )
  }

  if (result.data.length === 0) return <EmptyState title="Игроков пока нет" />

  const view = paginate(result.data, page, PER_PAGE)

  return (
    <>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {view.items.map((player) => (
          <li key={player.id}>
            <PlayerCard player={player} />
          </li>
        ))}
      </ul>

      <Pagination
        page={view.page}
        pageCount={pageCount(view.total, PER_PAGE)}
        basePath={ROUTES.players}
      />
    </>
  )
}
