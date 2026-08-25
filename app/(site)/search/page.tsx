import type { Metadata } from "next"
import { Suspense } from "react"

import { PlayerCard, searchPlayers } from "@/entities/player"
import { searchTeams, TeamIdentity } from "@/entities/team"
import { searchTournaments, TournamentCard } from "@/entities/tournament"
import { Container, Section, Stack } from "@/shared/ui/container"
import { EmptyState } from "@/shared/ui/empty-state"
import { Skeleton } from "@/shared/ui/skeleton"
import { Heading, Text } from "@/shared/ui/typography"

export const metadata: Metadata = {
  title: "Поиск",
  robots: { index: false, follow: true },
}

const MIN_QUERY = 2

export default function Page(props: PageProps<"/search">) {
  return (
    <Container>
      <Section spacing="md">
        <Stack gap="lg">
          <Heading level={1} size="title">
            Поиск
          </Heading>

          <Suspense fallback={<ResultsSkeleton />}>
            <Results searchParams={props.searchParams} />
          </Suspense>
        </Stack>
      </Section>
    </Container>
  )
}

async function Results({ searchParams }: Pick<PageProps<"/search">, "searchParams">) {
  const { q } = await searchParams
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? ""

  if (query.length < MIN_QUERY) {
    return (
      <EmptyState
        title="Введите запрос"
        description="Минимум два символа. Поиск работает по командам, игрокам и турнирам."
      />
    )
  }

  const [teams, players, tournaments] = await Promise.all([
    searchTeams(query),
    searchPlayers(query),
    searchTournaments(query),
  ])

  const teamItems = teams.ok ? teams.data : []
  const playerItems = players.ok ? players.data : []
  const eventItems = tournaments.ok ? tournaments.data : []
  const total = teamItems.length + playerItems.length + eventItems.length

  if (total === 0) {
    return (
      <EmptyState
        title={`По запросу «${query}» ничего не найдено`}
        description="Попробуйте другое название команды, никнейм игрока или турнир."
      />
    )
  }

  return (
    <>
      <Text size="caption" tone="muted">
        Найдено {total} по запросу «{query}»
      </Text>

      {teamItems.length > 0 ? (
        <section className="flex flex-col gap-4">
          <Heading level={2} size="subheading">
            Команды
          </Heading>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {teamItems.map((team) => (
              <li
                key={team.id}
                className="rounded-control border border-border bg-surface px-4 py-3"
              >
                <TeamIdentity
                  slug={team.slug}
                  name={team.name}
                  logo={team.logo}
                  country={team.country}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {playerItems.length > 0 ? (
        <section className="flex flex-col gap-4">
          <Heading level={2} size="subheading">
            Игроки
          </Heading>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {playerItems.map((player) => (
              <li key={player.id}>
                <PlayerCard player={player} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {eventItems.length > 0 ? (
        <section className="flex flex-col gap-4">
          <Heading level={2} size="subheading">
            Турниры
          </Heading>
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {eventItems.map((tournament) => (
              <li key={tournament.id}>
                <TournamentCard tournament={tournament} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  )
}

function ResultsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton variant="text" className="h-3 w-full max-w-48" />
      <Skeleton variant="block" className="h-40 w-full" />
    </div>
  )
}
