import { ChevronRight } from "lucide-react"
import Link from "next/link"

import { teamHref, TeamLogo } from "@/entities/team"
import type { Team } from "@/entities/team"
import { CountryTag } from "@/shared/ui/country-tag"

export function TeamCard({ team }: { team: Team }) {
  return (
    <Link
      href={teamHref(team.slug)}
      className="flex h-full min-h-20 animate-rise-in items-center gap-3 rounded-surface border border-border bg-surface p-4 transition-all duration-200 hover:-translate-y-px hover:border-border-strong hover:bg-muted/60 hover:shadow-surface active:translate-y-0 active:bg-muted sm:p-5"
    >
      {team.worldRanking === null ? null : (
        <span className="w-8 shrink-0 text-center text-sm font-bold tabular-nums text-subtle-foreground">
          {team.worldRanking}
        </span>
      )}

      <TeamLogo
        logo={team.logo}
        darkLogo={team.darkLogo}
        size={48}
        className="size-12 rounded-control"
      />

      <span className="flex min-w-0 flex-col gap-0.5">
        <h3 className="truncate text-subheading text-foreground">{team.name}</h3>
        <CountryTag
          country={team.country}
          showName
          className="text-caption text-muted-foreground"
        />
      </span>

      <ChevronRight aria-hidden="true" className="ml-auto size-5 shrink-0 text-subtle-foreground" />
    </Link>
  )
}

export function TeamsGridSkeleton() {
  const items = Array.from({ length: 9 }, (_, index) => index)

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div key={item} className="h-20 rounded-surface border border-border bg-skeleton" />
      ))}
    </div>
  )
}
