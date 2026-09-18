import { notFound } from "next/navigation"
import { Suspense } from "react"

import {
  buildPlayerJsonLd,
  countTitles,
  EMPTY_CAREER,
  EMPTY_PLAYER_PROFILE,
  EMPTY_RECORD,
  getPlayerBySlug,
  getPlayerCareer,
  getPlayerProfile,
  getPlayerRecord,
  getFreePhotos,
  preferPhoto,
} from "@/entities/player"
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
import { PlayerHonours } from "./_ui/PlayerHonours"
import { PlayerProfileCard } from "./_ui/PlayerProfileCard"
import { PlayerRecord } from "./_ui/PlayerRecord"

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
    </>
  )
}

/** PandaScore часто не отдаёт возраст — считаем его от даты рождения с Liquipedia. */
function yearsSince(birthDate: Date | null): number | null {
  if (birthDate === null) return null

  const now = new Date()
  const years = now.getUTCFullYear() - birthDate.getUTCFullYear()
  const passed =
    now.getUTCMonth() > birthDate.getUTCMonth() ||
    (now.getUTCMonth() === birthDate.getUTCMonth() && now.getUTCDate() >= birthDate.getUTCDate())

  const age = passed ? years : years - 1

  return age > 0 && age < 100 ? age : null
}

async function Overview({ player }: { player: Player }) {
  const [careerResult, recordResult, profileResult, photosResult] = await Promise.all([
    getPlayerCareer(player.slug),
    getPlayerRecord(player.slug, player.team?.id ?? null),
    getPlayerProfile(player.nickname, player.realName),
    getFreePhotos([player.nickname]),
  ])

  const career = careerResult.ok ? careerResult.data : EMPTY_CAREER
  const record = recordResult.ok ? recordResult.data : EMPTY_RECORD
  const profile = profileResult.ok ? profileResult.data : EMPTY_PLAYER_PROFILE
  const titles = countTitles(career.events, record.teamIds)
  const photo = preferPhoto(
    player.photo?.url ?? null,
    photosResult.ok ? photosResult.data[player.nickname.toLowerCase()] : undefined,
  )

  return (
    <>
      <PlayerHero
        player={player}
        career={career}
        record={record}
        titles={titles}
        age={player.age ?? yearsSince(profile.birthDate)}
        role={profile.roles[0] ?? null}
        photo={photo}
      />
      <PlayerProfileCard profile={profile} />
      <PlayerRecord record={record} />
      <PlayerHonours profile={profile} />
      <PlayerCareer career={career} teamIds={record.teamIds} />

      <Text size="caption" tone="subtle">
        Персональные показатели за раунд (рейтинг, ADR, KAST) не входят в текущий тариф
        PandaScore, поэтому статистика ниже собрана по результатам матчей и данным Liquipedia.
      </Text>
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
