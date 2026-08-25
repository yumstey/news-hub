import { TrendingDown, TrendingUp } from "lucide-react"

import { getTeamRankings, TeamIdentity } from "@/entities/team"
import type { RankingRow } from "@/entities/team"
import { cn } from "@/shared/lib/style"
import { SectionHeading } from "@/shared/ui/section-heading"

const COLUMN_SIZE = 5

function Column({
  title,
  icon,
  rows,
  tone,
}: {
  title: string
  icon: React.ReactNode
  rows: readonly RankingRow[]
  tone: "up" | "down"
}) {
  if (rows.length === 0) return null

  return (
    <section className="flex flex-col gap-3 rounded-surface border border-border bg-surface p-4">
      <h3 className="flex items-center gap-2 text-caption font-bold uppercase tracking-wider text-muted-foreground">
        <span
          aria-hidden="true"
          className={tone === "up" ? "text-success" : "text-danger"}
        >
          {icon}
        </span>
        {title}
      </h3>

      <ul className="flex flex-col gap-2">
        {rows.map((row) => (
          <li
            key={row.team.id}
            className="flex min-h-11 items-center justify-between gap-3 border-b border-border pb-2 last:border-0 last:pb-0"
          >
            <TeamIdentity
              slug={row.team.slug}
              name={row.team.name}
              logo={row.team.logo}
              darkLogo={row.team.darkLogo}
              size="sm"
            />
            <span className="flex shrink-0 items-center gap-2 text-caption tabular-nums">
              <span className="text-subtle-foreground">#{row.rank}</span>
              <span
                className={cn(
                  "font-bold",
                  tone === "up" ? "text-success" : "text-danger",
                )}
              >
                {tone === "up" ? "+" : ""}
                {row.change}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export async function RankingMovers({ className }: { className?: string }) {
  const result = await getTeamRankings(30)

  if (!result.ok) return null

  const moved = result.data.filter(
    (row): row is RankingRow & { change: number } => row.change !== null && row.change !== 0,
  )

  if (moved.length === 0) return null

  const climbers = [...moved]
    .filter((row) => row.change > 0)
    .sort((left, right) => right.change - left.change)
    .slice(0, COLUMN_SIZE)

  const fallers = [...moved]
    .filter((row) => row.change < 0)
    .sort((left, right) => left.change - right.change)
    .slice(0, COLUMN_SIZE)

  if (climbers.length === 0 && fallers.length === 0) return null

  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <SectionHeading title="Движение за месяц" />

      <div className="grid gap-4 md:grid-cols-2">
        <Column
          title="Поднялись"
          icon={<TrendingUp className="size-4" />}
          rows={climbers}
          tone="up"
        />
        <Column
          title="Опустились"
          icon={<TrendingDown className="size-4" />}
          rows={fallers}
          tone="down"
        />
      </div>
    </section>
  )
}

export function RankingMoversSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="h-64 rounded-surface border border-border bg-skeleton" />
      <div className="h-64 rounded-surface border border-border bg-skeleton" />
    </div>
  )
}
