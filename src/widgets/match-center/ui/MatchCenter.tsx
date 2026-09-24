import type { Route } from "next"
import Link from "next/link"

import { EMPTY_GAME_INFO, getGameInfo } from "@/entities/game-update"
import {
  compareByImportance,
  getLiveMatches,
  getMatchResults,
  getPlayerMatches,
  getTeamMatches,
  getTournamentMatches,
  getUpcomingMatches,
  groupMatchesByDay,
  groupMatchesByEvent,
  MatchLine,
  matchImportance,
  MatchRowSkeleton,
} from "@/entities/match"
import type { Match, MatchListKind } from "@/entities/match"
import { getTeamRankings } from "@/entities/team"
import { cn } from "@/shared/lib/style"
import { pluralize } from "@/shared/lib/text"
import { EmptyState } from "@/shared/ui/empty-state"
import { LocalDayLabel } from "@/shared/ui/local-time"
import { SectionHeading } from "@/shared/ui/section-heading"

import { EventCard, EventCardSkeleton } from "./EventCard"
import type { RatedMatch } from "./EventCard"
import { LiveMatchCard } from "./LiveMatchCard"

export type MatchFilter = "all" | "top"

export type MatchCenterProps = {
  kind: MatchListKind
  limit?: number
  /** Расписание по дням и турнирам, как на HLTV. */
  grouped?: boolean
  /** "top" — только матчи со звёздами или на турнирах S/A-уровня. */
  filter?: MatchFilter
  title?: string
  moreHref?: Route
  moreLabel?: string
  teamSlug?: string
  playerSlug?: string
  tournamentSlug?: string
  emptyLabel?: string
  /**
   * "cards" — сетка с живыми кадрами трансляций; "featured" — важные матчи
   * карточками, остальные — блоками турниров. Имеет смысл для kind="live".
   */
  variant?: "list" | "cards" | "featured"
  className?: string
}

const FEATURED_LIMIT = 3

async function loadMatches(props: MatchCenterProps) {
  const { kind, limit, teamSlug, playerSlug, tournamentSlug } = props

  if (tournamentSlug !== undefined) return getTournamentMatches(tournamentSlug, limit)

  if (playerSlug !== undefined) return getPlayerMatches(playerSlug, limit)

  if (teamSlug !== undefined) {
    return getTeamMatches(teamSlug, kind === "results" ? "results" : "upcoming", limit)
  }

  if (kind === "live") return getLiveMatches()
  if (kind === "results") return getMatchResults(limit)

  return getUpcomingMatches(limit)
}

/** Место команд в рейтинге Valve: по нему считаются звёзды матча. */
async function loadRanks(): Promise<Map<string, number>> {
  const rankings = await getTeamRankings()

  return new Map(rankings.ok ? rankings.data.map((row) => [row.team.id, row.rank]) : [])
}

function rate(matches: readonly Match[], ranks: ReadonlyMap<string, number>): RatedMatch[] {
  return matches.map((match) => ({ match, importance: matchImportance(match, ranks) }))
}

function isTop({ match, importance }: RatedMatch): boolean {
  return importance > 0 || match.tournament.tier === "s" || match.tournament.tier === "a"
}

type RatedEvent = {
  key: string
  rated: RatedMatch[]
  importance: number
}

type Order = "asc" | "desc"

/** Турниры дня: сначала важные, внутри — матчи в эфире, затем по времени. */
function ratedEvents(rated: readonly RatedMatch[], order: Order): RatedEvent[] {
  const byId = new Map(rated.map((entry) => [entry.match.id, entry]))

  return groupMatchesByEvent(rated.map(({ match }) => match))
    .map((event) => {
      const entries = event.matches.flatMap((match) => {
        const entry = byId.get(match.id)

        return entry === undefined ? [] : [entry]
      })

      entries.sort(
        (left, right) =>
          Number(right.match.status === "live") - Number(left.match.status === "live") ||
          (left.match.startsAt.getTime() - right.match.startsAt.getTime()) * (order === "asc" ? 1 : -1),
      )

      return {
        key: event.key,
        rated: entries,
        importance: Math.max(...entries.map((entry) => entry.importance)),
      }
    })
    .sort((left, right) => {
      const [first] = left.rated
      const [second] = right.rated

      if (first === undefined || second === undefined) return 0

      return compareByImportance(
        { importance: left.importance, tier: first.match.tournament.tier, startsAt: first.match.startsAt },
        { importance: right.importance, tier: second.match.tournament.tier, startsAt: second.match.startsAt },
      )
    })
}

function EventList({
  rated,
  showDate,
  order = "asc",
}: {
  rated: readonly RatedMatch[]
  showDate: boolean
  order?: Order
}) {
  return (
    <div className="flex flex-col gap-3">
      {ratedEvents(rated, order).map((event) => {
        const [first] = event.rated

        if (first === undefined) return null

        return (
          <EventCard
            key={event.key}
            tournament={first.match.tournament}
            matches={event.rated}
            showDate={showDate}
          />
        )
      })}
    </div>
  )
}

function Schedule({ rated, order }: { rated: readonly RatedMatch[]; order: Order }) {
  const byId = new Map(rated.map((entry) => [entry.match.id, entry]))
  const days = groupMatchesByDay(rated.map(({ match }) => match)).flatMap((day) => {
    const entries = day.matches.flatMap((match) => {
      const entry = byId.get(match.id)

      return entry === undefined ? [] : [entry]
    })
    const [first] = entries

    return first === undefined ? [] : [{ key: day.key, iso: first.match.startsAt.toISOString(), entries }]
  })

  return (
    <div className="flex flex-col gap-7">
      {days.length < 2 ? null : (
        <nav
          aria-label="Дни расписания"
          className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1"
        >
          {days.map((day) => (
            <a
              key={day.key}
              href={`#day-${day.key}`}
              className="inline-flex h-8 shrink-0 snap-start items-center rounded-full border border-border bg-surface px-3.5 text-caption font-medium text-muted-foreground transition-colors duration-150 hover:border-border-strong hover:text-foreground"
            >
              <LocalDayLabel value={day.iso} short />
              <span className="ml-1.5 tabular-nums text-subtle-foreground">{day.entries.length}</span>
            </a>
          ))}
        </nav>
      )}

      {days.map((day) => (
        <section key={day.key} id={`day-${day.key}`} className="flex scroll-mt-32 flex-col gap-3">
          <div className="sticky top-header z-10 -mx-1 flex items-baseline gap-3 bg-background/90 px-1 py-2 backdrop-blur-sm">
            <LocalDayLabel value={day.iso} className="text-caption font-bold text-foreground" />
            <span className="text-overline tabular-nums tracking-normal text-subtle-foreground">
              {pluralize(day.entries.length, ["матч", "матча", "матчей"])}
            </span>
            <span aria-hidden="true" className="h-px flex-1 self-center bg-border" />
          </div>

          <EventList rated={day.entries} showDate={false} order={order} />
        </section>
      ))}
    </div>
  )
}

/** Кадр из игры для карточки без трансляции: одинаковый у матча при каждом рендере. */
function backdropFor(match: Match, screenshots: readonly string[]): string | null {
  if (screenshots.length === 0) return null

  const seed = [...match.id].reduce((sum, char) => sum + char.charCodeAt(0), 0)

  return screenshots[seed % screenshots.length] ?? null
}

async function Featured({ rated, limit }: { rated: readonly RatedMatch[]; limit: number }) {
  const info = await getGameInfo()
  const screenshots = (info.ok ? info.data : EMPTY_GAME_INFO).screenshots.map((shot) => shot.full)
  const ordered = [...rated].sort((left, right) =>
    compareByImportance(
      { importance: left.importance, tier: left.match.tournament.tier, startsAt: left.match.startsAt },
      { importance: right.importance, tier: right.match.tournament.tier, startsAt: right.match.startsAt },
    ),
  )
  const featured = ordered.slice(0, limit)
  const rest = ordered.slice(limit)

  return (
    <div className="flex flex-col gap-4">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map(({ match }) => (
          <li key={match.id}>
            <LiveMatchCard match={match} backdrop={backdropFor(match, screenshots)} />
          </li>
        ))}
      </ul>
      {rest.length === 0 ? null : <EventList rated={rest} showDate={false} />}
    </div>
  )
}

export async function MatchCenter(props: MatchCenterProps) {
  const {
    kind,
    grouped = false,
    filter = "all",
    title,
    moreHref,
    moreLabel,
    emptyLabel,
    variant = "list",
    className,
  } = props
  const [result, ranks] = await Promise.all([loadMatches(props), loadRanks()])

  if (!result.ok) {
    return (
      <EmptyState
        tone="danger"
        title="Матчи недоступны"
        description={result.error.message}
        className={className}
      />
    )
  }

  const rated = rate(result.data, ranks)
  const visible = filter === "top" ? rated.filter(isTop) : rated

  if (visible.length === 0) {
    if (emptyLabel === undefined) return null

    return <EmptyState title={emptyLabel} className={className} />
  }

  return (
    <section className={cn("flex flex-col gap-4", className)}>
      {title ? (
        <SectionHeading
          title={
            kind === "live" ? (
              <span className="flex items-center gap-2.5">
                {title}
                <span className="rounded-xs bg-live px-1.5 py-0.5 text-overline font-bold tabular-nums text-live-foreground">
                  {visible.length}
                </span>
              </span>
            ) : (
              title
            )
          }
          action={
            moreHref ? (
              <Link
                href={moreHref}
                className="text-caption font-medium text-primary transition-colors duration-150 hover:text-primary-hover"
              >
                {moreLabel ?? "Все матчи"}
              </Link>
            ) : null
          }
        />
      ) : null}

      {variant === "cards" ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.slice(0, props.limit ?? 6).map(({ match }) => (
            <li key={match.id}>
              <LiveMatchCard match={match} />
            </li>
          ))}
        </ul>
      ) : variant === "featured" ? (
        <Featured rated={visible} limit={FEATURED_LIMIT} />
      ) : grouped ? (
        <Schedule rated={visible} order={kind === "results" ? "desc" : "asc"} />
      ) : (
        <div className="overflow-hidden rounded-surface border border-border bg-surface">
          <ul className="divide-y divide-border">
            {visible.map(({ match, importance }) => (
              <li key={match.id}>
                <MatchLine match={match} importance={importance} showDate={kind !== "live"} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

export function MatchCenterSkeleton({
  rows = 4,
  className,
}: {
  rows?: number
  className?: string
}) {
  const items = Array.from({ length: rows }, (_, index) => index)

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {items.map((item) => (
        <MatchRowSkeleton key={item} />
      ))}
    </div>
  )
}

export function ScheduleSkeleton({ events = 3, className }: { events?: number; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <span className="h-3 w-48 rounded-xs bg-skeleton" />
      {Array.from({ length: events }, (_, index) => (
        <EventCardSkeleton key={index} rows={index === 0 ? 3 : 2} />
      ))}
    </div>
  )
}
