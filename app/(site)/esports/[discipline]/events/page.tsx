import Link from "next/link"
import { Suspense } from "react"

import {
  formatPrize,
  getTournaments,
  TOURNAMENT_STATUS_LABEL,
  TournamentTierBadge,
  tournamentHref,
} from "@/entities/tournament"
import type { Tournament } from "@/entities/tournament"
import { SITE } from "@/shared/config"
import { formatDate } from "@/shared/lib/date"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { CountryTag } from "@/shared/ui/country-tag"
import { EmptyState } from "@/shared/ui/empty-state"
import { JsonLd } from "@/shared/ui/json-ld"
import { Heading, Text } from "@/shared/ui/typography"
import { DisciplineHeaderSkeleton } from "@/widgets/discipline-header"

import { breadcrumbsJsonLd, disciplineBreadcrumbs } from "../_lib/breadcrumbs"
import { DisciplineHeaderSection } from "../_lib/DisciplineHeaderSection"
import { resolveDiscipline } from "../_lib/discipline"
import type { DisciplineParams } from "../_lib/discipline"
import { sectionMetadata } from "../_lib/metadata"

type EventsProps = PageProps<"/esports/[discipline]/events">

export function generateMetadata(props: EventsProps) {
  return sectionMetadata(
    props.params,
    "events",
    (discipline) => `Турниры ${discipline.shortTitle}`,
    (discipline) =>
      `Турниры ${discipline.title}: призовой фонд, даты, площадка, участники и итоговые таблицы.`,
  )
}

export default function Page(props: EventsProps) {
  return (
    <>
      <Suspense fallback={<DisciplineHeaderSkeleton />}>
        <DisciplineHeaderSection params={props.params} section="events" />
      </Suspense>

      <Container>
        <Section spacing="md">
          <Stack gap="lg">
            <Suspense fallback={<EventsSkeleton />}>
              <EventsContent params={props.params} />
            </Suspense>
          </Stack>
        </Section>
      </Container>
    </>
  )
}

function EventCard({
  tournament,
  disciplineSlug,
}: {
  tournament: Tournament
  disciplineSlug: string
}) {
  return (
    <Link
      href={tournamentHref(disciplineSlug, tournament.slug)}
      className="flex h-full flex-col gap-4 rounded-surface border border-border bg-surface p-5 transition-colors duration-150 hover:border-border-strong hover:bg-muted/60"
    >
      <span className="flex flex-wrap items-center gap-2">
        <TournamentTierBadge tier={tournament.tier} />
        <span className="text-overline uppercase text-subtle-foreground">
          {TOURNAMENT_STATUS_LABEL[tournament.status]}
        </span>
      </span>

      <span className="flex flex-col gap-1">
        <span className="text-subheading text-foreground">{tournament.name}</span>
        <Text as="span" size="caption" tone="muted" clamp={2}>
          {tournament.description}
        </Text>
      </span>

      <span className="mt-auto flex flex-col gap-2 border-t border-border pt-3 text-caption">
        <span className="flex items-center justify-between gap-3">
          <span className="text-subtle-foreground">Призовой фонд</span>
          <span className="font-semibold tabular-nums text-foreground">
            {formatPrize(tournament.prizePool, tournament.currency, SITE.locale)}
          </span>
        </span>
        <span className="flex items-center justify-between gap-3">
          <span className="text-subtle-foreground">Даты</span>
          <span className="tabular-nums text-muted-foreground">
            {formatDate(tournament.startsAt, SITE.locale)} —{" "}
            {formatDate(tournament.endsAt, SITE.locale)}
          </span>
        </span>
        <span className="flex items-center justify-between gap-3">
          <span className="text-subtle-foreground">Площадка</span>
          <span className="flex items-center gap-2 text-muted-foreground">
            {tournament.location.city}
            <CountryTag country={tournament.location.country} />
          </span>
        </span>
      </span>
    </Link>
  )
}

async function EventsContent({ params }: { params: DisciplineParams }) {
  const discipline = await resolveDiscipline(params)
  const crumbs = disciplineBreadcrumbs(discipline.slug, discipline.title, [{ label: "Турниры" }])
  const result = await getTournaments(discipline.slug)

  if (!result.ok) {
    return (
      <>
        <Breadcrumbs items={crumbs} />
        <EmptyState tone="danger" title="Турниры недоступны" description={result.error.message} />
      </>
    )
  }

  const groups = [
    { status: "ongoing" as const, title: "Идут сейчас" },
    { status: "upcoming" as const, title: "Ближайшие" },
    { status: "finished" as const, title: "Завершённые" },
  ]

  return (
    <>
      <JsonLd data={breadcrumbsJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <Stack gap="sm">
        <Heading level={1} size="title">
          Турниры {discipline.shortTitle}
        </Heading>
        <Text size="caption" tone="muted" className="max-w-content">
          Календарь турниров с призовым фондом, форматом и площадкой. Для завершённых событий
          доступны итоговая таблица и результаты матчей.
        </Text>
      </Stack>

      {result.data.length === 0 ? <EmptyState title="Турниров пока нет" /> : null}

      {groups.map((group) => {
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
                  <EventCard tournament={tournament} disciplineSlug={discipline.slug} />
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </>
  )
}

function EventsSkeleton() {
  const items = Array.from({ length: 3 }, (_, index) => index)

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div key={item} className="h-64 rounded-surface border border-border bg-skeleton" />
      ))}
    </div>
  )
}
