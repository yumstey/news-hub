"use client"
import Link from "next/link"

import {
  getLiveMatches,
  getMatchResults,
  getTeamMatches,
  getTournamentMatches,
  getUpcomingMatches,
  groupMatchesByDay,
  MatchRow,
  MatchRowSkeleton,
} from "@/entities/match"
import type { Match, MatchListKind } from "@/entities/match"
import { SITE } from "@/shared/config"
import type { DisciplineSectionPath } from "@/shared/config"
import { formatDayLabel } from "@/shared/lib/date"
import { cn } from "@/shared/lib/style"
import { EmptyState } from "@/shared/ui/empty-state"
import { SectionHeading } from "@/shared/ui/section-heading"

export type MatchCenterProps = {
  disciplineSlug: string
  kind: MatchListKind
  limit?: number
  grouped?: boolean
  title?: string
  moreHref?: DisciplineSectionPath
  moreLabel?: string
  teamSlug?: string
  tournamentSlug?: string
  emptyLabel?: string
  className?: string
}

async function loadMatches(props: MatchCenterProps) {
  const { disciplineSlug, kind, limit, teamSlug, tournamentSlug } = props

  if (tournamentSlug !== undefined) {
    return getTournamentMatches(disciplineSlug, tournamentSlug, limit)
  }

  if (teamSlug !== undefined) {
    return getTeamMatches(
      disciplineSlug,
      teamSlug,
      kind === "results" ? "results" : "upcoming",
      limit,
    )
  }

  if (kind === "live") return getLiveMatches(disciplineSlug)
  if (kind === "results") return getMatchResults(disciplineSlug, limit)

  return getUpcomingMatches(disciplineSlug, limit)
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
        <div className="flex flex-col gap-6">
          {days.map((day) => (
            <div key={day.key} className="flex flex-col gap-2">
              <h3 className="text-overline uppercase text-subtle-foreground">
                {formatDayLabel(day.date, SITE.locale)}
              </h3>
              <MatchList matches={day.matches} showDate={false} />
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
