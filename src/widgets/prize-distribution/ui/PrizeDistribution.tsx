import Link from "next/link"

import { teamHref, TeamLogo } from "@/entities/team"
import { formatPrize } from "@/entities/tournament"
import type { StandingRow } from "@/entities/tournament"
import { SITE } from "@/shared/config"
import { cn } from "@/shared/lib/style"
import { CountryTag } from "@/shared/ui/country-tag"
import { SectionHeading } from "@/shared/ui/section-heading"

const accentByPosition: Record<number, string> = {
  1: "border-warning/50 bg-warning-soft/40",
  2: "border-border-strong bg-muted",
  3: "border-danger/30 bg-danger-soft/30",
}

export type PrizeDistributionProps = {
  standings: readonly StandingRow[]
  currency: string
  title?: string
  className?: string
}

export function PrizeDistribution({
  standings,
  currency,
  title = "Распределение призовых",
  className,
}: PrizeDistributionProps) {
  const rows = standings.filter((row) => row.prize !== null && row.prize > 0)

  if (rows.length === 0) return null

  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <SectionHeading title={title} />

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((row) => (
          <li
            key={row.team.id}
            className={cn(
              row.position === 1 || row.position === 2 ? "sm:col-span-1 lg:col-span-2" : undefined,
            )}
          >
            <Link
              href={teamHref(row.team.slug)}
              className={cn(
                "relative flex h-full flex-col items-center gap-2 overflow-hidden rounded-surface border px-4 py-5 text-center transition-colors duration-150 hover:border-primary",
                accentByPosition[row.position] ?? "border-border bg-surface",
              )}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-6 left-1/2 size-32 -translate-x-1/2 opacity-10"
              >
                <TeamLogo
                  logo={row.team.logo}
                  darkLogo={row.team.darkLogo}
                  size={160}
                  className="size-32"
                />
              </span>

              <span className="relative flex items-center gap-2">
                <CountryTag country={row.team.country} />
                <span className="truncate text-sm font-bold text-foreground">{row.team.name}</span>
              </span>

              <span className="relative text-subheading font-bold text-muted-foreground">
                {row.placement}
              </span>

              <span className="relative text-lead font-bold tabular-nums text-foreground">
                {formatPrize(row.prize, currency, SITE.locale)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
