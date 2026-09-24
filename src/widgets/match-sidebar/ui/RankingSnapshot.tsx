import Link from "next/link"

import { getTeamRankings, RankingChange, TeamLogo, teamHref } from "@/entities/team"
import { ROUTES } from "@/shared/config"
import { cn } from "@/shared/lib/style"

import { SidebarCard } from "./SidebarCard"

export type RankingSnapshotProps = {
  limit?: number
}

/** Верх официального рейтинга Valve (VRS) — по нему же считаются звёзды матчей. */
export async function RankingSnapshot({ limit = 10 }: RankingSnapshotProps) {
  const result = await getTeamRankings(limit)

  if (!result.ok || result.data.length === 0) return null

  return (
    <SidebarCard title="Рейтинг Valve" moreHref={ROUTES.rankings} moreLabel="Весь рейтинг">
      <ol className="flex flex-col py-1">
        {result.data.map((row) => (
          <li key={row.team.id}>
            <Link
              href={teamHref(row.team.slug)}
              className="group flex items-center gap-3 px-4 py-2 transition-colors duration-150 hover:bg-muted/70"
            >
              <span
                className={cn(
                  "w-5 shrink-0 text-right text-caption font-bold tabular-nums",
                  row.rank <= 3 ? "text-primary" : "text-subtle-foreground",
                )}
              >
                {row.rank}
              </span>
              <TeamLogo logo={row.team.logo} darkLogo={row.team.darkLogo} size={20} className="size-5" />
              <span className="min-w-0 flex-1 truncate text-caption font-semibold text-foreground transition-colors duration-150 group-hover:text-primary">
                {row.team.name}
              </span>
              <RankingChange change={row.change} className="text-overline" />
              {row.points === null ? null : (
                <span className="w-10 shrink-0 text-right text-overline tabular-nums tracking-normal text-subtle-foreground">
                  {row.points}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ol>
    </SidebarCard>
  )
}
