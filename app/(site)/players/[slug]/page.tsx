import { notFound } from "next/navigation"
import { Suspense } from "react"

import { buildPlayerJsonLd, EMPTY_CAREER, getPlayerBySlug, getPlayerCareer } from "@/entities/player"
import type { Player } from "@/entities/player"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { JsonLd } from "@/shared/ui/json-ld"
import { Skeleton } from "@/shared/ui/skeleton"
import { Text } from "@/shared/ui/typography"
import { MatchCenter, MatchCenterSkeleton } from "@/widgets/match-center"

import { breadcrumbsJsonLd, trail } from "../../_lib/breadcrumbs"
import { resolveSlug } from "../../_lib/params"
import { PlayerCareer } from "./_ui/PlayerCareer"
import { PlayerHero } from "./_ui/PlayerHero"

export { generateMetadata } from "./_lib/metadata"

export default function Page(props: PageProps<"/players/[slug]">) {
  return (
    <Container>
      <Section spacing="md">
        <Stack gap="lg">
          <Suspense fallback={<PlayerSkeleton />}>
            <PlayerView params={props.params} />
          </Suspense>
        </Stack>
      </Section>
    </Container>
  )
}

async function PlayerView({ params }: Pick<PageProps<"/players/[slug]">, "params">) {
  const slug = await resolveSlug(params)
  const result = await getPlayerBySlug(slug)

  if (!result.ok) {
    if (result.error.kind === "not-found") notFound()
    throw new Error(result.error.message)
  }

  const player = result.data
  const crumbs = trail({ label: "Игроки", href: "/players" }, { label: player.nickname })

  return (
    <>
      <JsonLd data={buildPlayerJsonLd(player)} />
      <JsonLd data={breadcrumbsJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <Suspense fallback={<HeroSkeleton />}>
        <Overview player={player} />
      </Suspense>

      <Suspense fallback={<MatchCenterSkeleton rows={5} />}>
        <MatchCenter
          kind="results"
          playerSlug={player.slug}
          limit={8}
          title="Последние матчи"
          emptyLabel="Сыгранных матчей нет"
        />
      </Suspense>

      {player.team === null ? null : (
        <Suspense fallback={<MatchCenterSkeleton rows={3} />}>
          <MatchCenter
            kind="upcoming"
            teamSlug={player.team.slug}
            limit={4}
            title="Ближайшие матчи команды"
            emptyLabel="Ближайших матчей нет"
          />
        </Suspense>
      )}

      <Text size="caption" tone="subtle">
        Индивидуальная статистика (рейтинг, K/D, ADR, KAST) не публикуется на текущем тарифе
        данных.
      </Text>
    </>
  )
}

async function Overview({ player }: { player: Player }) {
  const result = await getPlayerCareer(player.slug)
  const career = result.ok ? result.data : EMPTY_CAREER

  return (
    <>
      <PlayerHero player={player} career={career} />
      <PlayerCareer career={career} />
    </>
  )
}

function HeroSkeleton() {
  return <Skeleton variant="block" className="h-88 w-full" />
}

function PlayerSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton variant="text" className="h-3 w-full max-w-72" />
      <Skeleton variant="block" className="h-88 w-full" />
    </div>
  )
}
