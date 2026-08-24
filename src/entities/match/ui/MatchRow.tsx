import Image from "next/image"
import Link from "next/link"

import { SITE } from "@/shared/config"
import { formatDayMonth, formatTime } from "@/shared/lib/date"
import { cn } from "@/shared/lib/style"

import { matchHref } from "../lib/matchHref"
import { MATCH_FORMAT_LABEL } from "../model/match"
import type { Match, MatchSide } from "../model/match"

function SideLine({
  side,
  live,
  showScore,
}: {
  side: MatchSide
  live: boolean
  showScore: boolean
}) {
  return (
    <span className="flex items-center gap-2.5">
      <Image
        src={side.team.logo.url}
        alt={side.team.logo.alt}
        width={20}
        height={20}
        className="size-5 shrink-0 rounded-xs object-contain"
      />
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-sm",
          side.isWinner ? "font-semibold text-foreground" : "text-muted-foreground",
        )}
      >
        {side.team.name}
      </span>
      {showScore ? (
        <span
          className={cn(
            "w-5 shrink-0 text-right text-sm font-semibold tabular-nums",
            live ? "text-live" : side.isWinner ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {side.score}
        </span>
      ) : null}
    </span>
  )
}

export type MatchRowProps = {
  match: Match
  showDate?: boolean
  className?: string
}

export function MatchRow({ match, showDate = false, className }: MatchRowProps) {
  const live = match.status === "live"
  const showScore = match.status !== "scheduled"
  const [first, second] = match.teams

  return (
    <Link
      href={matchHref(match.discipline.slug, match.id)}
      className={cn(
        "flex items-center gap-4 rounded-control border border-border bg-surface px-4 py-3 transition-colors duration-150 hover:border-border-strong hover:bg-muted/60",
        live && "border-live/40",
        className,
      )}
    >
      <span className="flex w-14 shrink-0 flex-col items-start gap-0.5">
        {live ? (
          <span className="inline-flex items-center gap-1.5 text-overline font-bold uppercase text-live">
            <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-live" />
            LIVE
          </span>
        ) : (
          <span className="text-caption font-medium tabular-nums text-foreground">
            {formatTime(match.startsAt, SITE.locale)}
          </span>
        )}
        {showDate ? (
          <span className="text-overline uppercase text-subtle-foreground">
            {formatDayMonth(match.startsAt, SITE.locale)}
          </span>
        ) : null}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <SideLine side={first} live={live} showScore={showScore} />
        <SideLine side={second} live={live} showScore={showScore} />
      </span>

      <span className="hidden w-44 shrink-0 flex-col items-end gap-0.5 sm:flex">
        <span className="text-overline uppercase text-subtle-foreground">
          {MATCH_FORMAT_LABEL[match.format]} · {match.stage}
        </span>
        <span className="w-full truncate text-right text-caption text-muted-foreground">
          {match.tournament.name}
        </span>
      </span>
    </Link>
  )
}
