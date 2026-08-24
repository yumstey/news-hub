import { TeamIdentity } from "@/entities/team"
import { formatPrize } from "@/entities/tournament"
import type { StandingRow } from "@/entities/tournament"
import { SITE } from "@/shared/config"
import { cn } from "@/shared/lib/style"
import { EmptyState } from "@/shared/ui/empty-state"
import { SectionHeading } from "@/shared/ui/section-heading"

export type StandingsTableProps = {
  disciplineSlug: string
  standings: readonly StandingRow[]
  currency: string
  title?: string
  className?: string
}

export function StandingsTable({
  disciplineSlug,
  standings,
  currency,
  title = "Таблица",
  className,
}: StandingsTableProps) {
  if (standings.length === 0) {
    return (
      <EmptyState
        title="Таблица появится после первых матчей"
        description="Пока команды не сыграли ни одной серии, распределение мест не определено."
        className={className}
      />
    )
  }

  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <SectionHeading title={title} />
      <div className="overflow-x-auto rounded-surface border border-border bg-surface">
        <table className="w-full min-w-140 border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-overline uppercase text-subtle-foreground">
              <th scope="col" className="w-14 py-3 pl-4 text-left font-semibold">
                #
              </th>
              <th scope="col" className="py-3 text-left font-semibold">
                Команда
              </th>
              <th scope="col" className="px-3 py-3 text-left font-semibold">
                Место
              </th>
              <th scope="col" className="px-3 py-3 text-right font-semibold">
                В — П
              </th>
              <th scope="col" className="px-3 py-3 text-right font-semibold">
                Карты
              </th>
              <th scope="col" className="py-3 pr-4 text-right font-semibold">
                Призовые
              </th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => (
              <tr key={row.team.id} className="border-b border-border last:border-0">
                <td className="py-3 pl-4 text-sm font-bold tabular-nums text-foreground">
                  {row.position}
                </td>
                <td className="py-3">
                  <TeamIdentity
                    disciplineSlug={disciplineSlug}
                    slug={row.team.slug}
                    name={row.team.name}
                    logo={row.team.logo}
                    country={row.team.country}
                    size="sm"
                  />
                </td>
                <td className="px-3 py-3 text-caption text-muted-foreground">{row.placement}</td>
                <td className="px-3 py-3 text-right tabular-nums text-foreground">
                  {row.wins} — {row.losses}
                </td>
                <td
                  className={cn(
                    "px-3 py-3 text-right tabular-nums",
                    row.mapDiff > 0
                      ? "text-success"
                      : row.mapDiff < 0
                        ? "text-danger"
                        : "text-muted-foreground",
                  )}
                >
                  {row.mapDiff > 0 ? `+${row.mapDiff}` : row.mapDiff}
                </td>
                <td className="py-3 pr-4 text-right font-semibold tabular-nums text-foreground">
                  {row.prize > 0 ? (
                    formatPrize(row.prize, currency, SITE.locale)
                  ) : (
                    <span className="text-subtle-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
