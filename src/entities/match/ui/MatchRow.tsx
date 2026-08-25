import Link from "next/link"

import { TeamLogo } from "@/entities/team/@x/match"
import { formatDayMonth, formatTime, toIsoDate } from "@/shared/lib/date"
import { cn } from "@/shared/lib/style"

import { matchHref } from "../lib/matchHref"
import { MATCH_FORMAT_LABEL } from "../model/match"
import type { Match, MatchSide } from "../model/match"

function SideLine({
  side,
  opponentScore,
  live,
  showScore,
}: {
  side: MatchSide
  opponentScore: number
  live: boolean
  showScore: boolean
}) {
  const winning = side.isWinner || (live && side.score > opponentScore)
  const losing = showScore && !winning && side.score < opponentScore

  return (
    <span className="flex items-center gap-2.5">
      <TeamLogo logo={side.team.logo} darkLogo={side.team.darkLogo} size={20} className="size-5" />
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-sm transition-colors duration-200",
          winning ? "font-semibold text-foreground" : "text-muted-foreground",
        )}
      >
        {side.team.name}
      </span>
      {showScore ? (
        <span
          className={cn(
            "w-6 shrink-0 rounded-xs text-center text-sm font-bold tabular-nums transition-colors duration-200",
            winning
              ? "bg-success-soft text-success"
              : losing
                ? "bg-danger-soft text-danger"
                : "text-muted-foreground",
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
      href={matchHref(match.id)}
      className={cn(
        "group flex min-h-16 items-center gap-3 rounded-control border border-border bg-surface px-3 py-3",
        "transition-all duration-200 hover:-translate-y-px hover:border-border-strong hover:bg-muted/60 hover:shadow-surface active:translate-y-0 active:bg-muted",
        live && "border-live/40",
        "sm:gap-4 sm:px-4",
        className,
      )}
    >
      <span className="flex w-14 shrink-0 flex-col items-start gap-0.5">
        {live ? (
          <span className="inline-flex items-center gap-1.5 text-overline font-bold uppercase text-live">
            <span aria-hidden="true" className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-live-ping rounded-full bg-live" />
              <span className="relative inline-flex size-1.5 rounded-full bg-live" />
            </span>
            LIVE
          </span>
        ) : (
          <time
            dateTime={toIsoDate(match.startsAt)}
            className="text-caption font-medium tabular-nums text-foreground"
          >
            {formatTime(match.startsAt)}
          </time>
        )}
        {showDate ? (
          <span className="text-overline tabular-nums text-subtle-foreground">
            {formatDayMonth(match.startsAt)}
          </span>
        ) : null}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <SideLine
          side={first}
          opponentScore={second.score}
          live={live}
          showScore={showScore}
        />
        <SideLine
          side={second}
          opponentScore={first.score}
          live={live}
          showScore={showScore}
        />
      </span>

      <span className="hidden w-40 shrink-0 flex-col items-end gap-0.5 sm:flex">
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
