import { Clock } from "lucide-react"

import type { Match, MatchSide } from "@/entities/match"
import { TeamLogo } from "@/entities/team"
import { cn } from "@/shared/lib/style"
import { SectionHeading } from "@/shared/ui/section-heading"
import { Text } from "@/shared/ui/typography"

function duration(seconds: number | null): string | null {
  if (seconds === null || seconds <= 0) return null

  const minutes = Math.round(seconds / 60)

  return `${minutes} мин`
}

function sideOf(match: Match, teamId: string | null): MatchSide | null {
  if (teamId === null) return null

  return match.teams.find((side) => side.team.id === teamId) ?? null
}

export type MatchMapsProps = {
  match: Match
  className?: string
}

export function MatchMaps({ match, className }: MatchMapsProps) {
  if (match.games.length === 0) return null

  const [first, second] = match.teams

  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <SectionHeading title="Карты" />

      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {match.games.map((game) => {
          const winner = sideOf(match, game.winnerTeamId)
          const length = duration(game.lengthSeconds)
          const pending = !game.finished

          return (
            <li key={game.position}>
              <div
                className={cn(
                  "relative flex min-h-24 flex-col justify-between overflow-hidden rounded-surface border bg-surface p-4",
                  "transition-colors duration-200",
                  winner === null ? "border-border" : "border-success/40",
                )}
              >
                <div
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-linear-to-l to-transparent",
                    winner === null ? "from-muted/40" : "from-success/10",
                  )}
                />

                <div className="relative flex items-center justify-between gap-2">
                  <span className="text-overline uppercase tracking-wider text-subtle-foreground">
                    Карта {game.position}
                  </span>
                  {length === null ? null : (
                    <span className="inline-flex items-center gap-1 text-overline tabular-nums text-subtle-foreground">
                      <Clock aria-hidden="true" className="size-3" />
                      {length}
                    </span>
                  )}
                </div>

                <div className="relative mt-3 flex items-center gap-2.5">
                  {pending ? (
                    <Text as="span" size="caption" tone="subtle">
                      Ещё не сыграна
                    </Text>
                  ) : winner === null ? (
                    <Text as="span" size="caption" tone="subtle">
                      Результат не опубликован
                    </Text>
                  ) : (
                    <>
                      <TeamLogo
                        logo={winner.team.logo}
                        darkLogo={winner.team.darkLogo}
                        size={24}
                        className="size-6 rounded-xs"
                      />
                      <span className="truncate text-sm font-semibold text-success">
                        {winner.team.name}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <Text size="caption" tone="subtle">
        Названия карт и счёт по раундам ({first.team.shortName} — {second.team.shortName})
        не публикуются на текущем тарифе данных.
      </Text>
    </section>
  )
}
