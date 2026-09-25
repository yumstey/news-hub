import { MatchLine } from "@/entities/match"
import type { HeadToHead as HeadToHeadData, MatchSide } from "@/entities/match"
import { TeamLogo } from "@/entities/team"
import { cn } from "@/shared/lib/style"
import { pluralize } from "@/shared/lib/text"
import { SectionHeading } from "@/shared/ui/section-heading"

function Side({
  side,
  wins,
  total,
  mirrored = false,
}: {
  side: MatchSide
  wins: number
  total: number
  mirrored?: boolean
}) {
  return (
    <div className={cn("flex min-w-0 flex-1 items-center gap-3", mirrored && "flex-row-reverse text-right")}>
      <TeamLogo logo={side.team.logo} darkLogo={side.team.darkLogo} size={40} className="size-10" />
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-caption font-semibold text-foreground">{side.team.name}</span>
        <span className="text-overline tracking-normal text-subtle-foreground">
          {total === 0 ? "нет встреч" : `${Math.round((wins / total) * 100)}% побед`}
        </span>
      </div>
    </div>
  )
}

export type HeadToHeadProps = {
  teams: readonly [MatchSide, MatchSide]
  data: HeadToHeadData
}

/**
 * Личные встречи: кто и сколько раз обыгрывал соперника, с разбивкой по картам
 * и последними матчами — как в блоке head-to-head на HLTV.
 */
export function HeadToHead({ teams, data }: HeadToHeadProps) {
  if (data.played === 0) return null

  const [first, second] = teams
  const draws = data.played - data.firstWins - data.secondWins
  const firstShare = (data.firstWins / data.played) * 100
  const secondShare = (data.secondWins / data.played) * 100

  return (
    <section className="flex flex-col gap-4">
      <SectionHeading title="Личные встречи" />

      <div className="flex flex-col gap-4 rounded-surface border border-border bg-surface p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <Side side={first} wins={data.firstWins} total={data.played} />
          <div className="flex shrink-0 flex-col items-center gap-0.5">
            <span className="text-heading font-bold tabular-nums text-foreground">
              {data.firstWins} : {data.secondWins}
            </span>
            <span className="text-overline uppercase tracking-wider text-subtle-foreground">
              {pluralize(data.played, ["матч", "матча", "матчей"])}
            </span>
          </div>
          <Side side={second} wins={data.secondWins} total={data.played} mirrored />
        </div>

        <div aria-hidden="true" className="flex h-2 overflow-hidden rounded-full bg-muted">
          <span className="h-full bg-primary" style={{ width: `${firstShare}%` }} />
          {draws > 0 ? (
            <span className="h-full bg-border-strong" style={{ width: `${(draws / data.played) * 100}%` }} />
          ) : null}
          <span className="h-full bg-live" style={{ width: `${secondShare}%` }} />
        </div>

        <div className="grid grid-cols-2 gap-3 text-caption">
          <span className="text-muted-foreground">
            Карты: <span className="font-semibold text-foreground">{data.firstMapWins}</span> —{" "}
            <span className="font-semibold text-foreground">{data.secondMapWins}</span>
          </span>
          <span className="text-right text-muted-foreground">
            {draws === 0 ? null : `Ничьих: ${draws}`}
          </span>
        </div>
      </div>

      {data.recent.length === 0 ? null : (
        <div className="overflow-hidden rounded-surface border border-border bg-surface">
          <ul className="divide-y divide-border">
            {data.recent.map((match) => (
              <li key={match.id}>
                <MatchLine match={match} showDate />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
