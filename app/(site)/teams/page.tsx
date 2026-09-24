import { Suspense } from "react"

import { getTeams } from "@/entities/team"
import { ROUTES } from "@/shared/config"
import { pageCount, paginate } from "@/shared/model"
import { Users } from "lucide-react"
import { plural } from "@/shared/lib/text"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { EmptyState } from "@/shared/ui/empty-state"
import { JsonLd } from "@/shared/ui/json-ld"
import { Pagination } from "@/shared/ui/pagination"
import { HeroLinks, HeroStat, SectionHero } from "@/widgets/game-hub"
import { RankingSnapshot, SidebarCardSkeleton } from "@/widgets/match-sidebar"

import { breadcrumbsJsonLd, trail } from "../_lib/breadcrumbs"
import { resolvePage } from "../_lib/page-param"
import { TEAMS_DESCRIPTION, TEAMS_TITLE } from "./_lib/metadata"
import { TeamCard, TeamsGridSkeleton } from "./_ui/TeamCard"

export { generateMetadata } from "./_lib/metadata"

const CRUMBS = trail({ label: "Команды" })
const PER_PAGE = 24

const HERO_LINKS = [
  { label: "Игроки", href: ROUTES.players },
  { label: "Рейтинг Valve", href: ROUTES.rankings },
  { label: "Матчи", href: ROUTES.matches },
] as const

async function HeroStats() {
  const result = await getTeams()

  if (!result.ok) return null

  return (
    <HeroStat
      icon={<Users aria-hidden="true" className="size-4 text-subtle-foreground" />}
      value={result.data.length}
      label={plural(result.data.length, ["команда", "команды", "команд"])}
    />
  )
}

export default function Page(props: PageProps<"/teams">) {
  return (
    <>
      <JsonLd data={breadcrumbsJsonLd(CRUMBS)} />

      <SectionHero
        scene="teams"
        crumbs={<Breadcrumbs items={CRUMBS} />}
        title={TEAMS_TITLE}
        description={TEAMS_DESCRIPTION}
        stats={
          <Suspense fallback={null}>
            <HeroStats />
          </Suspense>
        }
        actions={<HeroLinks links={HERO_LINKS} />}
        aside={
          <Suspense fallback={<SidebarCardSkeleton rows={5} />}>
            <RankingSnapshot limit={5} />
          </Suspense>
        }
      />

      <Container>
        <Section spacing="md">
          <Stack gap="lg">
            <Suspense fallback={<TeamsGridSkeleton />}>
              <TeamsGrid searchParams={props.searchParams} />
            </Suspense>
          </Stack>
        </Section>
      </Container>
    </>
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
