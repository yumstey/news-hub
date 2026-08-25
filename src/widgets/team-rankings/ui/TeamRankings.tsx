import Link from "next/link"

import { getTeamRankings, RankingChange, TeamIdentity } from "@/entities/team"
import { ROUTES } from "@/shared/config"
import { cn } from "@/shared/lib/style"
import { EmptyState } from "@/shared/ui/empty-state"
import { SectionHeading } from "@/shared/ui/section-heading"

export type TeamRankingsProps = {
  limit?: number
  title?: string
  showMore?: boolean
  emptyLabel?: string
  emptyDescription?: string
  className?: string
}

export async function TeamRankings({
  limit,
  title,
  showMore = false,
  emptyLabel,
  emptyDescription,
  className,
}: TeamRankingsProps) {
  const result = await getTeamRankings(limit)

  if (!result.ok) {
    return (
      <EmptyState
        tone="danger"
        title="Рейтинг недоступен"
        description={result.error.message}
        className={className}
      />
    )
  }

  if (result.data.length === 0) {
    if (emptyLabel === undefined) return null

    return <EmptyState title={emptyLabel} description={emptyDescription} className={className} />
  }

  return (
    <section className={cn("flex flex-col gap-4", className)}>
      {title ? (
        <SectionHeading
          title={title}
          action={
            showMore ? (
              <Link
                href={ROUTES.rankings}
                className="text-caption font-medium text-primary transition-colors duration-150 hover:text-primary-hover"
              >
                Весь рейтинг
              </Link>
            ) : null
          }
        />
      ) : null}

      <div className="overflow-x-auto rounded-surface border border-border bg-surface">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-overline uppercase text-subtle-foreground">
              <th scope="col" className="w-14 py-3 pl-4 text-left font-semibold">
                #
              </th>
              <th scope="col" className="py-3 text-left font-semibold">
                Команда
              </th>
              <th scope="col" className="py-3 pr-4 text-right font-semibold">
                Очки
              </th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((row) => (
              <tr key={row.team.id} className="border-b border-border last:border-0 hover:bg-muted">
                <td className="py-3 pl-4">
                  <span className="flex items-center gap-2">
                    <span className="w-5 text-sm font-bold tabular-nums text-foreground">
                      {row.rank} 
                    </span>
                    <RankingChange change={row.change} />
                  </span>
                </td>
                <td className="py-3">
                  <TeamIdentity
                    slug={row.team.slug}
                    name={row.team.name}
                    logo={row.team.logo}
                    country={row.team.country}
                    size="sm"
                  />
                </td>
                <td className="py-3 pr-4 text-right font-semibold tabular-nums text-foreground">
                  {row.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function TeamRankingsSkeleton({ rows = 8, className }: { rows?: number; className?: string }) {
  const items = Array.from({ length: rows }, (_, index) => index)

  return (
    <div className={cn("flex flex-col gap-2 rounded-surface border border-border bg-surface p-4", className)}>
      {items.map((item) => (
        <div key={item} className="h-10 w-full rounded-sm bg-skeleton" />
      ))}
    </div>
  )
}
