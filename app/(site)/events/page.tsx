import { CalendarDays } from "lucide-react"
import { Suspense } from "react"

import {
  getTournaments,
  TournamentCard,
  TournamentCardSkeleton,
  TournamentRow,
} from "@/entities/tournament"
import type { Tournament } from "@/entities/tournament"
import { ROUTES, SITE_URL } from "@/shared/config"
import { plural } from "@/shared/lib/text"
import { AdSlot } from "@/shared/ui/ad-slot"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { EmptyState } from "@/shared/ui/empty-state"
import { JsonLd } from "@/shared/ui/json-ld"
import { SectionHeading } from "@/shared/ui/section-heading"
import { artForTitle, loadGameArt } from "@/entities/game-update"
import { HeroLinks, HeroStat, SectionHero } from "@/widgets/game-hub"
import type { GameArt } from "@/entities/game-update"

import { breadcrumbsJsonLd, trail } from "../_lib/breadcrumbs"
import { EVENTS_DESCRIPTION, EVENTS_TITLE } from "./_lib/metadata"

export { generateMetadata } from "./_lib/metadata"

const CRUMBS = trail({ label: "Турниры" })
const FINISHED_LIMIT = 15

const HERO_LINKS = [
  { label: "Матчи", href: ROUTES.matches },
  { label: "Результаты", href: ROUTES.results },
  { label: "Рейтинг Valve", href: ROUTES.rankings },
] as const

async function HeroStats() {
  const result = await getTournaments()

  if (!result.ok) return null

  const ongoing = result.data.filter((tournament) => tournament.status === "ongoing").length
  const upcoming = result.data.filter((tournament) => tournament.status === "upcoming").length
  const prize = result.data
    .filter((tournament) => tournament.status !== "finished")
    .reduce((sum, tournament) => sum + (tournament.prizePool ?? 0), 0)

  return (
    <>
      {ongoing === 0 ? null : (
        <HeroStat
          live
          value={ongoing}
          label={`${plural(ongoing, ["турнир", "турнира", "турниров"])} идёт`}
        />
      )}
      <HeroStat
        icon={<CalendarDays aria-hidden="true" className="size-4 text-subtle-foreground" />}
        value={upcoming}
        label="впереди"
      />
      {prize === 0 ? null : (
        <HeroStat value={`$${Math.round(prize / 1000).toLocaleString("ru-RU")}K`} label="призовых разыгрывается" />
      )}
    </>
  )
}

function coverFor(tournament: Tournament, art: GameArt): string | null {
  // Виды карт выглядят как сцены из игры, в отличие от кадров меню в Steam.
  return artForTitle(tournament.name, tournament.id, art, "maps")
}

function eventJsonLd(tournaments: readonly Tournament[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: EVENTS_TITLE,
    numberOfItems: tournaments.length,
    itemListElement: tournaments.map((tournament, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "SportsEvent",
        name: tournament.name,
        url: `${SITE_URL}/events/${tournament.slug}`,
        startDate: tournament.startsAt.toISOString(),
        endDate: tournament.endsAt.toISOString(),
        eventAttendanceMode: tournament.location.online
          ? "https://schema.org/OnlineEventAttendanceMode"
          : "https://schema.org/OfflineEventAttendanceMode",
        ...(tournament.prizePool === null
          ? {}
          : { subjectOf: { "@type": "CreativeWork", name: `Призовой фонд ${tournament.prizePool} ${tournament.currency}` } }),
      },
    })),
  }
}

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbsJsonLd(CRUMBS)} />

      <SectionHero
        scene="events"
        crumbs={<Breadcrumbs items={CRUMBS} />}
        title={EVENTS_TITLE}
        description={EVENTS_DESCRIPTION}
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
            <Suspense fallback={<TournamentCardSkeleton />}>
              <EventGroups />
            </Suspense>

            <AdSlot slot="inline" />
          </Stack>
        </Section>
      </Container>
    </>
  )
}

async function EventGroups() {
  const [result, art] = await Promise.all([getTournaments(), loadGameArt()])

  if (!result.ok) {
    return (
      <EmptyState tone="danger" title="Турниры недоступны" description={result.error.message} />
    )
  }

  if (result.data.length === 0) return <EmptyState title="Турниров пока нет" />

  const ongoing = result.data.filter((tournament) => tournament.status === "ongoing")
  const upcoming = result.data.filter((tournament) => tournament.status === "upcoming")
  const finished = result.data.filter((tournament) => tournament.status === "finished")

  return (
    <>
      <JsonLd data={eventJsonLd([...ongoing, ...upcoming].slice(0, 20))} />

      {ongoing.length === 0 ? null : (
        <section className="flex flex-col gap-4">
          <SectionHeading title="Идут сейчас" />
          {/* Идущие турниры — крупной сеткой: это главное, ради чего заходят. */}
          <ul className="grid gap-5 md:grid-cols-2">
            {ongoing.map((tournament, index) => (
              <li key={tournament.id}>
                <TournamentCard
                  tournament={tournament}
                  cover={coverFor(tournament, art)}
                  eager={index < 2}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {upcoming.length === 0 ? null : (
        <section className="flex flex-col gap-4">
          <SectionHeading title="Ближайшие" />
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {upcoming.map((tournament) => (
              <li key={tournament.id}>
                <TournamentCard tournament={tournament} cover={coverFor(tournament, art)} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {finished.length === 0 ? null : (
        <section className="flex flex-col gap-4">
          <SectionHeading title="Завершённые" />
          <div className="overflow-hidden rounded-surface border border-border bg-surface">
            <ul className="divide-y divide-border">
              {finished.slice(0, FINISHED_LIMIT).map((tournament) => (
                <li key={tournament.id}>
                  <TournamentRow tournament={tournament} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}
