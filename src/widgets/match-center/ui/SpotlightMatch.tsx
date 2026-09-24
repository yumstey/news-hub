import { ArrowRight, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import {
  getLiveMatches,
  getUpcomingMatches,
  MATCH_FORMAT_LABEL,
  matchHref,
  matchImportance,
  pickStream,
  stageLabel,
  twitchPreview,
} from "@/entities/match"
import type { Match, MatchImportance, MatchSide } from "@/entities/match"
import { getTeamRankings, TeamLogo } from "@/entities/team"
import { cn } from "@/shared/lib/style"
import { LocalTime } from "@/shared/ui/local-time"

const UPCOMING_POOL = 40

function Stars({ value }: { value: MatchImportance }) {
  if (value === 0) return null

  return (
    <span role="img" aria-label={`Важность: ${value} из 3`} className="flex items-center gap-px">
      {[1, 2, 3].map((index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={cn("size-3", index <= value ? "fill-warning text-warning" : "fill-transparent text-border-strong")}
        />
      ))}
    </span>
  )
}

function Side({ side, live, showScore }: { side: MatchSide; live: boolean; showScore: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <TeamLogo logo={side.team.logo} darkLogo={side.team.darkLogo} size={32} className="size-8" />
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{side.team.name}</span>
      {showScore ? (
        <span className={cn("text-lg font-bold tabular-nums", live ? "text-live" : "text-foreground")}>
          {side.score}
        </span>
      ) : null}
    </div>
  )
}

/**
 * Матч дня: самый статусный матч в эфире или ближайший топ-матч. Правая
 * колонка героя, чтобы с первого экрана было что смотреть.
 */
export async function SpotlightMatch() {
  const [live, upcoming, rankings] = await Promise.all([
    getLiveMatches(),
    getUpcomingMatches(UPCOMING_POOL),
    getTeamRankings(),
  ])

  const ranks = new Map(rankings.ok ? rankings.data.map((row) => [row.team.id, row.rank]) : [])
  const pool = [...(live.ok ? live.data : []), ...(upcoming.ok ? upcoming.data : [])]
  const rated = pool
    .map((match) => ({ match, importance: matchImportance(match, ranks) }))
    .sort(
      (left, right) =>
        right.importance - left.importance ||
        Number(right.match.status === "live") - Number(left.match.status === "live") ||
        left.match.startsAt.getTime() - right.match.startsAt.getTime(),
    )

  const best = rated[0]

  if (best === undefined) return null

  const match: Match = best.match
  const [first, second] = match.teams
  const isLive = match.status === "live"
  const stream = isLive ? pickStream(match.streams) : null
  const preview = stream === null ? null : twitchPreview(stream.url, 480, 270)
  const stage = stageLabel(match.stage)

  return (
    <article className="overflow-hidden rounded-surface border border-border bg-surface/85 shadow-surface backdrop-blur-md">
      {preview === null ? null : (
        // На телефоне кадр трансляции съедал весь первый экран — показываем с sm.
        <span className="relative hidden aspect-video w-full overflow-hidden bg-muted sm:block">
          <Image
            src={preview}
            alt={`Трансляция: ${first.team.name} — ${second.team.name}`}
            fill
            unoptimized
            sizes="24rem"
            className="object-cover"
          />
        </span>
      )}

      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-overline font-bold uppercase",
              isLive ? "text-live" : "text-primary",
            )}
          >
            {isLive ? (
              <>
                <span aria-hidden="true" className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-live-ping rounded-full bg-live" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-live" />
                </span>
                Матч в эфире
              </>
            ) : (
              "Матч дня"
            )}
          </span>
          <Stars value={best.importance} />
        </div>

        <div className="flex flex-col gap-2.5">
          <Side side={first} live={isLive} showScore={isLive} />
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <span className="text-overline uppercase text-subtle-foreground">
              {isLive ? MATCH_FORMAT_LABEL[match.format] : <LocalTime value={match.startsAt.toISOString()} format="time-day" />}
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
          </div>
          <Side side={second} live={isLive} showScore={isLive} />
        </div>

        <p className="truncate text-caption text-muted-foreground">
          {match.tournament.name}
          {stage.length === 0 ? null : ` · ${stage}`}
        </p>

        <Link
          href={matchHref(match.id)}
          className={cn(
            "inline-flex h-10 items-center justify-center gap-2 rounded-control px-4 text-sm font-semibold transition-colors duration-150",
            isLive
              ? "bg-live text-live-foreground hover:opacity-90"
              : "bg-primary text-primary-foreground hover:bg-primary-hover",
          )}
        >
          {isLive ? "Смотреть матч" : "Открыть матч"}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </article>
  )
}

export function SpotlightMatchSkeleton() {
  return <div className="h-72 w-full rounded-surface border border-border bg-skeleton/60 backdrop-blur-md" />
}
