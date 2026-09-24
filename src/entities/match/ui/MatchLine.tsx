import { Star } from "lucide-react"
import Link from "next/link"

import { TeamLogo } from "@/entities/team/@x/match"
import { cn } from "@/shared/lib/style"
import { LocalTime } from "@/shared/ui/local-time"

import { matchHref } from "../lib/matchHref"
import type { MatchImportance } from "../lib/matchImportance"
import { stageLabel } from "../lib/stageLabel"
import { MATCH_FORMAT_LABEL } from "../model/match"
import type { Match, MatchSide } from "../model/match"

function Stars({ value }: { value: MatchImportance }) {
  if (value === 0) return null

  return (
    <span role="img" aria-label={`Важность: ${value} из 3`} className="flex items-center gap-px">
      {[1, 2, 3].map((index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={cn(
            "size-2.5",
            index <= value ? "fill-warning text-warning" : "fill-transparent text-border-strong",
          )}
        />
      ))}
    </span>
  )
}

type Outcome = "win" | "loss" | "none"

function outcomeOf(side: MatchSide, other: MatchSide, match: Match): Outcome {
  if (match.status === "finished") return side.isWinner ? "win" : other.isWinner ? "loss" : "none"
  if (match.status === "live" && side.score !== other.score) {
    return side.score > other.score ? "win" : "loss"
  }

  return "none"
}

function Team({
  side,
  outcome,
  showScore,
  live,
  mirrored,
  className,
}: {
  side: MatchSide
  outcome: Outcome
  showScore: boolean
  live: boolean
  /** На широком экране левая команда прижата к счёту: логотип справа. */
  mirrored: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        "flex min-w-0 items-center gap-2.5",
        mirrored && "sm:flex-row-reverse sm:text-right",
        className,
      )}
    >
      <TeamLogo logo={side.team.logo} darkLogo={side.team.darkLogo} size={20} className="size-5" />
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-sm",
          outcome === "win" ? "font-semibold text-foreground" : outcome === "loss" ? "text-subtle-foreground" : "text-foreground",
        )}
      >
        {side.team.name}
      </span>
      {showScore ? (
        <span
          className={cn(
            "w-5 shrink-0 text-center text-sm font-bold tabular-nums sm:hidden",
            live ? "text-live" : outcome === "win" ? "text-foreground" : "text-subtle-foreground",
          )}
        >
          {side.score}
        </span>
      ) : null}
    </span>
  )
}

export type MatchLineProps = {
  match: Match
  importance?: MatchImportance
  /** Показывать дату рядом со временем — для списков без группировки по дням. */
  showDate?: boolean
  className?: string
}

/**
 * Строка матча в карточке турнира, как на HLTV: время, команды друг напротив
 * друга и счёт посередине. На телефоне команды складываются в две строки.
 */
export function MatchLine({ match, importance = 0, showDate = false, className }: MatchLineProps) {
  const [first, second] = match.teams
  const live = match.status === "live"
  const showScore = match.status === "live" || match.status === "finished"
  const firstOutcome = outcomeOf(first, second, match)
  const secondOutcome = outcomeOf(second, first, match)
  const stage = stageLabel(match.stage)

  return (
    <Link
      href={matchHref(match.id)}
      className={cn(
        "group grid grid-cols-[3.25rem_minmax(0,1fr)_auto] grid-rows-2 items-center gap-x-3 gap-y-1.5 px-3 py-2.5",
        "sm:grid-cols-[3.75rem_minmax(0,1fr)_4.5rem_minmax(0,1fr)_6.5rem] sm:grid-rows-1 sm:gap-x-4 sm:px-4",
        "transition-colors duration-150 hover:bg-muted/70",
        live && "bg-live/5",
        className,
      )}
    >
      <span className="col-start-1 row-span-2 row-start-1 flex flex-col gap-0.5 sm:row-span-1">
        {live ? (
          <span className="inline-flex items-center gap-1.5 text-overline font-bold uppercase text-live">
            <span aria-hidden="true" className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-live-ping rounded-full bg-live" />
              <span className="relative inline-flex size-1.5 rounded-full bg-live" />
            </span>
            Live
          </span>
        ) : (
          <LocalTime
            value={match.startsAt.toISOString()}
            format={showDate ? "time-day" : "time"}
            className={cn(
              "text-caption font-semibold tabular-nums",
              match.status === "finished" ? "text-subtle-foreground" : "text-foreground",
              showDate && "text-overline tracking-normal",
            )}
          />
        )}
        <span className="text-overline tracking-normal text-subtle-foreground sm:hidden">
          {MATCH_FORMAT_LABEL[match.format]}
        </span>
      </span>

      <Team
        side={first}
        outcome={firstOutcome}
        showScore={showScore}
        live={live}
        mirrored
        className="col-start-2 row-start-1"
      />

      <span className="hidden items-center justify-center gap-1 text-sm font-bold tabular-nums sm:col-start-3 sm:row-start-1 sm:flex">
        {showScore ? (
          <>
            <span className={cn(live ? "text-live" : firstOutcome === "win" ? "text-foreground" : "text-subtle-foreground")}>
              {first.score}
            </span>
            <span className="text-subtle-foreground">:</span>
            <span className={cn(live ? "text-live" : secondOutcome === "win" ? "text-foreground" : "text-subtle-foreground")}>
              {second.score}
            </span>
          </>
        ) : (
          <span className="rounded-xs bg-muted px-2 py-0.5 text-overline font-bold uppercase text-subtle-foreground transition-colors duration-150 group-hover:bg-primary-soft group-hover:text-primary">
            vs
          </span>
        )}
      </span>

      <Team
        side={second}
        outcome={secondOutcome}
        showScore={showScore}
        live={live}
        mirrored={false}
        className="col-start-2 row-start-2 sm:col-start-4 sm:row-start-1"
      />

      <span className="col-start-3 row-span-2 row-start-1 flex flex-col items-end gap-1 sm:col-start-5 sm:row-span-1">
        <Stars value={importance} />
        <span className="hidden max-w-full truncate text-overline uppercase text-subtle-foreground sm:block">
          {MATCH_FORMAT_LABEL[match.format]}
          {stage.length > 0 ? ` · ${stage}` : null}
        </span>
      </span>
    </Link>
  )
}
