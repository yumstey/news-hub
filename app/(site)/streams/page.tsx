import { Suspense } from "react"

import { getStreamGroups } from "@/entities/match"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { EmptyState } from "@/shared/ui/empty-state"
import { JsonLd } from "@/shared/ui/json-ld"
import { SectionHero } from "@/widgets/game-hub"

import { breadcrumbsJsonLd, trail } from "../_lib/breadcrumbs"
import { STREAMS_DESCRIPTION, STREAMS_TITLE } from "./_lib/metadata"
import { playableEntry, StreamPlayer, StreamsSkeleton } from "./_ui/StreamGroupCard"

export { generateMetadata } from "./_lib/metadata"

const CRUMBS = trail({ label: "Трансляции" })

export default function Page() {
  return (
    <Container>
      <Section spacing="md">
        <Stack gap="lg">
          <JsonLd data={breadcrumbsJsonLd(CRUMBS)} />
          <Breadcrumbs items={CRUMBS} />

          <SectionHero scene="streams" title={STREAMS_TITLE} description={STREAMS_DESCRIPTION} />

          <Suspense fallback={<StreamsSkeleton />}>
            <LivePlayers />
          </Suspense>
        </Stack>
      </Section>
    </Container>
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
      {playable.map((group) => (
        <li key={group.key}>
          <StreamPlayer group={group} />
        </li>
      ))}
    </ul>
  )
}
