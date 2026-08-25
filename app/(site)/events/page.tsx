import { Suspense } from "react"

import { getTournaments, TournamentCard, TournamentCardSkeleton } from "@/entities/tournament"
import type { TournamentStatus } from "@/entities/tournament"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { EmptyState } from "@/shared/ui/empty-state"
import { JsonLd } from "@/shared/ui/json-ld"
import { Heading, Text } from "@/shared/ui/typography"

import { breadcrumbsJsonLd, trail } from "../_lib/breadcrumbs"
import { EVENTS_DESCRIPTION, EVENTS_TITLE } from "./_lib/metadata"

export { generateMetadata } from "./_lib/metadata"

const CRUMBS = trail({ label: "Турниры" })

const GROUPS: readonly { status: TournamentStatus; title: string }[] = [
  { status: "ongoing", title: "Идут сейчас" },
  { status: "upcoming", title: "Ближайшие" },
  { status: "finished", title: "Завершённые" },
]

export default function Page() {
  return (
    <Container>
      <Section spacing="md">
        <Stack gap="lg">
          <JsonLd data={breadcrumbsJsonLd(CRUMBS)} />
          <Breadcrumbs items={CRUMBS} />

          <Stack gap="sm">
            <Heading level={1} size="title">
              {EVENTS_TITLE}
            </Heading>
            <Text size="caption" tone="muted" className="max-w-content">
              {EVENTS_DESCRIPTION}
            </Text>
          </Stack>

          <Suspense fallback={<TournamentCardSkeleton />}>
            <EventGroups />
          </Suspense>
        </Stack>
      </Section>
    </Container>
  )
}

async function EventGroups() {
  const result = await getTournaments()

  if (!result.ok) {
    return (
      <EmptyState tone="danger" title="Турниры недоступны" description={result.error.message} />
    )
  }

  if (result.data.length === 0) return <EmptyState title="Турниров пока нет" />

  return (
    <>
      {GROUPS.map((group) => {
        const items = result.data.filter((tournament) => tournament.status === group.status)

        if (items.length === 0) return null

        return (
          <section key={group.status} className="flex flex-col gap-4">
            <Heading level={2} size="subheading">
              {group.title}
            </Heading>
            <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((tournament) => (
                <li key={tournament.id}>
                  <TournamentCard tournament={tournament} />
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </>
  )
}
