import { ROUTES } from "@/shared/config"
import { Suspense } from "react"

import { getStreamGroups } from "@/entities/match"
import { plural } from "@/shared/lib/text"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { EmptyState } from "@/shared/ui/empty-state"
import { JsonLd } from "@/shared/ui/json-ld"
import { HeroLinks, HeroStat, SectionHero } from "@/widgets/game-hub"

import { breadcrumbsJsonLd, trail } from "../_lib/breadcrumbs"
import { STREAMS_DESCRIPTION, STREAMS_TITLE } from "./_lib/metadata"
import { playableEntry, StreamPlayer, StreamsSkeleton } from "./_ui/StreamGroupCard"

export { generateMetadata } from "./_lib/metadata"

const CRUMBS = trail({ label: "Трансляции" })

const HERO_LINKS = [
  { label: "Матчи", href: ROUTES.matches },
  { label: "Видео", href: ROUTES.videos },
  { label: "Турниры", href: ROUTES.events },
] as const

async function HeroStats() {
  const result = await getStreamGroups()

  if (!result.ok) return null

  const live = result.data.filter((group) => group.live).length

  if (live === 0) return null

  return (
    <HeroStat
      live
      value={live}
      label={`${plural(live, ["трансляция", "трансляции", "трансляций"])} в эфире`}
    />
  )
}

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbsJsonLd(CRUMBS)} />

      <SectionHero
        scene="streams"
        crumbs={<Breadcrumbs items={CRUMBS} />}
        title={STREAMS_TITLE}
        description={STREAMS_DESCRIPTION}
        stats={
          <Suspense fallback={null}>
            <HeroStats />
          </Suspense>
        }
        actions={<HeroLinks links={HERO_LINKS} />}
      />

      <Container>
        <Section spacing="md">
          <Stack gap="lg">
            <Suspense fallback={<StreamsSkeleton />}>
              <LivePlayers />
            </Suspense>
          </Stack>
        </Section>
      </Container>
    </>
  )
}

async function LivePlayers() {
  const result = await getStreamGroups()

  if (!result.ok) {
    return (
      <EmptyState tone="danger" title="Трансляции недоступны" description={result.error.message} />
    )
  }

  const playable = result.data.filter((group) => playableEntry(group) !== null)

  if (playable.length === 0) {
    return (
      <EmptyState
        title="Сейчас нет прямых эфиров"
        description="Плееры появятся здесь, когда начнётся официальная трансляция матча Counter-Strike 2."
      />
    )
  }

  return (
    <ul className="grid gap-10 xl:grid-cols-2">
      {playable.map((group, index) => (
        <li key={group.key}>
          <StreamPlayer group={group} autoStart={index === 0} />
        </li>
      ))}
    </ul>
  )
}
