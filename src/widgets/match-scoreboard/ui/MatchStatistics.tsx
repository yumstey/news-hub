import { PLAYER_ROLE_LABEL, PlayerIdentity } from "@/entities/player"
import type { Match, MatchPlayerStat } from "@/entities/match"
import type { PlayerRef } from "@/entities/player"
import { cn } from "@/shared/lib/style"
import { SectionHeading } from "@/shared/ui/section-heading"
import { Heading, Text } from "@/shared/ui/typography"

function ratingTone(rating: number): string {
  if (rating >= 1.15) return "text-success"
  if (rating < 0.95) return "text-danger"
  return "text-foreground"
}

function StatTable({
  teamName,
  rows,
}: {
  teamName: string
  rows: readonly MatchPlayerStat[]
}) {
  return (
    <div className="flex flex-col gap-3">
      <Heading level={3} size="subheading" className="text-sm">
        {teamName}
      </Heading>
      <div className="overflow-x-auto">
        <table className="w-full min-w-140 border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-overline uppercase text-subtle-foreground">
              <th scope="col" className="py-2 pr-3 text-left font-semibold">
                Игрок
              </th>
              <th scope="col" className="px-2 py-2 text-right font-semibold">
                K
              </th>
              <th scope="col" className="px-2 py-2 text-right font-semibold">
                D
              </th>
              <th scope="col" className="px-2 py-2 text-right font-semibold">
                A
              </th>
              <th scope="col" className="px-2 py-2 text-right font-semibold">
                ADR
              </th>
              <th scope="col" className="px-2 py-2 text-right font-semibold">
                KAST
              </th>
              <th scope="col" className="py-2 pl-2 text-right font-semibold">
                Рейтинг
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.player.id} className="border-b border-border last:border-0">
                <td className="py-2.5 pr-3">
                  <PlayerIdentity
                    slug={row.player.slug}
                    nickname={row.player.nickname}
                    photo={row.player.photo}
                    country={row.player.country}
                  />
                </td>
                <td className="px-2 py-2.5 text-right tabular-nums text-foreground">{row.kills}</td>
                <td className="px-2 py-2.5 text-right tabular-nums text-muted-foreground">
                  {row.deaths}
                </td>
                <td className="px-2 py-2.5 text-right tabular-nums text-muted-foreground">
                  {row.assists}
                </td>
                <td className="px-2 py-2.5 text-right tabular-nums text-muted-foreground">
                  {row.adr.toFixed(1)}
                </td>
                <td className="px-2 py-2.5 text-right tabular-nums text-muted-foreground">
                  {row.kast.toFixed(1)}%
                </td>
                <td
                  className={cn(
                    "py-2.5 pl-2 text-right font-semibold tabular-nums",
                    ratingTone(row.rating),
                  )}
                >
                  {row.rating.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export type MatchStatisticsProps = {
  match: Match
  className?: string
}

export function MatchStatistics({ match, className }: MatchStatisticsProps) {
  if (match.statistics === null) return null

  const [first, second] = match.teams
  const [firstStats, secondStats] = match.statistics

  return (
    <section className={cn("flex flex-col gap-8", className)}>
      <SectionHeading title="Статистика" />
      <StatTable
        teamName={first.team.name}
        rows={firstStats}
      />
      <StatTable
        teamName={second.team.name}
        rows={secondStats}
      />
    </section>
  )
}

function LineupColumn({
  teamName,
  players,
}: {
  teamName: string
  players: readonly PlayerRef[]
}) {
  return (
    <div className="flex flex-col gap-3 rounded-surface border border-border bg-surface p-5">
      <Heading level={3} size="subheading" className="text-sm">
        {teamName}
      </Heading>
      <ul className="flex flex-col gap-3">
        {players.map((player) => (
          <li key={player.id} className="flex items-center justify-between gap-3">
            <PlayerIdentity
              slug={player.slug}
              nickname={player.nickname}
              photo={player.photo}
              country={player.country}
            />
            {player.role === null ? null : (
              <Text as="span" size="overline" tone="subtle">
                {PLAYER_ROLE_LABEL[player.role]}
              </Text>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export type MatchLineupsProps = {
  match: Match
  className?: string
}

export function MatchLineups({ match, className }: MatchLineupsProps) {
  const [first, second] = match.teams
  const [firstLineup, secondLineup] = match.lineups

  if (firstLineup.length === 0 && secondLineup.length === 0) return null

  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <SectionHeading title="Составы" />
      <div className="grid gap-4 md:grid-cols-2">
        <LineupColumn
          teamName={first.team.name}
          players={firstLineup}
        />
        <LineupColumn
          teamName={second.team.name}
          players={secondLineup}
        />
      </div>
    </section>
  )
}
