import { ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { MatchLine } from "@/entities/match"
import type { Match, MatchImportance } from "@/entities/match"
import { TournamentTierBadge, tournamentHref } from "@/entities/tournament"
import type { TournamentRef } from "@/entities/tournament"
import { cn } from "@/shared/lib/style"
import { pluralize } from "@/shared/lib/text"

export type RatedMatch = {
  match: Match
  importance: MatchImportance
}

export type EventCardProps = {
  tournament: TournamentRef
  matches: readonly RatedMatch[]
  showDate?: boolean
  className?: string
}

/** Турнир и его матчи одним блоком — шапка события и плотные строки под ней. */
export function EventCard({ tournament, matches, showDate = false, className }: EventCardProps) {
  const live = matches.some(({ match }) => match.status === "live")

  return (
    <article
      className={cn(
        "overflow-hidden rounded-surface border bg-surface",
        live ? "border-live/40" : "border-border",
        className,
      )}
    >
      <header className="flex items-center gap-3 border-b border-border bg-elevated/60 px-3 py-2 sm:px-4">
        <Link
          href={tournamentHref(tournament.slug)}
          className="group flex min-w-0 flex-1 items-center gap-2.5"
        >
          {tournament.logo === null ? (
            <span
              aria-hidden="true"
              className="flex size-6 shrink-0 items-center justify-center rounded-xs bg-muted text-overline font-bold text-subtle-foreground"
            >
              {tournament.name.slice(0, 1).toUpperCase()}
            </span>
          ) : (
            <Image
              src={tournament.logo}
              alt=""
              width={24}
              height={24}
              className="size-6 shrink-0 object-contain"
            />
          )}
          <span className="truncate text-caption font-semibold text-foreground transition-colors duration-150 group-hover:text-primary">
            {tournament.name}
          </span>
          <ChevronRight
            aria-hidden="true"
            className="size-3.5 shrink-0 text-subtle-foreground transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-primary"
          />
        </Link>
        {tournament.tier === "s" || tournament.tier === "a" ? (
          <TournamentTierBadge tier={tournament.tier} className="shrink-0" />
        ) : null}
        <span className="hidden shrink-0 text-overline tabular-nums text-subtle-foreground sm:inline">
          {pluralize(matches.length, ["матч", "матча", "матчей"])}
        </span>
      </header>

      <ul className="divide-y divide-border">
        {matches.map(({ match, importance }) => (
          <li key={match.id}>
            <MatchLine match={match} importance={importance} showDate={showDate} />
          </li>
        ))}
      </ul>
    </article>
  )
}

export function EventCardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-surface border border-border bg-surface">
      <div className="flex h-10 items-center gap-2.5 border-b border-border bg-elevated/60 px-4">
        <span className="size-6 rounded-xs bg-skeleton" />
        <span className="h-3 w-40 rounded-xs bg-skeleton" />
      </div>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex h-15 items-center gap-4 border-b border-border px-4 last:border-0">
          <span className="h-3 w-10 rounded-xs bg-skeleton" />
          <span className="h-3 flex-1 rounded-xs bg-skeleton" />
          <span className="h-3 w-8 rounded-xs bg-skeleton" />
          <span className="h-3 flex-1 rounded-xs bg-skeleton" />
        </div>
      ))}
    </div>
  )
}
