import type { Route } from "next"
import Image from "next/image"
import Link from "next/link"

import {
  getLiveMatches,
  getMatchResults,
  getPlayerMatches,
  getTeamMatches,
  getTournamentMatches,
  getUpcomingMatches,
  groupMatchesByDay,
  MatchRow,
  MatchRowSkeleton,
} from "@/entities/match"
import type { Match, MatchEventGroup, MatchListKind } from "@/entities/match"
import { tournamentHref } from "@/entities/tournament"
import { formatDayLabel } from "@/shared/lib/date"
import { cn } from "@/shared/lib/style"
import { EmptyState } from "@/shared/ui/empty-state"
import { SectionHeading } from "@/shared/ui/section-heading"

export type MatchCenterProps = {
  kind: MatchListKind
  limit?: number
  grouped?: boolean
  title?: string
  moreHref?: Route
  moreLabel?: string
  teamSlug?: string
  playerSlug?: string
  tournamentSlug?: string
  emptyLabel?: string
  className?: string
}

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

function MatchList({ matches, showDate }: { matches: readonly Match[]; showDate: boolean }) {
  return (
    <ul className="flex flex-col gap-2">
      {matches.map((match) => (
        <li key={match.id}>
          <MatchRow match={match} showDate={showDate} />
        </li>
      ))}
    </ul>
  )
}

function EventHeading({ event }: { event: MatchEventGroup }) {
  return (
    <Link
      href={tournamentHref(event.slug)}
      className="group inline-flex min-h-9 items-center gap-2.5 self-start rounded-control px-1 py-1 transition-colors duration-150 hover:bg-muted"
    >
      {event.logo === null ? (
        <span
          aria-hidden="true"
          className="flex size-6 shrink-0 items-center justify-center rounded-xs bg-muted text-overline font-bold text-subtle-foreground"
        >
          {event.name.slice(0, 1).toUpperCase()}
        </span>
      ) : (
        <Image
          src={event.logo}
          alt=""
          width={24}
          height={24}
          className="size-6 shrink-0 object-contain"
        />
      )}
      <span className="truncate text-caption font-semibold text-foreground transition-colors duration-150 group-hover:text-primary">
        {event.name}
      </span>
      <span className="shrink-0 text-overline tabular-nums text-subtle-foreground">
        {event.matches.length}
      </span>
    </Link>
  )
}

export async function MatchCenter(props: MatchCenterProps) {
  const { kind, grouped = false, title, moreHref, moreLabel, emptyLabel, className } = props
  const result = await loadMatches(props)

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

  if (result.data.length === 0) {
    if (emptyLabel === undefined) return null

    return <EmptyState title={emptyLabel} className={className} />
  }

  const days = grouped ? groupMatchesByDay(result.data) : []

  return (
    <section className={cn("flex flex-col gap-4", className)}>
      {title ? (
        <SectionHeading
          title={title}
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

      {grouped ? (
        <div className="flex flex-col gap-8">
          {days.map((day) => (
            <div key={day.key} className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <h3 className="text-caption font-bold tabular-nums uppercase tracking-wider text-foreground">
                  {formatDayLabel(day.date)}
                </h3>
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
              </div>

              {day.events.map((event) => (
                <div key={event.key} className="flex flex-col gap-2">
                  <EventHeading event={event} />
                  <MatchList matches={event.matches} showDate={false} />
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <MatchList matches={result.data} showDate={kind !== "live"} />
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
