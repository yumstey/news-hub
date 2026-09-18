import Link from "next/link"

import { MATCH_FORMAT_LABEL, MatchStatusBadge } from "@/entities/match"
import type { Match, MatchSide } from "@/entities/match"
import { teamHref, TeamLogo } from "@/entities/team"
import { tournamentHref } from "@/entities/tournament"
import { formatDateTime } from "@/shared/lib/date"
import { cn } from "@/shared/lib/style"
import { CountryTag } from "@/shared/ui/country-tag"
import { Separator } from "@/shared/ui/separator"
import { Heading, Text } from "@/shared/ui/typography"

function Side({
  side,
  align,
}: {
  side: MatchSide
  align: "start" | "end"
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center gap-3 text-center sm:gap-4",
        align === "start" ? "sm:items-start sm:text-left" : "sm:items-end sm:text-right",
      )}
    >
      <TeamLogo
        logo={side.team.logo}
        darkLogo={side.team.darkLogo}
        size={72}
        eager
        className="size-14 rounded-control sm:size-18"
      />
      <div className="flex min-w-0 flex-col gap-1">
        <Link
          href={teamHref(side.team.slug)}
          className={cn(
            "truncate text-subheading transition-colors duration-150 hover:text-primary",
            side.isWinner ? "font-bold text-foreground" : "text-muted-foreground",
          )}
        >
          {side.team.name}
        </Link>
        <CountryTag
          country={side.team.country}
          showName
          className={cn(
            "text-caption text-subtle-foreground",
            align === "end" ? "sm:flex-row-reverse" : undefined,
          )}
        />
      </div>
    </div>
  )
}

export type MatchScoreboardProps = {
  match: Match
  className?: string
}

export function MatchScoreboard({ match, className }: MatchScoreboardProps) {
  const [first, second] = match.teams
  const live = match.status === "live"
  const showScore = match.status !== "scheduled"

  return (
    <section
      className={cn(
        "flex flex-col gap-6 rounded-surface border bg-surface p-6",
        live ? "border-live/40" : "border-border",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <MatchStatusBadge status={match.status} />
          <Text size="caption" tone="muted">
            {MATCH_FORMAT_LABEL[match.format]} · {match.stage}
          </Text>
        </div>
        <Link
          href={tournamentHref(match.tournament.slug)}
          className="text-caption font-medium text-primary transition-colors duration-150 hover:text-primary-hover"
        >
          {match.tournament.name}
        </Link>
      </div>

      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <Side side={first} align="start" />

        <div className="flex shrink-0 flex-col items-center gap-1">
          {showScore ? (
            <span
              className={cn(
                "flex items-baseline gap-2 text-title font-bold tabular-nums",
                live ? "text-live" : "text-foreground",
              )}
            >
              <span
                className={cn(
                  "transition-colors duration-200",
                  first.score > second.score
                    ? "text-success"
                    : first.score < second.score
                      ? "text-danger"
                      : undefined,
                )}
              >
                {first.score}
              </span>
              <span className="text-subtle-foreground">:</span>
              <span
                className={cn(
                  "transition-colors duration-200",
                  second.score > first.score
                    ? "text-success"
                    : second.score < first.score
                      ? "text-danger"
                      : undefined,
                )}
              >
                {second.score}
              </span>
            </span>
          ) : (
            <span className="text-subheading font-semibold text-muted-foreground">vs</span>
          )}
          <Text size="caption" tone="subtle">
            {formatDateTime(match.startsAt)}
          </Text>
        </div>

        <Side side={second} align="end" />
      </div>

      {match.maps.length > 0 ? (
        <>
          <Separator />
          <div className="flex flex-col gap-3">
            <Heading level={2} size="subheading" className="text-sm">
              Карты
            </Heading>
            <ul className="flex flex-col gap-2">
              {match.maps.map((entry) => (
                <li
                  key={entry.name}
                  className="flex items-center justify-between gap-4 rounded-control bg-muted px-4 py-2.5"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {entry.name}
                    </span>
                    <span className="text-overline uppercase text-subtle-foreground">
                      {entry.pick === "decider"
                        ? "решающая"
                        : entry.pick === "side1"
                          ? `пик ${first.team.shortName}`
                          : `пик ${second.team.shortName}`}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 text-sm font-semibold tabular-nums">
                    {entry.status === "upcoming" ? (
                      <span className="text-subtle-foreground">—</span>
                    ) : (
                      <>
                        <span
                          className={cn(
                            entry.side1Score > entry.side2Score
                              ? "text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {entry.side1Score}
                        </span>
                        <span className="text-subtle-foreground">:</span>
                        <span
                          className={cn(
                            entry.side2Score > entry.side1Score
                              ? "text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {entry.side2Score}
                        </span>
                      </>
                    )}
                    {entry.status === "live" ? (
                      <span className="text-overline font-bold uppercase text-live">live</span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}

      {match.streams.length > 0 ? (
        <>
          <Separator />
          <div className="flex flex-wrap items-center gap-2">
            {match.streams.map((stream) => (
              <a
                key={`${stream.platform}-${stream.language}`}
                href={stream.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-2 rounded-full border border-border px-3 text-caption font-medium text-foreground transition-colors duration-150 hover:border-border-strong hover:bg-muted"
              >
                <span>{stream.platform}</span>
                <span className="text-subtle-foreground">{stream.language}</span>
              </a>
            ))}
          </div>
        </>
      ) : null}
    </section>
  )
}
